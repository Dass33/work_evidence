# Work Evidence Tracking App

Simple web application for daily work evidence tracking with photo uploads and multi-language support.

## Quick Start

### Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend  
npm install
npm run dev
```

Visit http://localhost:3000

## Production Deployment Checklist

### 🔐 Security (CRITICAL)
- [ ] **Enable HTTPS** for all communication
- [ ] **Configure CORS** properly in `backend/server.js` - don't use `*` origin
- [ ] **Add rate limiting** for API endpoints (especially login)
- [ ] **Add input validation** and sanitization

### 🚀 Infrastructure  
- [ ] **Set up reverse proxy** (nginx/Apache)
- [ ] **Configure environment variables** properly
- [ ] **Set up SSL certificates** (Let's Encrypt)
- [ ] **Configure file upload limits** and storage
- [ ] **Set up monitoring** and logging
- [ ] **Configure auto-restart** (PM2, systemd)

### 🔧 Configuration Files to Update

**backend/.env:**
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=32-character-key
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-production-turso-token
```

**frontend - build configuration:**
```bash
npm run build
# Deploy dist/ folder to web server
```

### 🧪 Testing Before Production
- [ ] **Test all user flows** (login, work entry, admin view)
- [ ] **Test file uploads** with various file types/sizes
- [ ] **Test language switching**
- [ ] **Load test** with expected user count
- [ ] **Test mobile responsiveness**
