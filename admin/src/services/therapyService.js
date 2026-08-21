import { mockTherapies } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const therapyService = {
  getAllTherapies: async () => {
    await delay();
    return mockTherapies;
  },

  createTherapy: async (data) => {
    await delay();
    const newTherapy = { _id: "ther" + Date.now(), ...data, date: Date.now() };
    mockTherapies.push(newTherapy);
    return newTherapy;
  },

  updateTherapy: async (id, data) => {
    await delay();
    const idx = mockTherapies.findIndex(t => t._id === id);
    if (idx === -1) throw new Error("Therapy not found");
    
    mockTherapies[idx] = { ...mockTherapies[idx], ...data };
    return mockTherapies[idx];
  },

  updateStatus: async (id, status) => {
    await delay();
    const idx = mockTherapies.findIndex(t => t._id === id);
    if (idx === -1) throw new Error("Therapy not found");
    
    mockTherapies[idx].status = status;
    return mockTherapies[idx];
  }
};

export default therapyService;
