import { mockFollowUps, mockPatients, mockFollowUpActivities as seedFollowUpActivities } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

let state = {
  followUps: getStore('mockFollowUps', mockFollowUps),
  followUpActivities: getStore('mockFollowUpActivities', seedFollowUpActivities),
  patients: getStore('mockPatients', mockPatients)
};

const saveState = () => setStore('mockFollowUps', state.followUps);
const saveActivitiesState = () => setStore('mockFollowUpActivities', state.followUpActivities);

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
  },

  // --- PHASE 2B INCENTIVE SUBMISSION METHODS ---
  getFollowUpActivities: async () => {
    await delay();
    return { success: true, activities: state.followUpActivities };
  },

  getDoctorFollowUpActivities: async (doctorId) => {
    await delay();
    const acts = state.followUpActivities.filter(a => a.doctorId === doctorId);
    return { success: true, activities: acts };
  },

  submitFollowUpActivity: async (activityData) => {
    await delay();
    // Verify patient belongs to this doctor
    const patient = state.patients.find(p => p._id === activityData.patientId);
    if (!patient) {
      return { success: false, message: 'Patient not found' };
    }
    if (patient.assignedDoctor !== activityData.doctorId) {
      return { success: false, message: 'You can only submit activities for your assigned patients' };
    }

    const newActivity = {
      _id: 'fua_' + Date.now(),
      doctorId: activityData.doctorId,
      patientId: patient._id,
      patientName: patient.name,
      completedCount: Number(activityData.completedCount),
      requiredCount: Number(activityData.requiredCount),
      followUpDate: activityData.followUpDate,
      description: activityData.description,
      status: 'Submitted',
      submittedAt: Date.now(),
      reviewedAt: null,
      reviewedBy: null,
      reviewRemark: ''
    };

    state.followUpActivities.push(newActivity);
    saveActivitiesState();
    return { success: true, activity: newActivity, message: 'Follow-up activity submitted successfully' };
  },

  approveFollowUpActivity: async (id, reviewData) => {
    await delay();
    const idx = state.followUpActivities.findIndex(a => a._id === id);
    if (idx === -1) return { success: false, message: 'Activity not found' };
    
    if (state.followUpActivities[idx].status !== 'Submitted') {
      return { success: false, message: 'Only submitted activities can be approved' };
    }

    state.followUpActivities[idx].status = 'Approved';
    state.followUpActivities[idx].reviewedAt = Date.now();
    state.followUpActivities[idx].reviewedBy = 'Admin';
    state.followUpActivities[idx].reviewRemark = reviewData?.remark || '';
    
    saveActivitiesState();
    return { success: true, activity: state.followUpActivities[idx], message: 'Activity approved' };
  },

  rejectFollowUpActivity: async (id, reviewData) => {
    await delay();
    const idx = state.followUpActivities.findIndex(a => a._id === id);
    if (idx === -1) return { success: false, message: 'Activity not found' };
    
    if (state.followUpActivities[idx].status !== 'Submitted') {
      return { success: false, message: 'Only submitted activities can be rejected' };
    }

    if (!reviewData?.remark) {
      return { success: false, message: 'Review remark is required for rejection' };
    }

    state.followUpActivities[idx].status = 'Rejected';
    state.followUpActivities[idx].reviewedAt = Date.now();
    state.followUpActivities[idx].reviewedBy = 'Admin';
    state.followUpActivities[idx].reviewRemark = reviewData.remark;
    
    saveActivitiesState();
    return { success: true, activity: state.followUpActivities[idx], message: 'Activity rejected' };
  }
};
