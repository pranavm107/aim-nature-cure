import { mockLeads } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const leadService = {
  getLeads: async () => {
    await delay();
    return { success: true, leads: mockLeads };
  },

  updateLeadStatus: async (id, status) => {
    await delay();
    const idx = mockLeads.findIndex(l => l._id === id);
    if (idx === -1) throw new Error("Not found");
    mockLeads[idx].status = status;
    return { success: true, lead: mockLeads[idx] };
  }
};
