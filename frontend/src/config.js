const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://work-evidence-backend-1076190408873.europe-west1.run.app'
  : '';

export { API_BASE_URL };