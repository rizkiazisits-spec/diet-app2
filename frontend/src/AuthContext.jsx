import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const login = useCallback((accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('profile_name');
    localStorage.removeItem('profile_avatar');
    localStorage.removeItem('profile_goal');
    localStorage.removeItem('profile_deadline');
    setToken(null);
    setUser(null);
  }, []);

  // Fetch profile whenever token changes
  useEffect(() => {
    if (!token) { setUser(null); return; }
    getProfile()
      .then((r) => {
        const u = r.data;
        setUser(u);
        if (u.name) localStorage.setItem('profile_name', u.name);
        if (u.avatar_url) localStorage.setItem('profile_avatar', u.avatar_url);
        if (u.goal) localStorage.setItem('profile_goal', u.goal);
        if (u.deadline) localStorage.setItem('profile_deadline', u.deadline);
      })
      .catch(() => logout());
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
