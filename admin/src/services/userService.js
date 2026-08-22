import { mockDoctors } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const mockAdmins = [
  { _id: 'admin1', name: 'Super Admin', email: 'admin@aimnature.com', role: 'Admin', status: 'Active', lastActive: Date.now() - 3600000 }
];

export const userService = {
  getUsers: async () => {
    await delay();
    const mappedDoctors = mockDoctors.map(doc => ({
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      role: 'Doctor',
      status: doc.available ? 'Active' : 'Inactive',
      lastActive: Date.now() - Math.random() * 86400000
    }));

    return {
      success: true,
      users: [...mockAdmins, ...mappedDoctors]
    };
  },

  updateUserStatus: async (userId, newStatus) => {
    await delay();
    return { success: true, message: 'Status updated' };
  }
};
