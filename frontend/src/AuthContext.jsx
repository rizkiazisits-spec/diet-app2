import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((accessToken, refreshToken) => {
    localStorage.removeItem('profile_name');
    localStorage.removeItem('profile_avatar');
    localStorage.removeItem('profile_goal');
    localStorage.removeItem('profile_deadline');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('chat_history');
    
    localStorage.setItem('token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('profile_name');
    localStorage.removeItem('profile_avatar');
    localStorage.removeItem('profile_goal');
    localStorage.removeItem('profile_deadline');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('chat_history');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  // Fetch profile whenever token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getProfile()
      .then((r) => {
        const u = r.data;
        setUser(u);
        if (u.name) localStorage.setItem('profile_name', u.name);
        if (u.avatar_url) localStorage.setItem('profile_avatar', u.avatar_url);
        if (u.goal) localStorage.setItem('profile_goal', u.goal);
        if (u.deadline) localStorage.setItem('profile_deadline', u.deadline);
        if (u.berat_badan && u.tinggi_badan) {
          localStorage.setItem('onboarding_completed', 'true');
        } else {
          localStorage.removeItem('onboarding_completed');
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
