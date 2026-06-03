import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://docushield-backend-production-7bd0.up.railway.app/api";
  
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to attach device fingerprint automatically (continuous verification)
api.interceptors.request.use(
  (config) => {
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
