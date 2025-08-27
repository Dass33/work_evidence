# Work Evidence App

Simple web application for tracking daily work evidence with photo uploads and multi-language support.

## Tech Stack
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** Turso (LibSQL)
- **Auth:** JWT tokens
- **Photo Storage:** BLOB in database (base64 API interface)
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
- **work_entries:** id, user_id, work_date, start_time, end_time, description, photo_data (BLOB)

## Features
- User authentication (JWT)
- Daily work form (from/to times, description, photo)
- Worker dashboard (own entries)
- Admin dashboard (all entries, calendar view)
- Multi-language support (Czech, Uzbek)
- Photo upload with client-side compression (stored as BLOB in database)

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
- JWT stored in localStorage
- Photos compressed client-side and stored as BLOB in Turso database (33% more efficient than base64)
- Admin role can view all work entries
- Workers can only see their own entries

## Environment Variables
```
TURSO_DATABASE_URL=libsql://workevidence-dass33.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=your-jwt-secret
```

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