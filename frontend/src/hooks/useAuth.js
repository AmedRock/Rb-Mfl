// JWT Auth Hook — admin + player token yönetimi

const ADMIN_TOKEN_KEY = 'rbmfl_admin_token';
const PLAYER_TOKEN_KEY = 'rbmfl_player_token';
const PLAYER_DATA_KEY = 'rbmfl_player_data';

export function useAuth() {
  // ─── Admin ───
  const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

  const isAdmin = () => {
    const token = getAdminToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin' && payload.exp * 1000 > Date.now();
    } catch { return false; }
  };

  const loginAdmin = (token) => {
    // Admin girince oyuncu oturumunu kapat
    localStorage.removeItem(PLAYER_TOKEN_KEY);
    localStorage.removeItem(PLAYER_DATA_KEY);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  };

  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  const adminAuthHeader = () => ({
    'Authorization': `Bearer ${getAdminToken()}`,
    'Content-Type': 'application/json'
  });

  // ─── Player ───
  const getPlayerToken = () => localStorage.getItem(PLAYER_TOKEN_KEY);

  const isPlayer = () => {
    const token = getPlayerToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'player' && payload.exp * 1000 > Date.now();
    } catch { return false; }
  };

  const loginPlayer = (token, playerData) => {
    // Oyuncu girince admin oturumunu kapat
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.setItem(PLAYER_TOKEN_KEY, token);
    localStorage.setItem(PLAYER_DATA_KEY, JSON.stringify(playerData));
  };

  const logoutPlayer = () => {
    localStorage.removeItem(PLAYER_TOKEN_KEY);
    localStorage.removeItem(PLAYER_DATA_KEY);
  };

  const getPlayerData = () => {
    try {
      return JSON.parse(localStorage.getItem(PLAYER_DATA_KEY));
    } catch { return null; }
  };

  const playerAuthHeader = () => ({
    'Authorization': `Bearer ${getPlayerToken()}`,
    'Content-Type': 'application/json'
  });

  // ─── Eski uyumluluk (admin route'lar için) ───
  const login = loginAdmin;
  const logout = () => { logoutAdmin(); logoutPlayer(); };
  const authHeader = adminAuthHeader;
  const getToken = getAdminToken;

  return {
    // Admin
    isAdmin, loginAdmin, logoutAdmin, getAdminToken, adminAuthHeader,
    // Player
    isPlayer, loginPlayer, logoutPlayer, getPlayerToken, getPlayerData, playerAuthHeader,
    // Eski uyumluluk
    login, logout, authHeader, getToken
  };
}

// ─── Auth gerektiren API helper'ları ───
export async function apiAuthPost(endpoint, body, headers) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'POST', headers, body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiAuthPut(endpoint, body, headers) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'PUT', headers, body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiAuthDelete(endpoint, headers) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'DELETE', headers
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiAuthGet(endpoint, headers) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'GET', headers
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}
