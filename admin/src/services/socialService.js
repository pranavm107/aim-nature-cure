const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const mockSocialSubmissions = [
  {
    _id: "soc1",
    docId: "doc1",
    type: "Article",
    title: "Benefits of Naturopathy",
    description: "An overview of how natural treatments can improve daily health.",
    content: "Naturopathy is a distinct system of primary health care...",
    link: "https://example.com/naturopathy",
    linkDescription: "Reference article explaining the core concepts.",
    status: "Pending Review",
    date: Date.now() - 86400000,
    history: []
  },
  {
    _id: "soc2",
    docId: "doc1",
    type: "Instagram Post",
    title: "Morning Routine",
    description: "Tips for a healthy morning routine.",
    content: "Start your day with a glass of warm lemon water! 🍋",
    link: "",
    linkDescription: "",
    status: "Approved",
    date: Date.now() - 86400000 * 3,
    approvedBy: 'Admin',
    approvedDate: Date.now() - 86400000 * 2,
    history: []
  },
  {
    _id: "soc3",
    docId: "doc2",
    type: "Facebook Post",
    title: "Yoga for back pain",
    description: "5 simple poses for back pain relief.",
    content: "Check out these 5 poses that can help alleviate back pain immediately.",
    link: "https://example.com/yoga-poses",
    linkDescription: "Missing proper source attribution.",
    status: "Rejected",
    date: Date.now() - 86400000 * 2,
    rejectedBy: 'Admin',
    rejectedDate: Date.now() - 86400000 * 1,
    rejectionReason: "Please provide a valid source link for these specific poses.",
    history: []
  },
  {
    _id: "soc4",
    docId: "doc2",
    type: "YouTube",
    title: "Hydrotherapy Demo",
    description: "A quick demonstration of hydrotherapy.",
    content: "Watch our latest hydrotherapy session.",
    link: "https://youtube.com/example",
    linkDescription: "Demo video.",
    status: "Pending Review",
    date: Date.now() - 3600000,
    history: [
      {
        date: Date.now() - 86400000,
        status: "Rejected",
        rejectedBy: "Admin",
        rejectionReason: "Video link was broken."
      }
    ]
  }
];

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
