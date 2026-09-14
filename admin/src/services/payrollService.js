import { getStore, setStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const payrollService = {
  getAllPayrolls: async () => {
    await delay();
    const mockPayrolls = getStore('mockPayrolls');
    return { success: true, payrolls: mockPayrolls };
  },

  getPayrollById: async (id) => {
    await delay();
    const mockPayrolls = getStore('mockPayrolls');
    const payroll = mockPayrolls.find(p => p._id === id);
    if (payroll) {
      return { success: true, payroll };
    }
    return { success: false, message: 'Payroll not found' };
  },

  getDoctorPayroll: async (doctorId) => {
    await delay();
    const mockPayrolls = getStore('mockPayrolls');
    const payrolls = mockPayrolls.filter(p => p.doctorId === doctorId);
    return { success: true, payrolls };
  },

  getPayrollSummary: async () => {
    await delay();
    const mockPayrolls = getStore('mockPayrolls');
    
    const uniqueDoctors = new Set(mockPayrolls.map(p => p.doctorId)).size;
    
    const summary = mockPayrolls.reduce((acc, curr) => {
      acc.totalSalary += curr.salaryAmount || 0;
      return acc;
    }, { totalSalary: 0 });

    return {
      success: true,
      summary: {
        totalDoctors: uniqueDoctors,
        ...summary
      }
    };
  }
};
