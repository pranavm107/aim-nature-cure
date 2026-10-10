import apiClient from './apiClient';

export const userService = {
  getUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      let users = response.data;
      if (users.result) users = users.result;
      if (users.users) users = users.users;
      
      if (!Array.isArray(users)) {
        users = [users];
      }

      const formattedUsers = users.map(u => ({
        _id: u.uuid || u.id || u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        photo: u.photo,
        status: u.active ? 'Active' : 'Inactive',
        lastActive: Date.now() - Math.random() * 86400000 // mock lastActive since backend might not have it
      }));

      return { success: true, users: formattedUsers };
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to load users' };
    }
  },

  addUser: async (name, email, role, phone, password) => {
    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role: role.toUpperCase(),
        photo: null
      };
      
      const response = await apiClient.post('/users/create', payload);
      return { success: true, message: response.data?.message || 'User created successfully', generatedPassword: password };
    } catch (error) {
      console.error("Failed to add user:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to create user' };
    }
  },

  updateUserStatus: async (userId, newStatus) => {
    try {
      const active = newStatus === 'Active';
      const response = await apiClient.patch(`/users/update/status/${userId}/${active}`);
      return { success: true, message: response.data?.message || 'Status updated successfully' };
    } catch (error) {
      console.error("Failed to update user status:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to update status' };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      let user = response.data;
      if (user.result) user = user.result;
      if (user.user) user = user.user;

      const formattedUser = {
        _id: user.uuid || user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photo: user.photo,
        status: user.active ? 'Active' : 'Inactive',
      };
      return { success: true, user: formattedUser };
    } catch (error) {
      console.error("Failed to get user by ID:", error);
      return { success: false, message: error.response?.data?.message || 'User not found' };
    }
  },

  updateUser: async (userId, updateData) => {
    try {
      const payload = {
        uuid: userId,
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        role: updateData.role?.toUpperCase(),
        photo: updateData.photo || null
      };

      const response = await apiClient.put('/users/update', payload);
      return { success: true, message: response.data?.message || 'User updated successfully' };
    } catch (error) {
      console.error("Failed to update user:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to update user' };
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return { success: true, message: response.data?.message || 'User deleted successfully' };
    } catch (error) {
      console.error("Failed to delete user:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete user' };
    }
  }
};
