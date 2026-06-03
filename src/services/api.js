import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://docushield-backend-production-7bd0.up.railway.app/api";
const AUTH_TOKEN_STORAGE_KEY = 'docushield_access_token';
const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

// Request Interceptor to attach Authorization header and device fingerprint automatically
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      if (isDev && config.url?.includes('/auth/profile')) {
        console.debug('[Auth] profile request sent', { hasToken: true, url: config.url });
      }
    } else if (isDev && config.url?.includes('/auth/profile')) {
      console.debug('[Auth] profile request sent', { hasToken: false, url: config.url });
    }

    const fingerprint = localStorage.getItem('device_fingerprint');
    if (fingerprint) {
      config.headers['x-device-fingerprint'] = fingerprint;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to capture security expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired. Action required.');
    }
    return Promise.reject(error);
  }
);

export default api;
