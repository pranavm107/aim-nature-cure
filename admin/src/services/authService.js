import apiClient from './apiClient';
import { mockProfile, mockCredentials } from '../mocks/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const authService = {
  loginAdmin: async (email, password) => {
    if (USE_MOCK) {
      if (email === mockCredentials.admin.email && password === mockCredentials.admin.password) {
        return { success: true, token: 'mock-admin-token' };
      }
      return { success: false, message: 'Invalid credentials' };
    }
    const { data } = await apiClient.post('/admin/login', { email, password });
    return data;
  },

  loginDoctor: async (email, password) => {
    if (USE_MOCK) {
      if (email === mockCredentials.doctor.email && password === mockCredentials.doctor.password) {
        return { success: true, token: 'mock-doctor-token' };
      }
      return { success: false, message: 'Invalid credentials' };
    }
    const { data } = await apiClient.post('/doctor/login', { email, password });
    return data;
  },

  getProfile: async (role) => {
    if (USE_MOCK) {
      return { success: true, data: mockProfile[role] };
    }
    const { data } = await apiClient.get(`/${role}/profile`);
    return data;
  }
};
