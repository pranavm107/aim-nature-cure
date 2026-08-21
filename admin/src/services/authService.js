import { mockProfile, mockCredentials } from '../mocks/mockData';

export const authService = {
  loginAdmin: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === mockCredentials.admin.email && password === mockCredentials.admin.password) {
      return { success: true, token: 'mock-admin-token' };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  loginDoctor: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === mockCredentials.doctor.email && password === mockCredentials.doctor.password) {
      return { success: true, token: 'mock-doctor-token' };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  getProfile: async (role) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, data: mockProfile[role] };
  }
};
