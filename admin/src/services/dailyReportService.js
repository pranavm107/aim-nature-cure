const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock static data
const mockDailyReports = [
  {
    _id: 'dr1',
    docId: 'doc1',
    date: Date.now() - 86400000,
    patientCount: 15,
    consultations: 8,
    therapySessions: 12,
    followUps: 3,
    summary: 'A very busy day, mostly follow-ups for hydrotherapy.',
    issues: 'Equipment in Room 2 needs maintenance.',
    status: 'Reviewed'
  },
  {
    _id: 'dr2',
    docId: 'doc2',
    date: Date.now() - 172800000,
    patientCount: 10,
    consultations: 5,
    therapySessions: 8,
    followUps: 1,
    summary: 'Standard day.',
    issues: 'None',
    status: 'Pending'
  }
];

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
