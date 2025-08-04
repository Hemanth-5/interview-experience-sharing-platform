// API Configuration
const getBaseURL = () => {
  // Get the current window location
  const { hostname } = window.location;
  
  // For development, use the backend port
  if (hostname === 'localhost') {
    return `http://${hostname}:5000`;
  }
  
  // For production, use the Render backend URL
  return 'https://psg-interview-experience-portal.onrender.com';
};

export const API_BASE_URL = getBaseURL();

// Helper function to create full API URLs
export const createApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

const apiConfig = {
  BASE_URL: API_BASE_URL,
  createUrl: createApiUrl
};

export default apiConfig;
