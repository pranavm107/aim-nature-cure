import axios from 'axios';
import { toast } from 'react-toastify';

import { mockDoctors, mockAppointments } from '../mocks/mockData';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const apiClient = axios.create({
  baseURL: backendUrl + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

if (USE_MOCK) {
  apiClient.defaults.adapter = async (config) => {
    console.log('[Mock Adapter] Intercepted:', config.method.toUpperCase(), config.url);
    let data = { success: true, message: 'Mock response' };

    if (config.url.includes('/admin/all-doctors')) {
      data.doctors = mockDoctors;
    } else if (config.url.includes('/appointments')) {
      data.appointments = mockAppointments;
    } else if (config.url.includes('/dashboard')) {
      data.dashData = {
        doctors: mockDoctors.length,
        appointments: mockAppointments.length,
        patients: 15,
        latestAppointments: mockAppointments.slice(0, 5),
        earnings: 1250,
      };
    } else if (config.url.includes('/doctor/profile')) {
      data.profileData = mockDoctors[0];
    } else if (config.url.includes('/login')) {
      data.token = config.url.includes('admin') ? 'mock-admin-token' : 'mock-doctor-token';
    }

    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    };
  };
}

// Interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const aToken = localStorage.getItem('aToken');
    const dToken = localStorage.getItem('dToken');
    if (aToken) {
      config.headers.aToken = aToken;
    } else if (dToken) {
      config.headers.dToken = dToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // If the server returns success: false with a message, throw an error to be caught by the service
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || 'Operation failed'));
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('aToken');
      localStorage.removeItem('dToken');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'Network Error';
    toast.error(message);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
