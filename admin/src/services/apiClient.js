import axios from 'axios';

// For V1 pure mock architecture, this is just a placeholder.
// In a real scenario with a backend, we'd configure Axios here with base URL,
// auth headers, interceptors, etc.

export const USE_MOCK = true; // Hardcoded to true for pure mock UI mode

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8088';

const apiClient = axios.create({
  baseURL: `${backendUrl}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('aToken') || localStorage.getItem('dToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Automatically pass doctorId for all doctor API requests if available
  const doctorId = localStorage.getItem('doctorId');
  if (doctorId) {
    config.headers['doctorId'] = doctorId;
  }
  
  return config;
});

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if we're already on login or auth endpoints
      if (!window.location.pathname.includes('/login') && 
          !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('aToken');
        localStorage.removeItem('dToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
