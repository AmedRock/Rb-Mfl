// useAuth — AuthContext üzerinden reactive auth state sağlar
// Geriye dönük uyumluluk korunmuştur: tüm import'lar çalışmaya devam eder.
export { useAuthContext as useAuth } from '../context/AuthContext';
import { API_BASE } from '../utils/apiConfig';

// ─── Auth gerektiren API helper'ları ───
export async function apiAuthPost(endpoint, body, headers) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST', headers, body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiAuthPut(endpoint, body, headers) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT', headers, body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiAuthDelete(endpoint, headers) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE', headers
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiAuthGet(endpoint, headers) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET', headers
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

