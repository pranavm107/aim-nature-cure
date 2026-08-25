import { mockProfile, mockCredentials } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

export const authService = {
  loginAdmin: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = getStore('mockUsers');
    const user = users.find(u => u.email === email && u.password === password && u.role === 'admin' && u.status === 'Active');
    
    if (user) {
      return { success: true, token: 'mock-admin-token', mustChangePassword: user.mustChangePassword };
    }
    // Fallback to legacy mockCredentials if not in store
    if (email === mockCredentials.admin.email && password === mockCredentials.admin.password) {
      return { success: true, token: 'mock-admin-token', mustChangePassword: false };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  loginDoctor: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = getStore('mockUsers');
    const user = users.find(u => u.email === email && u.password === password && u.role === 'doctor' && u.status === 'Active');
    
    if (user) {
      return { success: true, token: 'mock-doctor-token', mustChangePassword: user.mustChangePassword };
    }
    // Fallback to legacy mockCredentials if not in store
    if (email === mockCredentials.doctor.email && password === mockCredentials.doctor.password) {
      return { success: true, token: 'mock-doctor-token', mustChangePassword: false };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  firstLoginPasswordReset: async (email, oldPassword, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = getStore('mockUsers');
    const userIndex = users.findIndex(u => u.email === email && u.password === oldPassword);
    
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      users[userIndex].mustChangePassword = false;
      setStore('mockUsers', users);
      return { success: true, message: 'Password updated successfully. Please log in again.' };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  getProfile: async (role) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Usually we would fetch profile from mockStore using the token, but we'll keep it simple
    return { success: true, data: mockProfile[role] };
  }
};
