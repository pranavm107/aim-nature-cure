const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

import { mockDailyReports, mockConsultations, mockTherapySessions, mockPatients } from '../mocks/mockData';

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
  },

  getPatientsSeen: async (docId, dateStr) => {
    await delay();
    
    // Find all consultations for the doctor on the given date
    const consults = mockConsultations.filter(c => {
      const cDate = new Date(c.date).toISOString().split('T')[0];
      return c.doctorId === docId && cDate === dateStr;
    });

    // Find all therapy sessions for the doctor on the given date
    const therapies = mockTherapySessions.filter(t => {
      const tDate = new Date(t.scheduledDate || t.date).toISOString().split('T')[0];
      // Therapy session might have status 'Completed' or 'Pending'. 
      // We assume if it's scheduled for that date, they were "seen" or meant to be seen. 
      // Or we check status === 'Completed'. Let's only count if 'Completed'.
      return t.doctorId === docId && tDate === dateStr && t.status === 'Completed';
    });

    const patientMap = {};

    consults.forEach(c => {
      if (!patientMap[c.patientId]) {
        patientMap[c.patientId] = { patientId: c.patientId, types: new Set() };
      }
      patientMap[c.patientId].types.add('Consultation');
    });

    therapies.forEach(t => {
      if (!patientMap[t.patientId]) {
        patientMap[t.patientId] = { patientId: t.patientId, types: new Set() };
      }
      patientMap[t.patientId].types.add('Therapy');
    });

    // Populate patient names
    const patientsSeen = Object.values(patientMap).map(p => {
      const patient = mockPatients.find(mp => mp._id === p.patientId);
      return {
        patientId: p.patientId,
        patientName: patient ? patient.name : 'Unknown Patient',
        types: Array.from(p.types)
      };
    });

    return { success: true, patientsSeen };
  },

  addReportAddendum: async (id, noteText) => {
    await delay();
    const idx = mockDailyReports.findIndex(r => r._id === id);
    if (idx > -1) {
      if (!mockDailyReports[idx].addendums) {
        mockDailyReports[idx].addendums = [];
      }
      mockDailyReports[idx].addendums.push({
        date: Date.now(),
        notes: noteText
      });
      return { success: true, report: mockDailyReports[idx] };
    }
    throw new Error('Report not found');
  }
};
