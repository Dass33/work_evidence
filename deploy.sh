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

echo "📄 Loading environment variables from .env file..."
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️ Warning: .env file not found in backend directory"
fi

gcloud run deploy work-evidence-backend \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 0.5 \
  --max-instances 3 \
  --set-env-vars="TURSO_DATABASE_URL=$TURSO_DATABASE_URL,TURSO_AUTH_TOKEN=$TURSO_AUTH_TOKEN,JWT_SECRET=$JWT_SECRET,GOOGLE_CLOUD_PROJECT_ID=$GOOGLE_CLOUD_PROJECT_ID,GOOGLE_CLOUD_STORAGE_BUCKET=$GOOGLE_CLOUD_STORAGE_BUCKET,GOOGLE_SHEETS_ID=$GOOGLE_SHEETS_ID"

echo "✅ Deployment complete!"
echo "Frontend: Check your GitHub Pages URL"
echo "Backend: Check Google Cloud Console for the service URL"
