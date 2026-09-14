import { mockSocialMediaActivities } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

let state = {
  activities: getStore('mockSocialMediaActivities', mockSocialMediaActivities)
};

const saveState = () => setStore('mockSocialMediaActivities', state.activities);

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const socialService = {
  getSocialMediaActivities: async () => {
    await delay();
    return { success: true, activities: [...state.activities] };
  },

  getDoctorSocialMediaActivities: async (doctorId) => {
    await delay();
    const activities = state.activities.filter(a => a.doctorId === doctorId);
    return { success: true, activities };
  },

  submitSocialMediaActivity: async (data) => {
    await delay();
    const newActivity = {
      _id: "sma_" + Date.now(),
      doctorId: data.doctorId,
      platform: data.platform,
      postDate: data.postDate,
      postLink: data.postLink,
      description: data.description,
      proofReference: data.proofReference || '',
      status: 'Submitted',
      submittedAt: Date.now(),
      reviewedAt: null,
      reviewedBy: null,
      reviewRemark: ''
    };
    
    state.activities = [...state.activities, newActivity];
    saveState();
    return { success: true, message: 'Social Media Activity submitted for review.', activity: newActivity };
  },

  approveSocialMediaActivity: async (id, reviewData, adminId = 'Admin') => {
    await delay();
    const activities = [...state.activities];
    const idx = activities.findIndex(a => a._id === id);
    if (idx === -1) return { success: false, message: 'Activity not found.' };
    
    if (activities[idx].status !== 'Submitted') {
      return { success: false, message: 'Only Submitted activities can be approved.' };
    }

    activities[idx] = {
      ...activities[idx],
      status: 'Approved',
      reviewedAt: Date.now(),
      reviewedBy: adminId,
      reviewRemark: reviewData.remark || ''
    };

    state.activities = activities;
    saveState();
    return { success: true, message: 'Activity Approved. It is now eligible for incentives.' };
  },

  rejectSocialMediaActivity: async (id, reviewData, adminId = 'Admin') => {
    await delay();
    const activities = [...state.activities];
    const idx = activities.findIndex(a => a._id === id);
    if (idx === -1) return { success: false, message: 'Activity not found.' };
    
    if (activities[idx].status !== 'Submitted') {
      return { success: false, message: 'Only Submitted activities can be rejected.' };
    }

    activities[idx] = {
      ...activities[idx],
      status: 'Rejected',
      reviewedAt: Date.now(),
      reviewedBy: adminId,
      reviewRemark: reviewData.remark || ''
    };

    state.activities = activities;
    saveState();
    return { success: true, message: 'Activity Rejected.' };
  }

};

