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
