import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : ''
  )
});

// Attach token to every request
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-refresh token on 401 Unauthorized errors
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized and request has not been retried yet
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const baseURL = API.defaults.baseURL || '';
          const url = baseURL ? `${baseURL}/auth/refresh` : '/auth/refresh';
          const res = await axios.post(url, { refresh_token: refreshToken });
          
          const { access_token, refresh_token } = res.data;
          
          // Store refreshed tokens
          if (access_token) {
            localStorage.setItem('token', access_token);
            if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
            
            // Retry original request with the new access token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return API(originalRequest);
          }
        } catch (refreshErr) {
          // Refresh failed (invalid/expired refresh token)
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          return Promise.reject(refreshErr);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const register = (email, password) =>
  API.post('/auth/register', { email, password });

export const login = (email, password) =>
  API.post('/auth/login', { email, password });

export const getProfile = () => API.get('/auth/me');

export const updateProfile = (data) => API.put('/auth/profile', data);

export const chat = (message) => API.post('/chat/', { message });

export const getFoodHistory = () => API.get('/history/food');

export const getExerciseHistory = () => API.get('/history/exercise');

export default API;
