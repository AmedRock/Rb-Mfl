// JWT Auth Hook - token localStorage'da tutulur

const TOKEN_KEY = 'rbmfl_admin_token';

export function useAuth() {
  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const isAdmin = () => {
    const token = getToken();
    if (!token) return false;
    try {
      // Token'ın süresini kontrol et (basit decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const login = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
  };

  const authHeader = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  });

  return { isAdmin, login, logout, getToken, authHeader };
}

// Auth gerektiren API çağrısı
export async function apiAuthPost(endpoint, body, authHeader) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiAuthPut(endpoint, body, authHeader) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'PUT',
    headers: authHeader,
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiAuthDelete(endpoint, authHeader) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'DELETE',
    headers: authHeader
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}
