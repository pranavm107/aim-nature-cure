const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

import { mockSocialSubmissions } from '../mocks/mockData';

export const socialService = {
  getSubmissions: async () => {
    await delay();
    return { success: true, submissions: mockSocialSubmissions };
  },

  getDoctorSubmissions: async (doctorId) => {
    await delay();
    const submissions = mockSocialSubmissions.filter(s => s.docId === doctorId);
    return { success: true, submissions };
  },

  createSubmission: async (data) => {
    await delay();
    const newSubmission = {
      _id: "soc" + Date.now(),
      date: Date.now(),
      status: "Pending Review",
      history: [],
      ...data
    };
    mockSocialSubmissions.push(newSubmission);
    return { success: true, submission: newSubmission };
  },

  approveSubmission: async (id, adminId = 'Admin') => {
    await delay();
    const idx = mockSocialSubmissions.findIndex(s => s._id === id);
    if (idx === -1) throw new Error("Not found");
    
    mockSocialSubmissions[idx].status = "Approved";
    mockSocialSubmissions[idx].approvedBy = adminId;
    mockSocialSubmissions[idx].approvedDate = Date.now();
    
    return { success: true, submission: mockSocialSubmissions[idx] };
  },

  rejectSubmission: async (id, reason, adminId = 'Admin') => {
    await delay();
    const idx = mockSocialSubmissions.findIndex(s => s._id === id);
    if (idx === -1) throw new Error("Not found");
    
    mockSocialSubmissions[idx].status = "Rejected";
    mockSocialSubmissions[idx].rejectionReason = reason;
    mockSocialSubmissions[idx].rejectedBy = adminId;
    mockSocialSubmissions[idx].rejectedDate = Date.now();
    
    return { success: true, submission: mockSocialSubmissions[idx] };
  },

  resubmitSubmission: async (id, data) => {
    await delay();
    const idx = mockSocialSubmissions.findIndex(s => s._id === id);
    if (idx === -1) throw new Error("Not found");
    
    const oldVersion = { ...mockSocialSubmissions[idx] };
    
    // Push old version to history
    mockSocialSubmissions[idx].history.push({
      date: oldVersion.date,
      status: oldVersion.status,
      rejectedBy: oldVersion.rejectedBy,
      rejectionReason: oldVersion.rejectionReason
    });
    
    // Update with new data
    mockSocialSubmissions[idx] = {
      ...mockSocialSubmissions[idx],
      ...data,
      date: Date.now(),
      status: "Pending Review",
      rejectionReason: null,
      rejectedBy: null,
      rejectedDate: null
    };
    
    return { success: true, submission: mockSocialSubmissions[idx] };
  }
};
