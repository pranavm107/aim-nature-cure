import { getStore, setStore } from '../utils/mockStore';
import { payrollCalculationService } from './payrollCalculationService';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const payrollService = {
  getAllPayrolls: async () => {
    await delay();
    const mockPayrollStatements = getStore('mockPayrollStatements');
    return { success: true, payrolls: mockPayrollStatements };
  },

  getPayrollById: async (id) => {
    await delay();
    const mockPayrollStatements = getStore('mockPayrollStatements');
    const payroll = mockPayrollStatements.find(p => p._id === id);
    if (payroll) {
      return { success: true, payroll };
    }
    return { success: false, message: 'Statement not found' };
  },

  getDoctorPayroll: async (doctorId) => {
    await delay();
    const mockPayrollStatements = getStore('mockPayrollStatements');
    const payrolls = mockPayrollStatements.filter(p => p.doctorId === doctorId);
    return { success: true, payrolls };
  },

  getPayrollSummary: async () => {
    await delay();
    const mockPayrollStatements = getStore('mockPayrollStatements');
    
    const uniqueDoctors = new Set(mockPayrollStatements.map(p => p.doctorId)).size;
    
    const summary = mockPayrollStatements.reduce((acc, curr) => {
      acc.totalGross += curr.grossEarnings || 0;
      return acc;
    }, { totalGross: 0 });

    return {
      success: true,
      summary: {
        totalDoctors: uniqueDoctors,
        totalSalary: summary.totalGross // Map totalGross to totalSalary for backward compatibility in widgets if needed
      }
    };
  },

  generateStatement: async (doctorId, monthString) => {
    await delay();
    const mockPayrollStatements = getStore('mockPayrollStatements');
    
    // Duplicate Protection
    const existing = mockPayrollStatements.find(p => p.doctorId === doctorId && p.month === monthString);
    if (existing) {
      return { success: false, message: `A statement already exists for ${monthString}. Please use recalculate instead.` };
    }

    const calcRes = await payrollCalculationService.calculateMonthlyStatement(doctorId, monthString);
    if (calcRes.success) {
      mockPayrollStatements.push(calcRes.statement);
      setStore('mockPayrollStatements', mockPayrollStatements);
      return { success: true, statement: calcRes.statement };
    }
    return { success: false, message: 'Failed to generate statement' };
  },

  recalculateStatement: async (statementId) => {
    await delay();
    const mockPayrollStatements = getStore('mockPayrollStatements');
    const existingIndex = mockPayrollStatements.findIndex(p => p._id === statementId);
    
    if (existingIndex === -1) {
      return { success: false, message: 'Statement not found' };
    }

    const existing = mockPayrollStatements[existingIndex];
    if (existing.status !== 'Pending Review') {
      return { success: false, message: 'Only statements in Pending Review can be recalculated.' };
    }

    const calcRes = await payrollCalculationService.calculateMonthlyStatement(existing.doctorId, existing.month);
    
    if (calcRes.success) {
      const updatedStatement = {
        ...calcRes.statement,
        _id: existing._id, // Preserve original ID
        generatedAt: existing.generatedAt,
        generatedBy: existing.generatedBy,
        recalculatedAt: Date.now(),
        recalculatedBy: 'Admin'
      };
      
      mockPayrollStatements[existingIndex] = updatedStatement;
      setStore('mockPayrollStatements', mockPayrollStatements);
      return { success: true, statement: updatedStatement };
    }
    
    return { success: false, message: 'Failed to recalculate statement' };
  }
};
