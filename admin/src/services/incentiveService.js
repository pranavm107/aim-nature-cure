import { getStore, setStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const incentiveService = {
  getCurrentIncentive: async (doctorId) => {
    await delay();
    const mockIncentiveConfigurations = getStore('mockIncentiveConfigurations');
    const config = mockIncentiveConfigurations.find(
      (c) => c.doctorId === doctorId && c.status === 'Active'
    );
    if (config) return { success: true, incentive: config };
    return { success: false, message: 'No active incentive configuration found' };
  },

  getIncentiveHistory: async (doctorId) => {
    await delay();
    const mockIncentiveConfigurations = getStore('mockIncentiveConfigurations');
    const history = mockIncentiveConfigurations
      .filter((c) => c.doctorId === doctorId)
      .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    return { success: true, history };
  },

  setIncentive: async (doctorId, doctorName, percentage, effectiveFrom) => {
    await delay();
    const mockIncentiveConfigurations = getStore('mockIncentiveConfigurations');
    
    // Deprecate older configs
    mockIncentiveConfigurations.forEach(c => {
      if (c.doctorId === doctorId && c.status === 'Active') {
        c.status = 'Historical';
      }
    });

    const newConfig = {
      _id: 'inc_config_' + Date.now(),
      doctorId,
      doctorName,
      type: 'percentage',
      percentage: Number(percentage),
      effectiveFrom,
      status: 'Active',
      createdAt: Date.now(),
      createdBy: 'Admin'
    };

    mockIncentiveConfigurations.push(newConfig);
    setStore('mockIncentiveConfigurations', mockIncentiveConfigurations);
    
    return { success: true, incentive: newConfig, message: 'Incentive configuration updated successfully' };
  },

  getAllIncentives: async () => {
    await delay();
    const mockIncentiveConfigurations = getStore('mockIncentiveConfigurations');
    return { success: true, incentives: mockIncentiveConfigurations };
  },

  getIncentiveEarnings: async (doctorId) => {
    await delay();
    const mockIncentiveEarnings = getStore('mockIncentiveEarnings');
    const earnings = mockIncentiveEarnings.filter(e => e.doctorId === doctorId);
    return { success: true, earnings };
  },

  getAllIncentiveEarnings: async () => {
    await delay();
    const mockIncentiveEarnings = getStore('mockIncentiveEarnings');
    return { success: true, earnings: mockIncentiveEarnings };
  }
};
