import { mockFollowUps, mockPatients } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const followUpService = {
  getAllFollowUps: async () => {
    await delay();
    const mapped = mockFollowUps.map(f => {
      const patient = mockPatients.find(p => p._id === f.patientId);
      return { ...f, patientName: patient ? patient.name : 'Unknown' };
    });
    return { success: true, followUps: mapped };
  },

  getDoctorFollowUps: async (docId) => {
    await delay();
    const followUps = mockFollowUps.filter(f => f.docId === docId || f.doctorId === docId);
    const mapped = followUps.map(f => {
      const patient = mockPatients.find(p => p._id === f.patientId);
      return { ...f, patientName: patient ? patient.name : 'Unknown' };
    });
    return { success: true, followUps: mapped };
  },

  getPatientFollowUps: async (patientId) => {
    await delay();
    const followUps = mockFollowUps.filter(f => f.patientId === patientId);
    // Mark overdue if date is past and status is Pending
    const mapped = followUps.map(f => {
      if (f.status === 'Pending' && new Date(f.dueDate).getTime() < Date.now()) {
        return { ...f, status: 'Overdue' };
      }
      return f;
    });
    return { success: true, followUps: mapped };
  },

  createFollowUp: async (data) => {
    await delay();
    const newFollowUp = {
      _id: "fu" + Date.now(),
      status: "Pending",
      date: Date.now(),
      ...data,
      dueDate: data.dueDate || new Date().toISOString().split('T')[0]
    };
    mockFollowUps.push(newFollowUp);
    return { success: true, followUp: newFollowUp };
  },

  rescheduleFollowUp: async (id, newDate, reason) => {
    await delay();
    const idx = mockFollowUps.findIndex(f => f._id === id);
    if (idx !== -1) {
      mockFollowUps[idx].dueDate = newDate;
      mockFollowUps[idx].status = "Pending";
      mockFollowUps[idx].rescheduleReason = reason;
      return { success: true, followUp: mockFollowUps[idx] };
    }
    throw new Error("Follow-up not found");
  },

  completeFollowUp: async (id, completionNotes) => {
    await delay();
    const idx = mockFollowUps.findIndex(f => f._id === id);
    if (idx !== -1) {
      mockFollowUps[idx].status = "Completed";
      mockFollowUps[idx].completionNotes = completionNotes;
      return { success: true, followUp: mockFollowUps[idx] };
    }
    throw new Error("Follow-up not found");
  },

  cancelFollowUp: async (id, reason) => {
    await delay();
    const idx = mockFollowUps.findIndex(f => f._id === id);
    if (idx !== -1) {
      mockFollowUps[idx].status = "Cancelled";
      mockFollowUps[idx].cancelReason = reason;
      return { success: true, followUp: mockFollowUps[idx] };
    }
    throw new Error("Follow-up not found");
  }
};
