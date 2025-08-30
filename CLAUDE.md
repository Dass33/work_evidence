# Work Evidence App

Simple web application for tracking daily work evidence with photo uploads and multi-language support.

## Tech Stack
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** Turso (LibSQL)
- **Auth:** JWT tokens
- **Photo Storage:** Google Cloud Storage (multiple photos per entry)
- **i18n:** react-i18next (Czech, Uzbek, English)

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend  
```bash
cd frontend
npm install
npm run dev
```

## Database Schema
- **users:** id, username, password (hashed), role (worker/admin)
- **work_entries:** id, user_id, work_date, start_time, end_time, description, project_id
- **work_entry_photos:** id, work_entry_id, photo_url, original_filename, file_size, upload_order
- **projects:** id, name, is_hidden

## Features
- User authentication (JWT)
- Daily work form (from/to times, description, multiple photos, project selection)
- Worker dashboard (own entries)
- Admin dashboard (all entries, calendar view, user management, project management)
- Multi-language support (Czech, Uzbek, English)
- Multiple photo upload with client-side compression (stored in Google Cloud Storage)

## File Structure
```
work_evidence/
├── backend/
│   ├── server.js (Express server)
│   └── .env (Turso credentials)
└── frontend/
    ├── src/
    │   ├── pages/ (Login, Dashboard, WorkForm, AdminView)
    │   ├── components/ (Header, etc.)
    │   └── i18n.js (translations)
    └── dist/ (built files)
```

## Key Implementation Notes
- Turso (LibSQL) cloud database for production-ready storage
- Google Cloud Storage for photo storage with signed URLs for security
- JWT stored in localStorage
- Multiple photos per work entry with client-side compression
- Admin role can view all work entries, manage users and projects
- Workers can only see their own entries
- Project assignment system for better work organization

## Environment Variables
```
# Database
TURSO_DATABASE_URL=libsql://workevidence-dass33.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=your-jwt-secret

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=work-evidence-photos
GOOGLE_CLOUD_KEY_FILE=./service-account-key.json
```

## Setup Requirements
1. **Database**: Turso account and database setup
2. **Google Cloud Storage**: See `GOOGLE_CLOUD_SETUP.md` for detailed setup instructions
3. **Service Account**: Google Cloud service account key file

## Commands to remember
- `npm run dev` - Start development servers
- `npm run build` - Build frontend for production
- `npm install` - Install dependencies

## Deployment

### Prerequisites
- Configure gcloud CLI: `gcloud auth login` and `gcloud config set project YOUR_PROJECT_ID`
- Make sure you have a GitHub repository set up for GitHub Pages

### Deploy
```bash
./deploy.sh
```

This script will:
- Deploy frontend to GitHub Pages
- Deploy backend to Google Cloud Run