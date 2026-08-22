import { mockIncentiveRules, mockIncentives } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const incentiveService = {
  getRules: async () => {
    await delay();
    return { success: true, rules: mockIncentiveRules };
  },

  createRule: async (ruleData) => {
    await delay();
    const newRule = {
      _id: "rule" + Date.now(),
      date: Date.now(),
      ...ruleData
    };
    mockIncentiveRules.push(newRule);
    return { success: true, rule: newRule };
  },

  getDoctorIncentives: async (doctorId) => {
    await delay();
    const incentives = mockIncentives.filter(i => i.docId === doctorId);
    return { success: true, incentives };
  },

  getPendingIncentives: async () => {
    await delay();
    const pending = mockIncentives.filter(i => i.status === "Pending");
    return { success: true, pending };
  },

  approveIncentive: async (id) => {
    await delay();
    const idx = mockIncentives.findIndex(i => i._id === id);
    if (idx === -1) throw new Error("Incentive not found");
    
    mockIncentives[idx].status = "Approved";
    return { success: true, incentive: mockIncentives[idx] };
  },
  
  getProjectedIncentive: async (doctorId) => {
    await delay();
    // Dashboard widget mock
    return { success: true, projected: 150 };
  }
};
