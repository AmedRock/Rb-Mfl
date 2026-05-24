import { createContext, useContext, useState, useCallback } from 'react';

const ADMIN_TOKEN_KEY  = 'rbmfl_admin_token';
const PLAYER_TOKEN_KEY = 'rbmfl_player_token';
const PLAYER_DATA_KEY  = 'rbmfl_player_data';

// ── yardımcılar ──────────────────────────────────────────────────────────────
function decodeRole(key, expectedRole) {
  const token = localStorage.getItem(key);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === expectedRole && payload.exp * 1000 > Date.now();
  } catch { return false; }
}

function initialAuthState() {
  if (decodeRole(ADMIN_TOKEN_KEY, 'admin'))   return 'admin';
  if (decodeRole(PLAYER_TOKEN_KEY, 'player')) return 'player';
  return null;
}

// ── context ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(initialAuthState); // 'admin' | 'player' | null

  // Admin login
  const loginAdmin = useCallback((token) => {
    localStorage.removeItem(PLAYER_TOKEN_KEY);
    localStorage.removeItem(PLAYER_DATA_KEY);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setAuthState('admin');
  }, []);

  // Player login
  const loginPlayer = useCallback((token, playerData) => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.setItem(PLAYER_TOKEN_KEY, token);
    localStorage.setItem(PLAYER_DATA_KEY, JSON.stringify(playerData));
    setAuthState('player');
  }, []);

  // Logout (her ikisi için de)
  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(PLAYER_TOKEN_KEY);
    localStorage.removeItem(PLAYER_DATA_KEY);
    setAuthState(null);
  }, []);

  // Token/header getters (senkron, localStorage'dan)
  const getAdminToken  = () => localStorage.getItem(ADMIN_TOKEN_KEY);
  const getPlayerToken = () => localStorage.getItem(PLAYER_TOKEN_KEY);
  const getPlayerData  = () => {
    try { return JSON.parse(localStorage.getItem(PLAYER_DATA_KEY)); }
    catch { return null; }
  };

  const adminAuthHeader  = () => ({ 'Authorization': `Bearer ${getAdminToken()}`,  'Content-Type': 'application/json' });
  const playerAuthHeader = () => ({ 'Authorization': `Bearer ${getPlayerToken()}`, 'Content-Type': 'application/json' });

  // Geriye dönük uyumluluk
  const isAdmin  = () => authState === 'admin';
  const isPlayer = () => authState === 'player';
  const logoutAdmin  = logout;
  const logoutPlayer = logout;

  return (
    <AuthContext.Provider value={{
      authState,          // 'admin' | 'player' | null  — reactive!
      isAdmin, isPlayer,
      loginAdmin, loginPlayer,
      logout, logoutAdmin, logoutPlayer,
      getAdminToken, getPlayerToken, getPlayerData,
      adminAuthHeader, playerAuthHeader,
      // eski uyumluluk
      login: loginAdmin,
      authHeader: adminAuthHeader,
      getToken: getAdminToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── hook ─────────────────────────────────────────────────────────────────────
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
