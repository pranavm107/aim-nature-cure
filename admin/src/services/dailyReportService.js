const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

import { mockDailyReports, mockConsultations, mockTherapySessions, mockPatients, mockFollowUps, mockSocialMediaActivities } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

let state = {
  reports: getStore('mockDailyReports', mockDailyReports)
};

const saveState = () => setStore('mockDailyReports', state.reports);

export const dailyReportService = {

  getDailySummary: async (doctorId, reportDateStr) => {
    await delay(50);
    
    // Consultations on this date
    const consults = mockConsultations.filter(c => {
      const cDate = new Date(c.date).toISOString().split('T')[0];
      return c.doctorId === doctorId && cDate === reportDateStr;
    });

    // Completed Therapy sessions on this date
    const therapies = mockTherapySessions.filter(t => {
      const tDate = new Date(t.scheduledDate || t.date).toISOString().split('T')[0];
      return (t.doctorId === doctorId || t.docId === doctorId) && tDate === reportDateStr && t.status === 'Completed';
    });

    // Completed Follow-ups on this date
    const followUps = mockFollowUps.filter(f => {
      const fDate = new Date(f.dueDate).toISOString().split('T')[0];
      return (f.doctorId === doctorId || f.docId === doctorId) && fDate === reportDateStr && f.status === 'Completed';
    });

    // Submitted/Approved Social Media activities on this date
    const socialActivities = mockSocialMediaActivities.filter(s => {
      return (s.doctorId === doctorId || s.docId === doctorId) && s.postDate === reportDateStr;
    });

    // Build Patient Activity Rows
    const patientMap = {};

    const getPatientEntry = (pid) => {
      if (!patientMap[pid]) {
         patientMap[pid] = {
            patientId: pid,
            consultationStatus: '—',
            therapiesMap: {},
            totalTherapySessions: 0,
            followUpStatus: '—'
         };
      }
      return patientMap[pid];
    };

    consults.forEach(c => {
      const p = getPatientEntry(c.patientId);
      p.consultationStatus = 'Completed';
    });

    therapies.forEach(t => {
      const p = getPatientEntry(t.patientId);
      const name = t.therapyName || 'Unknown Therapy';
      p.therapiesMap[name] = (p.therapiesMap[name] || 0) + 1;
      p.totalTherapySessions += 1;
    });

    followUps.forEach(f => {
      const p = getPatientEntry(f.patientId);
      p.followUpStatus = 'Completed';
    });

    const patientActivities = Object.values(patientMap).map(p => {
      const patient = mockPatients.find(mp => mp._id === p.patientId);
      
      const therapiesList = Object.keys(p.therapiesMap).map(name => ({
         therapyName: name,
         sessions: p.therapiesMap[name]
      }));

      return {
        patientId: p.patientId,
        patientName: patient ? patient.name : 'Unknown Patient',
        consultationStatus: p.consultationStatus,
        therapies: therapiesList,
        totalTherapySessions: p.totalTherapySessions,
        followUpStatus: p.followUpStatus
      };
    });

    return {
      patientsSeen: patientActivities.filter(p => p.consultationStatus !== '—' || p.totalTherapySessions > 0).length,
      consultations: consults.length,
      therapySessions: therapies.length,
      followUps: followUps.length,
      socialMediaActivities: socialActivities.length,
      patientActivities 
    };
  },

  getDoctorDailyReport: async (doctorId, reportDateStr) => {
    await delay();
    if (!doctorId || !reportDateStr) throw new Error("doctorId and reportDateStr are required");

    // Fetch persistent report data
    let report = state.reports.find(r => (r.docId === doctorId || r.doctorId === doctorId) && new Date(r.date).toISOString().split('T')[0] === reportDateStr);
    
    // Build Draft representation if none exists
    if (!report) {
      report = {
        _id: null,
        docId: doctorId,
        doctorId: doctorId,
        date: new Date(reportDateStr).getTime(),
        reportDate: reportDateStr,
        status: 'Draft',
        summary: '',
        issues: '',
        addendums: []
      };
    }

    // Fetch dynamic summary data
    const summary = await dailyReportService.getDailySummary(doctorId, reportDateStr);
    
    return { success: true, report, summary };
  },

  getDoctorReportsList: async (doctorId) => {
    await delay();
    const reports = state.reports.filter(r => r.docId === doctorId || r.doctorId === doctorId);
    return { success: true, reports };
  },

  submitDailyReport: async (data) => {
    await delay();
    const { doctorId, reportDateStr, summary, issues } = data;
    if (!doctorId || !reportDateStr) throw new Error("doctorId and reportDateStr are required");

    let existingIdx = state.reports.findIndex(r => (r.docId === doctorId || r.doctorId === doctorId) && new Date(r.date).toISOString().split('T')[0] === reportDateStr);
    
    let reportToSubmit;
    if (existingIdx > -1) {
      // Status validation
      if (state.reports[existingIdx].status !== 'Draft' && state.reports[existingIdx].status !== 'Pending') {
        throw new Error("Only Draft reports can be submitted");
      }
      state.reports[existingIdx] = {
        ...state.reports[existingIdx],
        summary: summary !== undefined ? summary : state.reports[existingIdx].summary,
        issues: issues !== undefined ? issues : state.reports[existingIdx].issues,
        status: 'Submitted',
        submittedAt: Date.now()
      };
      reportToSubmit = state.reports[existingIdx];
    } else {
      // Create new Submitted report
      reportToSubmit = {
        _id: 'dr_' + Date.now(),
        docId: doctorId,
        doctorId: doctorId,
        date: new Date(reportDateStr).getTime(),
        reportDate: reportDateStr,
        summary: summary || '',
        issues: issues || '',
        status: 'Submitted',
        submittedAt: Date.now(),
        addendums: []
      };
      state.reports.push(reportToSubmit);
    }
    saveState();
    return { success: true, report: reportToSubmit };
  },

  reviewDailyReport: async (reportId, adminRemark, adminId = 'Admin') => {
    await delay();
    const idx = state.reports.findIndex(r => r._id === reportId);
    if (idx === -1) throw new Error("Report not found");
    
    if (state.reports[idx].status !== 'Submitted' && state.reports[idx].status !== 'Pending') {
      throw new Error("Only Submitted reports can be reviewed");
    }

    state.reports[idx] = {
      ...state.reports[idx],
      status: 'Reviewed',
      reviewedAt: Date.now(),
      reviewedBy: adminId,
      adminRemark: adminRemark || state.reports[idx].adminRemark || ''
    };
    saveState();
    return { success: true, report: state.reports[idx] };
  },

  getAdminReports: async () => {
    await delay();
    const reportsWithSummary = await Promise.all(state.reports.map(async (r) => {
        const reportDateStr = new Date(r.date).toISOString().split('T')[0];
        const summary = await dailyReportService.getDailySummary(r.docId || r.doctorId, reportDateStr);
        return {
           ...r,
           summaryMetrics: summary
        };
    }));
    return { success: true, reports: reportsWithSummary };
  },

  addReportAddendum: async (id, noteText, doctorId) => {
    await delay();
    const idx = state.reports.findIndex(r => r._id === id);
    if (idx > -1) {
      if (doctorId && state.reports[idx].docId !== doctorId && state.reports[idx].doctorId !== doctorId) {
         throw new Error("Not authorized to add note to this report");
      }
      if (!state.reports[idx].addendums) {
        state.reports[idx].addendums = [];
      }
      state.reports[idx].addendums.push({
        date: Date.now(),
        notes: noteText
      });
      saveState();
      return { success: true, report: state.reports[idx] };
    }
    throw new Error('Report not found');
  }
};
