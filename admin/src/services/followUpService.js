import { mockFollowUps, mockPatients } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

let state = {
  followUps: getStore('mockFollowUps', mockFollowUps),
  patients: getStore('mockPatients', mockPatients)
};

const saveState = () => setStore('mockFollowUps', state.followUps);

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const followUpService = {
  getAllFollowUps: async () => {
    await delay();
    const mapped = state.followUps.map(f => {
      const patient = state.patients.find(p => p._id === f.patientId);
      return { ...f, patientName: patient ? patient.name : 'Unknown' };
    });
    return { success: true, followUps: mapped };
  },

  getDoctorFollowUps: async (docId) => {
    await delay();
    const followUps = state.followUps.filter(f => f.docId === docId || f.doctorId === docId);
    const mapped = followUps.map(f => {
      const patient = state.patients.find(p => p._id === f.patientId);
      return { ...f, patientName: patient ? patient.name : 'Unknown' };
    });
    return { success: true, followUps: mapped };
  },

  getPatientFollowUps: async (patientId) => {
    await delay();
    const followUps = state.followUps.filter(f => f.patientId === patientId);
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
    state.followUps.push(newFollowUp);
    saveState();
    return { success: true, followUp: newFollowUp };
  },

  rescheduleFollowUp: async (id, newDate, reason) => {
    await delay();
    const idx = state.followUps.findIndex(f => f._id === id);
    if (idx !== -1) {
      state.followUps[idx].dueDate = newDate;
      state.followUps[idx].status = "Pending";
      state.followUps[idx].rescheduleReason = reason;
      saveState();
      return { success: true, followUp: state.followUps[idx] };
    }
    throw new Error("Follow-up not found");
  },

  completeFollowUp: async (id, completionNotes) => {
    await delay();
    const idx = state.followUps.findIndex(f => f._id === id);
    if (idx !== -1) {
      state.followUps[idx].status = "Completed";
      state.followUps[idx].completionNotes = completionNotes;
      saveState();
      return { success: true, followUp: state.followUps[idx] };
    }
    throw new Error("Follow-up not found");
  },

  cancelFollowUp: async (id, reason) => {
    await delay();
    const idx = state.followUps.findIndex(f => f._id === id);
    if (idx !== -1) {
      state.followUps[idx].status = "Cancelled";
      state.followUps[idx].cancelReason = reason;
      saveState();
      return { success: true, followUp: state.followUps[idx] };
    }
    throw new Error("Follow-up not found");
  }
};
