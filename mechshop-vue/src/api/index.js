// Core API functions
import { API_URL, authHeaders } from './config';

// Import API modules
import * as invoices from './invoices';

// Export all API functions
export {
  invoices,
  API_URL,
  authHeaders
};

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  throw error;
};

// Auth API
export const login = async (username, password) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Inventory API
export const getInventory = async () => {
  try {
    const res = await fetch(`${API_URL}/inventory`, { headers: authHeaders() });
    return await res.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Sales API
export const getSales = async () => {
  try {
    const res = await fetch(`${API_URL}/sales`, { headers: authHeaders() });
    return await res.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Customers API
export const getCustomers = async () => {
  try {
    const res = await fetch(`${API_URL}/customers`, { headers: authHeaders() });
    return await res.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Dashboard API
export const getDashboardData = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard`, { headers: authHeaders() });
    return await res.json();
  } catch (error) {
    return handleApiError(error);
  }
};
