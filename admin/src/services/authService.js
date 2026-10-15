import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      let data = response.data;
      if (data.result) data = data.result;

      const token = data.token || data.jwt || data.accessToken || response.data;
      return { success: true, token };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.response?.data?.message || 'Invalid credentials' };
    }
  },

  getCurrentUser: async (email) => {
    try {
      const response = await apiClient.get(`/auth/me/${email}`);
      let data = response.data;

      // Keep unwrapping until we find the actual user object with role or name
      while (data && (data.user || data.result)) {
        if (data.user) data = data.user;
        else if (data.result) data = data.result;
      }

      const role = data.role || data.roleName || data.type;

      return { success: true, user: data, role: role };
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch user' };
    }
  },

  getProfile: async (role) => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) return { success: false, message: 'No user email found in local storage' };
      
      const response = await authService.getCurrentUser(email);
      if (response.success) {
        return { success: true, data: response.user };
      }
      return response;
    } catch (error) {
      console.error("Get profile error:", error);
      return { success: false, message: 'Failed to fetch profile' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return { success: true, message: response.data?.message || 'Password reset link sent successfully' };
    } catch (error) {
      console.error("Forgot password error:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to send reset link' };
    }
  },

  resetPassword: async (email, oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        email,
        oldPassword,
        newPassword,
        confirmPassword
      });
      return { success: true, message: response.data?.message || 'Password reset successfully' };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to reset password' };
    }
  }
};
