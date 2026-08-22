import axios from 'axios';

// For V1 pure mock architecture, this is just a placeholder.
// In a real scenario with a backend, we'd configure Axios here with base URL,
// auth headers, interceptors, etc.

export const USE_MOCK = true; // Hardcoded to true for pure mock UI mode

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aToken') || localStorage.getItem('dToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
