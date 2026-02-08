// API base URL - adjust this based on your environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers with JWT token
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export {
  API_URL,
  authHeaders
};
