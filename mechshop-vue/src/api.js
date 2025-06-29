const API_URL = 'http://localhost:3001/api';

let token = localStorage.getItem('token') || '';

export function setToken(newToken) {
  token = newToken;
  localStorage.setItem('token', token);
}
export function clearToken() {
  token = '';
  localStorage.removeItem('token');
}
function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Auth
export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const response = await res.json();
  localStorage.setItem('token', response.token);
  return response;
}

// Dashboard & Reports
export async function getDashboard() {
  const res = await fetch(`${API_URL}/dashboard`, { headers: authHeaders() });
  return await res.json();
}
export async function getReports(params = {}) {
  const url = new URL(`${API_URL}/reports`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url, { headers: authHeaders() });
  return await res.json();
}

// Inventory
export async function getInventory() {
  const res = await fetch(`${API_URL}/inventory`, { headers: authHeaders() });
  return await res.json();
}
export async function addInventory(part) {
  // Not used directly, inventory is updated via purchases
}
export async function updateInventory(id, part) {
  const res = await fetch(`${API_URL}/inventory/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(part)
  });
  return await res.json();
}
export async function deleteInventory(id) {
  // Not used directly, inventory is updated via purchases
}

// Sales
export async function getSales() {
  const res = await fetch(`${API_URL}/sales`, { headers: authHeaders() });
  return await res.json();
}
export async function addSale(sale) {
  const res = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(sale)
  });
  return await res.json();
}
export async function getInvoice(saleId) {
  const res = await fetch(`${API_URL}/sales/${saleId}/invoice`, { headers: authHeaders() });
  return await res.json();
}

// Purchases
export async function getPurchases() {
  const res = await fetch(`${API_URL}/purchases`, { headers: authHeaders() });
  return await res.json();
}
export async function addPurchase(purchase) {
  const res = await fetch(`${API_URL}/purchases`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(purchase)
  });
  return await res.json();
}

// Customers
export async function getCustomers() {
  const res = await fetch(`${API_URL}/customers`, { headers: authHeaders() });
  return await res.json();
}
export async function getCustomerByPhone(phone) {
  const res = await fetch(`${API_URL}/customers/phone/${phone}`, { headers: authHeaders() });
  if (res.ok) return await res.json();
  return null;
}
export async function addOrGetCustomer(customer) {
  const res = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(customer)
  });
  return await res.json();
}
export async function getCustomerHistory(membership_no) {
  const res = await fetch(`${API_URL}/customers/${membership_no}/history`, { headers: authHeaders() });
  return await res.json();
}

// Suppliers
export async function getSuppliers() {
  const res = await fetch(`${API_URL}/suppliers`);
  return await res.json();
}

export async function addSupplier(supplier) {
  const res = await fetch(`${API_URL}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier)
  });
  return await res.json();
}

// Audit Log (admin)
export async function getAuditLog() {
  const res = await fetch(`${API_URL}/audit-log`, { headers: authHeaders() });
  return await res.json();
}

// Notifications (admin)
export async function sendNotification(data) {
  const res = await fetch(`${API_URL}/notify`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

// Add similar functions for sales, purchases, customers, suppliers as needed 