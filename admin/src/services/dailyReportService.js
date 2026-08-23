const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

import { mockDailyReports } from '../mocks/mockData';

export const dailyReportService = {
  getAdminReports: async () => {
    await delay();
    return { success: true, reports: mockDailyReports };
  },

  getDoctorReports: async (docId) => {
    await delay();
    const reports = mockDailyReports.filter(r => r.docId === docId);
    return { success: true, reports };
  },

  submitReport: async (data) => {
    await delay();
    const newReport = {
      _id: 'dr' + Date.now(),
      date: Date.now(),
      status: 'Pending',
      ...data
    };
    mockDailyReports.push(newReport);
    return { success: true, report: newReport };
  },

  updateReportStatus: async (id, status) => {
    await delay();
    const idx = mockDailyReports.findIndex(r => r._id === id);
    if (idx > -1) {
      mockDailyReports[idx].status = status;
    }
    return { success: true };
  }
};
