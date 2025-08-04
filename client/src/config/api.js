// API Configuration
const getBaseURL = () => {
  // Get the current window location
  const { protocol, hostname } = window.location;
  
  // For development, use the backend port
  if (hostname === 'localhost') {
    return `${protocol}//${hostname}:5000`;
  }
  
  // For production, use the same domain
  return `${protocol}//${hostname}`;
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
