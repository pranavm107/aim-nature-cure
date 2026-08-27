import { getStore, setStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const userService = {
  getUsers: async () => {
    await delay();
    const users = getStore('mockUsers');
    // Map them to look like what the UI expects
    const formattedUsers = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      lastActive: Date.now() - Math.random() * 86400000
    }));

    return {
      success: true,
      users: formattedUsers
    };
  },

  addAdmin: async (name, email) => {
    await delay();
    const generatedPassword = generatePassword();
    
    // Simulate email send
    console.log(`[SIMULATED EMAIL] To: ${email} | Subject: Your new Admin Account | Body: Your password is ${generatedPassword}`);

    const users = getStore('mockUsers');
    users.push({
      _id: 'u_' + Date.now(),
      name,
      email,
      password: generatedPassword,
      role: 'admin',
      mustChangePassword: true,
      status: 'Active'
    });
    setStore('mockUsers', users);

    return { success: true, message: 'Admin added successfully', generatedPassword };
  },

  updateUserStatus: async (userId, newStatus) => {
    await delay();
    const users = getStore('mockUsers');
    const userIndex = users.findIndex(u => u._id === userId);
    if (userIndex !== -1) {
      users[userIndex].status = newStatus;
      setStore('mockUsers', users);
      return { success: true, message: 'Status updated' };
    }
    return { success: false, message: 'User not found' };
  },

  getUserById: async (userId) => {
    await delay();
    const users = getStore('mockUsers');
    const user = users.find(u => u._id === userId);
    if (user) {
      const formattedUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      };
      return { success: true, user: formattedUser };
    }
    return { success: false, message: 'User not found' };
  },

  updateUser: async (userId, updateData) => {
    await delay();
    const users = getStore('mockUsers');
    const idx = users.findIndex(u => u._id === userId);
    if (idx !== -1) {
      // Email is locked, ignore it if passed
      const { email, role, ...allowedUpdates } = updateData; 
      users[idx] = { ...users[idx], ...allowedUpdates };
      setStore('mockUsers', users);
      return { success: true, message: 'User updated successfully' };
    }
    return { success: false, message: 'User not found' };
  },

  updateUserRole: async (userId, newRole) => {
    await delay();
    const users = getStore('mockUsers');
    const idx = users.findIndex(u => u._id === userId);
    if (idx !== -1) {
      users[idx].role = newRole;
      setStore('mockUsers', users);
      return { success: true, message: 'User role updated' };
    }
    return { success: false, message: 'User not found' };
  }
};
