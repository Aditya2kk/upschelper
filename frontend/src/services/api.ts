import axios from 'axios';

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL = envApiUrl
  ? (envApiUrl.endsWith('/api') ? envApiUrl : (envApiUrl.endsWith('/') ? `${envApiUrl}api` : `${envApiUrl}/api`))
  : '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor for token refresh / auth error handling
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          if (res.data.success) {
            const newToken = res.data.data.accessToken;
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
