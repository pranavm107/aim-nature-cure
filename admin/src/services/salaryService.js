import { getStore, setStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const salaryService = {
  getCurrentSalary: async (doctorId) => {
    await delay();
    const mockSalaries = getStore('mockSalaries');
    const currentSalary = mockSalaries.find(
      (s) => s.doctorId === doctorId && s.status === 'Current'
    );
    if (currentSalary) {
      return { success: true, salary: currentSalary };
    }
    return { success: false, message: 'No current salary found' };
  },

  getSalaryHistory: async (doctorId) => {
    await delay();
    const mockSalaries = getStore('mockSalaries');
    const history = mockSalaries
      .filter((s) => s.doctorId === doctorId)
      .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
    return { success: true, history };
  },

  setSalary: async (doctorId, doctorName, amount, effectiveFrom) => {
    await delay();
    const mockSalaries = getStore('mockSalaries');
    
    // Mark old as historical
    mockSalaries.forEach(s => {
      if (s.doctorId === doctorId && s.status === 'Current') {
        s.status = 'Historical';
      }
    });

    const newSalary = {
      _id: 'sal_' + Date.now(),
      doctorId,
      doctorName,
      salaryAmount: Number(amount),
      effectiveFrom,
      status: 'Current',
      createdAt: Date.now(),
      createdBy: 'Admin'
    };

    mockSalaries.push(newSalary);
    setStore('mockSalaries', mockSalaries);
    
    return { success: true, salary: newSalary, message: 'Salary updated successfully' };
  }
};
