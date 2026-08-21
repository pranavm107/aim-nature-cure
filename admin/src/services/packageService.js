import { mockPackages } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const packageService = {
  getAllPackages: async () => {
    await delay();
    return mockPackages;
  },

  createPackage: async (data) => {
    await delay();
    const newPackage = { _id: "pkg" + Date.now(), ...data, date: Date.now() };
    mockPackages.push(newPackage);
    return newPackage;
  },

  updatePackage: async (id, data) => {
    await delay();
    const idx = mockPackages.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Package not found");
    
    mockPackages[idx] = { ...mockPackages[idx], ...data };
    return mockPackages[idx];
  },

  updateStatus: async (id, status) => {
    await delay();
    const idx = mockPackages.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Package not found");
    
    mockPackages[idx].status = status;
    return mockPackages[idx];
  }
};

export default packageService;
