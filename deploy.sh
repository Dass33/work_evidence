#!/bin/bash

set -e

echo "🚀 Starting deployment..."

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🌐 Deploying frontend to GitHub Pages..."
npm run deploy

echo "☁️ Deploying backend to Google Cloud Run..."
cd ../backend
gcloud run deploy work-evidence-backend \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10

echo "✅ Deployment complete!"
echo "Frontend: Check your GitHub Pages URL"
echo "Backend: Check Google Cloud Console for the service URL"