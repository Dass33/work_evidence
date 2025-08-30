const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@libsql/client');
const { Storage } = require('@google-cloud/storage');
const { google } = require('googleapis');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CLOUD_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function initDatabase() {
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'worker',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  await db.execute(`CREATE TABLE IF NOT EXISTS work_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    photo_data BLOB,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    is_hidden INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS work_entry_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_entry_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    original_filename TEXT,
    file_size INTEGER,
    upload_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_entry_id) REFERENCES work_entries (id) ON DELETE CASCADE
  )`);

  try {
    const columns = await db.execute('PRAGMA table_info(work_entries)');
    const hasPhotoData = columns.rows.some(col => col.name === 'photo_data');
    const hasProjectId = columns.rows.some(col => col.name === 'project_id');
    
    if (!hasPhotoData) {
      console.log('Adding photo_data column to work_entries table');
      await db.execute('ALTER TABLE work_entries ADD COLUMN photo_data BLOB');
    }

    if (!hasProjectId) {
      console.log('Adding project_id column to work_entries table');
      await db.execute('ALTER TABLE work_entries ADD COLUMN project_id INTEGER REFERENCES projects(id)');
    }

    const foreignKeys = await db.execute('PRAGMA foreign_key_list(work_entries)');
    const hasCascadeDelete = foreignKeys.rows.some(fk => 
      fk.table === 'users' && fk.on_delete === 'CASCADE'
    );

    if (!hasCascadeDelete && foreignKeys.rows.length > 0) {
      console.log('Updating work_entries table to add CASCADE delete constraint and remove unused photo_path column');
      
      await db.execute('PRAGMA foreign_keys=OFF');
      
      try {
        await db.execute('DROP TABLE IF EXISTS work_entries_new');
      } catch (e) {}
      
      await db.execute(`CREATE TABLE work_entries_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        work_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        description TEXT,
        photo_data BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`);
      
      await db.execute(`INSERT INTO work_entries_new (id, user_id, work_date, start_time, end_time, description, photo_data, created_at)
        SELECT id, user_id, work_date, start_time, end_time, description, photo_data, created_at FROM work_entries`);
      
      await db.execute('DROP TABLE work_entries');
      await db.execute('ALTER TABLE work_entries_new RENAME TO work_entries');
      
      await db.execute('PRAGMA foreign_keys=ON');
      console.log('Successfully updated foreign key constraint and removed unused photo_path column');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

initDatabase().catch(console.error);

async function uploadToGCS(buffer, filename) {
  try {
    const file = bucket.file(`work-photos/${Date.now()}-${filename}`);
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg',
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', () => {
        resolve(`gs://${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${file.name}`);
      });
      stream.end(buffer);
    });
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw error;
  }
}

async function getSignedUrl(photoUrl) {
  try {
    const fileName = photoUrl.replace(`gs://${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/`, '');
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

async function appendToGoogleSheets(workDate, username, projectName, startTime, endTime, description) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
      console.log('Google Sheets ID not configured, skipping sheets update');
      return;
    }

    const values = [
      [workDate, username, projectName || '', startTime, endTime, description || '']
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:F',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values,
      },
    });

    console.log('Successfully added row to Google Sheets');
  } catch (error) {
    console.error('Error appending to Google Sheets:', error.message);
  }
}



const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/register', async (req, res) => {
  const { username, password, role = 'worker' } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.execute({
      sql: 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      args: [username, hashedPassword, role]
    });
    
    res.json({ message: 'User created successfully', userId: Number(result.lastInsertRowid) });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET
    );
    
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/work-entries', authenticateToken, async (req, res) => {
  const { work_date, start_time, end_time, description, photos, project_id } = req.body;
  
  try {
    // Create work entry first
    const result = await db.execute({
      sql: 'INSERT INTO work_entries (user_id, work_date, start_time, end_time, description, project_id) VALUES (?, ?, ?, ?, ?, ?)',
      args: [req.user.userId, work_date, start_time, end_time, description, project_id || null]
    });
    
    const entryId = Number(result.lastInsertRowid);
    
    // Upload photos to GCS and save references
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.data) {
          try {
            const base64Data = photo.data.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            
            const filename = photo.name || `photo-${i + 1}.jpg`;
            const gcsUrl = await uploadToGCS(buffer, filename);
            
            await db.execute({
              sql: 'INSERT INTO work_entry_photos (work_entry_id, photo_url, original_filename, file_size, upload_order) VALUES (?, ?, ?, ?, ?)',
              args: [entryId, gcsUrl, filename, buffer.length, i]
            });
          } catch (photoError) {
            console.error(`Error uploading photo ${i + 1}:`, photoError);
            // Continue with other photos even if one fails
          }
        }
      }
    }
    
    // Add entry to Google Sheets
    try {
      // Get username and project name for the sheets entry
      const userResult = await db.execute({
        sql: 'SELECT username FROM users WHERE id = ?',
        args: [req.user.userId]
      });
      
      let projectName = null;
      if (project_id) {
        const projectResult = await db.execute({
          sql: 'SELECT name FROM projects WHERE id = ?',
          args: [project_id]
        });
        projectName = projectResult.rows[0]?.name || null;
      }
      
      const username = userResult.rows[0]?.username || 'Unknown';
      
      await appendToGoogleSheets(
        work_date, 
        username, 
        projectName, 
        start_time, 
        end_time, 
        description
      );
    } catch (sheetsError) {
      console.error('Google Sheets update failed (continuing with work entry creation):', sheetsError);
    }
    
    res.json({ message: 'Work entry saved successfully', entryId });
  } catch (error) {
    console.error('Work entry creation error:', error);
    res.status(500).json({ error: 'Failed to save work entry' });
  }
});

app.get('/api/work-entries', authenticateToken, async (req, res) => {
  try {
    let result;
    
    if (req.user.role === 'admin') {
      result = await db.execute(`
        SELECT we.*, u.username, p.name as project_name 
        FROM work_entries we 
        JOIN users u ON we.user_id = u.id 
        LEFT JOIN projects p ON we.project_id = p.id
        ORDER BY we.work_date DESC
      `);
    } else {
      result = await db.execute({
        sql: `SELECT we.*, p.name as project_name 
              FROM work_entries we 
              LEFT JOIN projects p ON we.project_id = p.id
              WHERE we.user_id = ? 
              ORDER BY we.work_date DESC`,
        args: [req.user.userId]
      });
    }
    
    // Fetch photos for each entry
    const entriesWithPhotos = await Promise.all(result.rows.map(async (entry) => {
      const photosResult = await db.execute({
        sql: 'SELECT photo_url, original_filename, upload_order FROM work_entry_photos WHERE work_entry_id = ? ORDER BY upload_order ASC',
        args: [entry.id]
      });
      
      // Generate signed URLs for photos
      const photos = await Promise.all(photosResult.rows.map(async (photo) => {
        const signedUrl = await getSignedUrl(photo.photo_url);
        return {
          url: signedUrl,
          filename: photo.original_filename,
          order: photo.upload_order
        };
      }));
      
      return {
        ...entry,
        photos: photos
      };
    }));
    
    res.json(entriesWithPhotos);
  } catch (error) {
    console.error('Error fetching work entries:', error);
    res.status(500).json({ error: 'Failed to fetch work entries' });
  }
});

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await db.execute(`
      SELECT id, username, role, created_at FROM users 
      ORDER BY username ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/users', authenticateToken, async (req, res) => {
  const { username, password, role = 'worker' } = req.body;
  
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.execute({
      sql: 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      args: [username, hashedPassword, role]
    });
    
    res.json({ 
      message: 'User created successfully', 
      userId: Number(result.lastInsertRowid),
      user: { id: Number(result.lastInsertRowid), username, role }
    });
  } catch (error) {
    console.error('User creation error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (req.user.userId.toString() === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const userCheck = await db.execute({
      sql: 'SELECT id, username, role FROM users WHERE id = ?',
      args: [userId]
    });
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [userId]
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    let result;
    
    if (req.user.role === 'admin') {
      result = await db.execute(`
        SELECT id, name, is_hidden, created_at FROM projects 
        ORDER BY name ASC
      `);
    } else {
      result = await db.execute(`
        SELECT id, name FROM projects 
        WHERE is_hidden = 0
        ORDER BY name ASC
      `);
    }
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/admin/projects', authenticateToken, async (req, res) => {
  const { name, is_hidden = 0 } = req.body;
  
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const result = await db.execute({
      sql: 'INSERT INTO projects (name, is_hidden) VALUES (?, ?)',
      args: [name, is_hidden ? 1 : 0]
    });
    
    res.json({ 
      message: 'Project created successfully', 
      projectId: Number(result.lastInsertRowid),
      project: { id: Number(result.lastInsertRowid), name, is_hidden: is_hidden ? 1 : 0 }
    });
  } catch (error) {
    console.error('Project creation error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Project name already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/projects/:projectId', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { name, is_hidden } = req.body;
  
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const projectCheck = await db.execute({
      sql: 'SELECT id FROM projects WHERE id = ?',
      args: [projectId]
    });
    
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    await db.execute({
      sql: 'UPDATE projects SET name = ?, is_hidden = ? WHERE id = ?',
      args: [name, is_hidden ? 1 : 0, projectId]
    });
    
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Project update error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Project name already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/projects/:projectId', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const projectCheck = await db.execute({
      sql: 'SELECT id, name FROM projects WHERE id = ?',
      args: [projectId]
    });
    
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    await db.execute({
      sql: 'DELETE FROM projects WHERE id = ?',
      args: [projectId]
    });
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});