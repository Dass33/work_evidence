#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment script...${NC}"

# Function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ Error: '$1' command not found. Please install it to proceed.${NC}"
        return 1
    fi
}

# 1. Pre-flight checks
echo "🔍 Checking prerequisites..."
REQUIRED_TOOLS=("node" "npm" "git" "ssh" "gcloud")
MISSING_TOOLS=0

for tool in "${REQUIRED_TOOLS[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        echo -e "${RED}❌ Missing tool: $tool${NC}"
        MISSING_TOOLS=1
    else
        echo -e "${GREEN}✓ Found $tool${NC}"
    fi
done

if [ $MISSING_TOOLS -eq 1 ]; then
    echo -e "${RED}⚠️  Some required tools are missing. Deployment cannot proceed automatically.${NC}"
    echo "Please install the missing tools and try again."
    exit 1
fi

# 2. Frontend Deployment
echo -e "\n${GREEN}📦 Building and deploying Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Building frontend..."
npm run build

echo "Deploying to GitHub Pages..."
# Ensure git knows who we are (if running in CI/CD without config)
# git config user.name "Deploy Bot"
# git config user.email "deploy@example.com"

npm run deploy || {
    echo -e "${RED}❌ Frontend deployment failed.${NC}"
    echo "Possible reasons:"
    echo "1. SSH keys not configured for GitHub."
    echo "2. Network issues."
    exit 1
}
cd ..

# 3. Backend Deployment
echo -e "\n${GREEN}☁️  Preparing Backend deployment...${NC}"
cd backend

if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: backend/.env file not found!${NC}"
    echo "Please create backend/.env with the following variables:"
    echo "TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, JWT_SECRET, GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_STORAGE_BUCKET, GOOGLE_SHEETS_ID"
    exit 1
fi

# Safely load .env variables
echo "Loading environment variables..."
set -a
source <(grep -v '^#' .env | sed -E 's/^([^=]+)=(.*)$/\1="\2"/g')
set +a

# Verify critical variables
REQUIRED_VARS=("TURSO_DATABASE_URL" "TURSO_AUTH_TOKEN" "JWT_SECRET" "GOOGLE_CLOUD_PROJECT_ID" "GOOGLE_CLOUD_STORAGE_BUCKET" "GOOGLE_SHEETS_ID")
MISSING_VARS=0

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing environment variable: $var${NC}"
        MISSING_VARS=1
    fi
done

if [ $MISSING_VARS -eq 1 ]; then
    echo -e "${RED}⚠️  Aborting backend deployment due to missing configuration.${NC}"
    exit 1
fi

echo "Deploying to Google Cloud Run..."
# Check if gcloud is authenticated
if ! gcloud auth print-identity-token &> /dev/null; then
    echo -e "${YELLOW}⚠️  gcloud might not be authenticated. Attempting to deploy anyway (it might prompt for login)...${NC}"
fi

gcloud run deploy work-evidence-backend \
  --source . \
  --platform managed \
  --region europe-west1 \
  --project "${GOOGLE_CLOUD_PROJECT_ID}" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 0.5 \
  --max-instances 3 \
  --set-env-vars="TURSO_DATABASE_URL=${TURSO_DATABASE_URL},TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN},JWT_SECRET=${JWT_SECRET},GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID},GOOGLE_CLOUD_STORAGE_BUCKET=${GOOGLE_CLOUD_STORAGE_BUCKET},GOOGLE_SHEETS_ID=${GOOGLE_SHEETS_ID}"

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo "Frontend: Check your GitHub Pages URL (e.g. https://dass33.github.io/work_evidence/)"
echo "Backend: Check Google Cloud Console for the service URL"
