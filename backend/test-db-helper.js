const { createClient } = require('@libsql/client');
require('dotenv').config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

let backupData = {
  users: [],
  work_entries: []
};

async function backupDatabase() {
  console.log('📦 Backing up database state...');
  
  const usersResult = await db.execute('SELECT * FROM users');
  const workEntriesResult = await db.execute('SELECT * FROM work_entries');
  
  backupData.users = usersResult.rows;
  backupData.work_entries = workEntriesResult.rows;
  
  console.log(`✅ Backed up ${backupData.users.length} users and ${backupData.work_entries.length} work entries`);
}

async function restoreDatabase() {
  console.log('🔄 Restoring database to original state...');
  
  await db.execute('DELETE FROM work_entries');
  await db.execute('DELETE FROM users');
  
  for (const user of backupData.users) {
    await db.execute({
      sql: 'INSERT INTO users (id, username, password, role, created_at) VALUES (?, ?, ?, ?, ?)',
      args: [user.id, user.username, user.password, user.role, user.created_at]
    });
  }
  
  for (const entry of backupData.work_entries) {
    await db.execute({
      sql: 'INSERT INTO work_entries (id, user_id, work_date, start_time, end_time, description, photo_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [entry.id, entry.user_id, entry.work_date, entry.start_time, entry.end_time, entry.description, entry.photo_data, entry.created_at]
    });
  }
  
  console.log('✅ Database restored to original state');
}

async function clearTestData() {
  console.log('🧹 Clearing test data...');
  
  await db.execute("DELETE FROM work_entries WHERE user_id IN (SELECT id FROM users WHERE username LIKE '%_test')");
  await db.execute("DELETE FROM users WHERE username LIKE '%_test'");
  
  console.log('✅ Test data cleared');
}

module.exports = {
  backupDatabase,
  restoreDatabase,
  clearTestData
};