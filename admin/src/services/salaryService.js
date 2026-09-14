import { getStore, setStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const salaryService = {
  getCurrentSalary: async (doctorId) => {
    await delay();
    const mockSalaries = getStore('mockSalaries');
    const today = new Date().setHours(0, 0, 0, 0);

    const docSalaries = mockSalaries
      .filter(s => s.doctorId === doctorId)
      .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));

    const currentSalary = docSalaries.find(s => {
      const effectiveDate = new Date(s.effectiveFrom).setHours(0, 0, 0, 0);
      return effectiveDate <= today;
    });

    if (currentSalary) {
      return { success: true, salary: { ...currentSalary, status: 'Active' } };
    }
    return { success: false, message: 'No active salary configured' };
  },

  getSalaryHistory: async (doctorId) => {
    await delay();
    const mockSalaries = getStore('mockSalaries');
    const today = new Date().setHours(0, 0, 0, 0);

    let docSalaries = mockSalaries
      .filter((s) => s.doctorId === doctorId)
      .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
    // Determine dynamic status
    let foundCurrent = false;
    docSalaries = docSalaries.map(s => {
      const effectiveDate = new Date(s.effectiveFrom).setHours(0, 0, 0, 0);
      let dynamicStatus = 'Historical';

      if (effectiveDate > today) {
        dynamicStatus = 'Scheduled';
      } else if (!foundCurrent) {
        dynamicStatus = 'Active';
        foundCurrent = true;
      }

      return { ...s, status: dynamicStatus };
    });

    return { success: true, history: docSalaries };
  },

  setSalary: async (doctorId, doctorName, amount, effectiveFrom) => {
    await delay();
    const mockSalaries = getStore('mockSalaries');
    
    // Do NOT overwrite previous records or manually shift statuses
    // The history is preserved simply by pushing the new record.
    const newSalary = {
      _id: 'sal_' + Date.now(),
      doctorId,
      doctorName,
      salaryAmount: Number(amount),
      effectiveFrom,
      createdAt: Date.now(),
      createdBy: 'Admin'
    };

    mockSalaries.push(newSalary);
    setStore('mockSalaries', mockSalaries);
    
    return { success: true, salary: newSalary, message: 'Salary updated successfully' };
  }
};
