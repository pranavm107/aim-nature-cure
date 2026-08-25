import { mockDoctors, mockAppointments, mockPatients } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const adminService = {
  getAllDoctors: async () => {
    await delay();
    return { success: true, doctors: mockDoctors };
  },

  changeAvailability: async (docId) => {
    await delay();
    const doc = mockDoctors.find(d => d._id === docId);
    if (doc) {
      doc.available = !doc.available;
      return { success: true, message: 'Availability changed' };
    }
    return { success: false, message: 'Doctor not found' };
  },

  getDashData: async () => {
    await delay();
    const dashData = {
      doctors: mockDoctors.length,
      appointments: mockAppointments.length,
      patients: mockPatients.length,
      latestAppointments: [...mockAppointments].reverse().slice(0, 5),
      earnings: 1250,
    };
    return { success: true, dashData };
  },

  addDoctor: async (formData) => {
    await delay();
    // Simplified mock implementation
    const newDoc = {
      _id: "doc" + Date.now(),
      name: formData.get('name'),
      email: formData.get('email'),
      speciality: formData.get('speciality'),
      degree: formData.get('degree'),
      experience: formData.get('experience'),
      about: formData.get('about'),
      fees: Number(formData.get('fees')),
      address: JSON.parse(formData.get('address')),
      date: Date.now(),
      slots_booked: {},
      available: true
    };
    mockDoctors.push(newDoc);
    return { success: true, message: 'Doctor added successfully', doctor: newDoc };
  }
};
import { mockPatients, mockDoctors, mockInvoices, mockLeads, mockSocialSubmissions, mockFollowUps, mockConsultations, mockTherapySessions, mockPayments } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const analyticsService = {
  getDashboardData: async () => {
    await delay();
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Total Patients
    const totalPatients = mockPatients.length;
    const newPatients = mockPatients.filter(p => new Date(p.date) > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
    const totalDoctors = mockDoctors.length;
    
    // Revenue calculations (using actual mockPayments for paid revenue)
    const totalRevenue = mockPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    
    // Pending Payments (Invoices total - paid)
    const pendingPayments = mockInvoices.reduce((acc, inv) => {
      const paid = mockPayments.filter(p => p.invoiceId === inv._id).reduce((sum, p) => sum + p.amount, 0);
      return acc + (inv.totalAmount - paid);
    }, 0);
    
    // Leads & Social & Follow-ups
    const newLeadsCount = mockLeads.filter(l => l.status === 'New').length;
    const pendingSocial = mockSocialSubmissions.filter(s => s.status === 'Pending').length;
    const pendingFollowUps = mockFollowUps.filter(f => f.status === 'Pending').length;

    // Today's Operations
    // Using simple date matching. In real app, timezone handling is needed.
    const todaysConsultations = mockConsultations.filter(c => {
      return new Date(c.date).toISOString().split('T')[0] === todayStr || true; // Fallback to all for mock demo if none today
    }).length;

    const todaysTherapies = mockTherapySessions.filter(t => {
      return (t.scheduledDate && t.scheduledDate === todayStr) || true; // Fallback to all for mock demo
    }).length;

    const pendingDailyReports = 2; // Keep static as dailyReport mock doesn't exist in detail

    // Revenue trend (static mock but scaled to actual totalRevenue)
    const revenueTrend = [
      { month: 'Jan', revenue: Math.floor(totalRevenue * 0.1) },
      { month: 'Feb', revenue: Math.floor(totalRevenue * 0.15) },
      { month: 'Mar', revenue: Math.floor(totalRevenue * 0.2) },
      { month: 'Apr', revenue: Math.floor(totalRevenue * 0.25) },
      { month: 'May', revenue: Math.floor(totalRevenue * 0.3) },
    ];
    
    const leadSources = [
      { name: 'Instagram', value: 45 },
      { name: 'Google Ads', value: 30 },
      { name: 'Referral', value: 20 },
      { name: 'Walk-in', value: 5 },
    ];

    // Top Doctors ranked by Consultations count
    const topDoctors = mockDoctors.slice(0, 3).map(doc => {
      const docConsultations = mockConsultations.filter(c => c.doctorId === doc._id).length;
      return {
        name: doc.name,
        consultationCount: docConsultations,
        patients: mockPatients.filter(p => p.assignedDoctor === doc._id).length
      };
    }).sort((a, b) => b.consultationCount - a.consultationCount);

    return {
      success: true,
      data: {
        totalPatients,
        newPatients,
        totalDoctors,
        totalRevenue,
        pendingPayments,
        newLeadsCount,
        pendingSocial,
        pendingFollowUps,
        revenueTrend,
        leadSources,
        topDoctors,
        todaysConsultations: mockConsultations.length, // Using absolute length for demo purposes so it's not 0
        todaysTherapies: mockTherapySessions.length, // Using absolute length for demo purposes so it's not 0
        pendingDailyReports
      }
    };
  }
};
import axios from 'axios';

// For V1 pure mock architecture, this is just a placeholder.
// In a real scenario with a backend, we'd configure Axios here with base URL,
// auth headers, interceptors, etc.

export const USE_MOCK = true; // Hardcoded to true for pure mock UI mode

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aToken') || localStorage.getItem('dToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
import { mockAppointments } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const appointmentService = {
  getAllAppointments: async () => {
    await delay();
    return { success: true, appointments: mockAppointments };
  },
  
  getDoctorAppointments: async () => {
    await delay();
    const docId = 'doc1'; // Mock doctor id
    const appointments = mockAppointments.filter(a => a.docId === docId);
    return { success: true, appointments };
  },
  
  getPatientAppointments: async (patientId) => {
    await delay();
    const appointments = mockAppointments.filter(a => a.userId === patientId);
    return { success: true, appointments };
  },
  
  createAppointment: async (appointmentData) => {
    await delay();
    const newAppt = { 
      _id: "app" + Date.now(), 
      ...appointmentData, 
      date: Date.now(), 
      isCompleted: false, 
      cancelled: false 
    };
    mockAppointments.push(newAppt);
    return { success: true, appointment: newAppt };
  },
  
  updateAppointmentStatus: async (id, status) => {
    await delay();
    const idx = mockAppointments.findIndex(a => a._id === id);
    if (idx === -1) throw new Error("Appointment not found");
    
    if (status === 'Completed') mockAppointments[idx].isCompleted = true;
    else if (status === 'Cancelled') mockAppointments[idx].cancelled = true;
    
    return { success: true, appointment: mockAppointments[idx] };
  }
};
import { mockProfile, mockCredentials } from '../mocks/mockData';

export const authService = {
  loginAdmin: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === mockCredentials.admin.email && password === mockCredentials.admin.password) {
      return { success: true, token: 'mock-admin-token' };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  loginDoctor: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === mockCredentials.doctor.email && password === mockCredentials.doctor.password) {
      return { success: true, token: 'mock-doctor-token' };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  getProfile: async (role) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, data: mockProfile[role] };
  }
};
import { mockConsultations } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const consultationService = {
  getConsultations: async (patientId) => {
    await delay();
    const consultations = mockConsultations.filter(c => c.patientId === patientId);
    return { success: true, consultations };
  },
  
  createConsultation: async (patientId, consultationData) => {
    await delay();
    const newCons = { 
      _id: "cons" + Date.now(), 
      patientId, 
      date: Date.now(), 
      ...consultationData, 
      addendums: [] 
    };
    mockConsultations.push(newCons);
    return { success: true, consultation: newCons };
  },
  
  getConsultationById: async (id) => {
    await delay();
    const consultation = mockConsultations.find(c => c._id === id);
    if (!consultation) throw new Error("Consultation not found");
    return { success: true, consultation };
  },
  
  // Immutability rule BR-13: Can only add addendums, cannot update original fields
  addConsultationAddendum: async (id, text) => {
    await delay();
    const idx = mockConsultations.findIndex(c => c._id === id);
    if (idx === -1) throw new Error("Consultation not found");
    
    mockConsultations[idx].addendums.push({ date: Date.now(), text });
    return { success: true, consultation: mockConsultations[idx] };
  }
};
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
import { 
  mockDoctors, 
  mockAppointments, 
  mockPatients, 
  mockProfile,
  mockConsultations,
  mockTherapySessions,
  mockFollowUps,
  mockInvoices
} from '../mocks/mockData';
import { taskService } from './taskService';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const doctorService = {
  getDashData: async () => {
    await delay();
    const docId = 'doc1';
    
    // Appointments
    const docAppointments = mockAppointments.filter(a => a.docId === docId);
    
    // Patients
    const docPatients = mockPatients.filter(p => p.assignedDoctor === docId);
    
    // Pending Follow-Ups
    const pendingFollowUps = mockFollowUps.filter(f => f.doctorId === docId && f.status === 'Upcoming').length;
    
    // Active Therapy Sessions
    const activeTherapySessions = mockTherapySessions.filter(s => s.status === 'Pending').length; // Mock simplified
    
    // Pending Tasks
    const { tasks } = await taskService.getTasks(docId);
    const pendingTasks = tasks ? tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length : 0;
    
    // Consultations Today (Mocked as all consultations for this doc)
    const todayConsultations = mockConsultations.filter(c => c.doctorId === docId).length;
    
    // Revenue (Mock calculations)
    const docInvoices = mockInvoices.filter(i => i.doctorId === docId || i.docId === docId);
    const earnings = docInvoices.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).reduce((sum, inv) => sum + inv.paidAmount, 0);
    const monthlyRevenue = docInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    const dashData = {
      doctors: mockDoctors.length,
      appointments: docAppointments.length,
      patients: docPatients.length,
      todayConsultations,
      pendingFollowUps,
      pendingTasks,
      activeTherapySessions,
      earnings,
      monthlyRevenue,
      latestAppointments: [...docAppointments].reverse().slice(0, 5),
    };
    return { success: true, dashData };
  },

  getProfileData: async () => {
    await delay();
    return { success: true, profileData: mockProfile.doctor };
  },

  updateProfileData: async (updateData) => {
    await delay();
    mockProfile.doctor = { ...mockProfile.doctor, ...updateData };
    return { success: true, message: 'Profile updated' };
  }
};
import { mockPatientDocuments } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const documentService = {
  getPatientDocuments: async (patientId) => {
    await delay();
    const documents = mockPatientDocuments.filter(d => d.patientId === patientId);
    return { success: true, documents };
  },
  
  uploadDocument: async (patientId, data) => {
    await delay();
    // data contains: name, type, description, uploader, file (mock)
    
    const newDoc = { 
      _id: "docm" + Date.now(), 
      patientId, 
      name: data.name, 
      type: data.type, 
      description: data.description,
      uploadedBy: data.uploader || 'Admin',
      fileSize: "2.4 MB", // Mock file size
      fileType: "application/pdf", // Mock file type
      status: "Active",
      url: "mock-url.pdf", 
      date: Date.now() 
    };
    
    mockPatientDocuments.push(newDoc);
    return { success: true, document: newDoc };
  },
  
  updateDocument: async (patientId, docId, updates) => {
    await delay();
    const idx = mockPatientDocuments.findIndex(d => d._id === docId);
    if (idx !== -1) {
      mockPatientDocuments[idx] = { ...mockPatientDocuments[idx], ...updates };
      return { success: true, document: mockPatientDocuments[idx] };
    }
    throw new Error("Document not found");
  },
  
  deleteDocument: async (patientId, docId) => {
    await delay();
    const idx = mockPatientDocuments.findIndex(d => d._id === docId);
    if (idx !== -1) {
      mockPatientDocuments.splice(idx, 1);
    }
    return { success: true };
  }
};
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
import { mockIncentiveRules, mockIncentives } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const incentiveService = {
  getRules: async () => {
    await delay();
    return { success: true, rules: mockIncentiveRules };
  },

  createRule: async (ruleData) => {
    await delay();
    const newRule = {
      _id: "rule" + Date.now(),
      date: Date.now(),
      ...ruleData
    };
    mockIncentiveRules.push(newRule);
    return { success: true, rule: newRule };
  },

  getDoctorIncentives: async (doctorId) => {
    await delay();
    const incentives = mockIncentives.filter(i => i.docId === doctorId);
    return { success: true, incentives };
  },

  getPendingIncentives: async () => {
    await delay();
    const pending = mockIncentives.filter(i => i.status === "Pending");
    return { success: true, pending };
  },

  approveIncentive: async (id) => {
    await delay();
    const idx = mockIncentives.findIndex(i => i._id === id);
    if (idx === -1) throw new Error("Incentive not found");
    
    mockIncentives[idx].status = "Approved";
    return { success: true, incentive: mockIncentives[idx] };
  },
  
  getProjectedIncentive: async (doctorId) => {
    await delay();
    // Dashboard widget mock
    return { success: true, projected: 150 };
  }
};
import { mockInvoices, mockPayments } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const invoiceService = {
  getInvoices: async () => {
    await delay();
    return { success: true, invoices: mockInvoices };
  },

  getPatientInvoices: async (patientId) => {
    await delay();
    const invoices = mockInvoices.filter(i => i.patientId === patientId);
    return { success: true, invoices };
  },

  getInvoiceById: async (id) => {
    await delay();
    const invoice = mockInvoices.find(i => i._id === id);
    if (!invoice) throw new Error("Invoice not found");
    
    const payments = mockPayments.filter(p => p.invoiceId === id);
    
    return { success: true, invoice, payments };
  },

  createInvoice: async (invoiceData) => {
    await delay();
    const newInvoice = {
      _id: "inv" + Date.now(),
      date: Date.now(),
      paidAmount: 0,
      status: "Pending",
      ...invoiceData
    };
    mockInvoices.push(newInvoice);
    return { success: true, invoice: newInvoice };
  }
};
import { mockLeads } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const leadService = {
  getLeads: async () => {
    await delay();
    return { success: true, leads: mockLeads };
  },

  updateLeadStatus: async (id, status) => {
    await delay();
    const idx = mockLeads.findIndex(l => l._id === id);
    if (idx === -1) throw new Error("Not found");
    mockLeads[idx].status = status;
    return { success: true, lead: mockLeads[idx] };
  }
};
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

import { mockDoctorNotes as mockNotes } from '../mocks/mockData';

export const noteService = {
  getNotes: async (docId) => {
    await delay();
    return { success: true, notes: mockNotes.filter(n => n.docId === docId) };
  },

  createNote: async (data) => {
    await delay();
    const newNote = {
      _id: 'n' + Date.now(),
      date: Date.now(),
      ...data
    };
    mockNotes.push(newNote);
    return { success: true, note: newNote };
  },

  deleteNote: async (id) => {
    await delay();
    const idx = mockNotes.findIndex(n => n._id === id);
    if (idx > -1) mockNotes.splice(idx, 1);
    return { success: true };
  }
};
import { mockPackages } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const packageService = {
  getAllPackages: async () => {
    await delay();
    return mockPackages;
  },

  createPackage: async (data) => {
    await delay();
    const newPackage = { _id: "pkg" + Date.now(), ...data, date: Date.now() };
    mockPackages.push(newPackage);
    return newPackage;
  },

  updatePackage: async (id, data) => {
    await delay();
    const idx = mockPackages.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Package not found");
    
    mockPackages[idx] = { ...mockPackages[idx], ...data };
    return mockPackages[idx];
  },

  updateStatus: async (id, status) => {
    await delay();
    const idx = mockPackages.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Package not found");
    
    mockPackages[idx].status = status;
    return mockPackages[idx];
  }
};

export default packageService;
import { mockConsultations, mockTherapies, mockAppointments, mockPatientDocuments, mockInvoices } from '../mocks/mockData';
import { documentService } from './documentService';
import { followUpService } from './followUpService';


const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const patientActivityService = {
  getPatientActivity: async (patientId) => {
    await delay();
    let activities = [];

    // 1. Consultations
    const consultations = mockConsultations.filter(c => c.patientId === patientId);
    consultations.forEach(c => {
      activities.push({
        _id: 'act_c_' + c._id,
        type: 'CONSULTATION',
        title: 'Consultation Recorded',
        description: `Diagnosis: ${c.diagnosis || 'Pending'}`,
        date: c.date,
        performedBy: c.doctorId || 'System',
        details: {
          ChiefComplaint: c.chiefComplaint,
          Observations: c.observations,
          TreatmentPlan: c.treatmentPlan,
          Notes: c.notes
        },
        rawDate: c.date
      });
    });

    // 2. Therapies
    const therapies = mockTherapies.filter(t => t.patientId === patientId);
    therapies.forEach(t => {
      activities.push({
        _id: 'act_t_' + t._id,
        type: 'THERAPY',
        title: `Therapy Session: ${t.type}`,
        description: `Status: ${t.status}`,
        date: t.date,
        performedBy: t.therapistId || 'System',
        details: {
          Notes: t.notes,
          Outcome: t.outcome
        },
        rawDate: t.date
      });
    });

    // 3. Follow-ups
    const { followUps } = await followUpService.getPatientFollowUps(patientId);
    followUps.forEach(f => {
      activities.push({
        _id: 'act_f_' + f._id,
        type: 'FOLLOW-UP',
        title: `${f.type} - ${f.status}`,
        description: f.notes || 'No description',
        date: f.createdAt, // Record creation date as the activity
        performedBy: f.doctorId,
        details: {
          TargetDate: new Date(f.date).toLocaleDateString(),
          Priority: f.priority,
          CompletionNotes: f.completionNotes,
          RescheduleReason: f.rescheduleReason
        },
        rawDate: f.createdAt
      });
    });

    // 4. Documents
    const { documents } = await documentService.getPatientDocuments(patientId);
    documents.forEach(d => {
      activities.push({
        _id: 'act_d_' + d._id,
        type: 'DOCUMENT',
        title: `Document Uploaded: ${d.name}`,
        description: `Type: ${d.type}`,
        date: d.date,
        performedBy: d.uploadedBy || 'Admin',
        details: {
          Description: d.description,
          Size: d.fileSize
        },
        rawDate: d.date
      });
    });

    // 5. Invoices (Financial)
    const invoices = mockInvoices.filter(i => i.patientId === patientId);
    invoices.forEach(i => {
      activities.push({
        _id: 'act_i_' + i._id,
        type: 'FINANCIAL',
        title: `Invoice Created: ${i._id}`,
        description: `Amount: $${i.amount} - Status: ${i.status}`,
        date: i.date,
        performedBy: 'System',
        details: {
          Items: i.items?.map(it => it.name).join(', '),
          PaymentDate: i.paymentDate ? new Date(i.paymentDate).toLocaleDateString() : 'N/A'
        },
        rawDate: i.date
      });
    });

    // Sort by Date descending (Newest first)
    activities.sort((a, b) => b.rawDate - a.rawDate);
    
    return { success: true, activities };
  }
};
import { mockInvoices, mockPayments } from '../mocks/mockData';
import { patientActivityService } from './patientActivityService';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const patientBillingService = {
  getPatientBillingSummary: async (patientId) => {
    await delay();
    
    const invoices = mockInvoices.filter(i => i.patientId === patientId);
    const payments = mockPayments.filter(p => p.patientId === patientId);

    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Refunds logic if refund payments exist (e.g. negative amount or specific type)
    const refunded = payments.filter(p => p.amount < 0 || p.type === 'Refund').reduce((sum, p) => sum + Math.abs(p.amount), 0);
    
    const outstandingBalance = totalBilled - totalPaid + refunded;

    return {
      success: true,
      summary: {
        totalBilled,
        totalPaid,
        pending: outstandingBalance,
        refunded
      }
    };
  },

  getPatientInvoices: async (patientId) => {
    await delay();
    const invoices = mockInvoices.filter(i => i.patientId === patientId);
    
    // Calculate balance for each invoice
    const enrichedInvoices = invoices.map(inv => {
      const invPayments = mockPayments.filter(p => p.invoiceId === inv._id);
      const paid = invPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = inv.totalAmount - paid;
      
      // Sync status based on actual payments
      let status = inv.status;
      if (balance <= 0) status = 'Paid';
      else if (paid > 0) status = 'Partial';
      else if (new Date(inv.dueDate) < new Date()) status = 'Overdue';
      else status = 'Pending';
      
      return {
        ...inv,
        paidAmount: paid,
        balance: balance,
        status: status
      };
    });
    
    return { success: true, invoices: enrichedInvoices.sort((a, b) => b.date - a.date) };
  },

  getPatientPayments: async (patientId) => {
    await delay();
    const payments = mockPayments.filter(p => p.patientId === patientId).sort((a, b) => b.date - a.date);
    return { success: true, payments };
  },

  recordPatientPayment: async (data) => {
    await delay();
    const { patientId, invoiceId, amount, mode, date, transactionId, notes } = data;
    
    const invoiceIndex = mockInvoices.findIndex(i => i._id === invoiceId);
    if (invoiceIndex === -1) throw new Error("Invoice not found");

    const newPayment = {
      _id: "pay" + Date.now(),
      invoiceId,
      patientId,
      amount: parseFloat(amount),
      mode,
      date: date || Date.now(),
      transactionId: transactionId || "TXN" + Math.floor(Math.random() * 1000000000),
      notes
    };
    
    mockPayments.push(newPayment);
    
    return { success: true, payment: newPayment };
  }
};
import { mockPatients, mockConsultations, mockTherapySessions } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const patientService = {
  getPatients: async () => {
    await delay();
    const role = localStorage.getItem('userRole');
    // Assuming doc1 for mock doctor session based on mock Credentials
    const docId = 'doc1'; 
    
    // BR-02: Doctor sees only assigned patients
    const patients = role === 'doctor' 
      ? mockPatients.filter(p => p.assignedDoctor === docId)
      : mockPatients;
      
    return { success: true, patients };
  },
  
  searchPatients: async (query) => {
    await delay();
    const q = query.toLowerCase();
    const role = localStorage.getItem('userRole');
    const docId = 'doc1';
    
    let patients = mockPatients.filter(p => 
      p.name.toLowerCase().includes(q) || p.phone.includes(q)
    );
    
    if (role === 'doctor') {
      patients = patients.filter(p => p.assignedDoctor === docId);
    }
    
    return { success: true, patients };
  },
  
  createPatient: async (patientData) => {
    await delay();
    const newPatient = { 
      _id: "pat" + Date.now(), 
      ...patientData, 
      date: Date.now() 
    };
    mockPatients.push(newPatient);
    return { success: true, patient: newPatient };
  },
  
  getPatientById: async (id) => {
    await delay();
    const patient = mockPatients.find(p => p._id === id);
    if (!patient) throw new Error("Patient not found");
    return { success: true, patient };
  },
  
  updatePatient: async (id, patientData) => {
    await delay();
    const idx = mockPatients.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Patient not found");
    
    mockPatients[idx] = { ...mockPatients[idx], ...patientData };
    return { success: true, patient: mockPatients[idx] };
  },
  
  setPatientStatus: async (id, status) => {
    await delay();
    const idx = mockPatients.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Patient not found");
    
    mockPatients[idx].status = status;
    return { success: true, patient: mockPatients[idx] };
  },
  
  assignDoctor: async (id, doctorId) => {
    await delay();
    const idx = mockPatients.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Patient not found");
    
    mockPatients[idx].assignedDoctor = doctorId;
    return { success: true, patient: mockPatients[idx] };
  },
  
  getPatientTimeline: async (id) => {
    await delay();
    const patientConsultations = mockConsultations.filter(c => c.patientId === id);
    
    const completedSessions = mockTherapySessions
      .filter(s => s.patientId === id && s.status === 'Completed')
      .map(s => ({
        ...s,
        date: s.date || Date.now(), // Fallback if no date
      }));
      
    const timeline = [
      ...patientConsultations.map(c => ({ type: 'consultation', date: c.date, data: c })),
      ...completedSessions.map(s => ({ type: 'therapy_session', date: s.date, data: s }))
    ].sort((a, b) => b.date - a.date); // Descending
    
    return { success: true, timeline };
  }
};
import { mockPayments, mockInvoices } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  getPayments: async () => {
    await delay();
    return { success: true, payments: mockPayments };
  },

  recordPayment: async (paymentData) => {
    await delay();
    // BR-08: Payment must have invoice
    const invoiceIndex = mockInvoices.findIndex(i => i._id === paymentData.invoiceId);
    if (invoiceIndex === -1) {
      return { success: false, message: "Invoice not found. Payment cannot be recorded." };
    }

    const newPayment = {
      _id: "pay" + Date.now(),
      date: Date.now(),
      transactionId: "TXN" + Math.floor(Math.random() * 1000000000),
      ...paymentData
    };
    mockPayments.push(newPayment);

    // Update invoice status (BR-15 partial payments)
    const invoice = mockInvoices[invoiceIndex];
    invoice.paidAmount += parseFloat(paymentData.amount);
    
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = "Paid";
    } else if (invoice.paidAmount > 0) {
      invoice.status = "Partial";
    }

    return { success: true, payment: newPayment };
  }
};
import { mockInvoices, mockPayments, mockDoctors } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const revenueService = {
  // BR-09: Revenue calculations use PAID amounts only
  getDoctorRevenue: async (doctorId, period = 'month') => {
    await delay();
    
    // In a real app, this would filter mockPayments by date and join with invoices to check docId.
    // Here we'll just mock a static response based on mock data.
    
    const docInvoices = mockInvoices.filter(i => i.docId === doctorId);
    const docInvoiceIds = docInvoices.map(i => i._id);
    const docPayments = mockPayments.filter(p => docInvoiceIds.includes(p.invoiceId));
    
    const totalPaidRevenue = docPayments.reduce((sum, p) => sum + p.amount, 0);

    return { 
      success: true, 
      revenue: totalPaidRevenue,
      attributionNote: "TBD: Revenue currently attributed entirely to the assigning doctor of the invoice."
    };
  },

  getDoctorComparison: async (period = 'month') => {
    await delay();
    
    // Mock comparative data
    const comparison = mockDoctors.map(doc => {
      const docInvoices = mockInvoices.filter(i => i.docId === doc._id);
      const docInvoiceIds = docInvoices.map(i => i._id);
      const docPayments = mockPayments.filter(p => docInvoiceIds.includes(p.invoiceId));
      const rev = docPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        doctorId: doc._id,
        doctorName: doc.name,
        revenue: rev
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return { 
      success: true, 
      comparison 
    };
  }
};
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
import { mockTasks } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  getTasks: async (docId) => {
    await delay();
    return { success: true, tasks: mockTasks.filter(t => t.docId === docId) };
  },

  createTask: async (data) => {
    await delay();
    const newTask = {
      _id: 't' + Date.now(),
      date: Date.now(),
      status: 'Pending',
      ...data
    };
    mockTasks.push(newTask);
    return { success: true, task: newTask };
  },

  updateTaskStatus: async (id, status) => {
    await delay();
    const idx = mockTasks.findIndex(t => t._id === id);
    if (idx > -1) mockTasks[idx].status = status;
    return { success: true };
  }
};
import { mockTherapies } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const therapyService = {
  getAllTherapies: async () => {
    await delay();
    return mockTherapies;
  },

  createTherapy: async (data) => {
    await delay();
    const newTherapy = { _id: "ther" + Date.now(), ...data, date: Date.now() };
    mockTherapies.push(newTherapy);
    return newTherapy;
  },

  updateTherapy: async (id, data) => {
    await delay();
    const idx = mockTherapies.findIndex(t => t._id === id);
    if (idx === -1) throw new Error("Therapy not found");
    
    mockTherapies[idx] = { ...mockTherapies[idx], ...data };
    return mockTherapies[idx];
  },

  updateStatus: async (id, status) => {
    await delay();
    const idx = mockTherapies.findIndex(t => t._id === id);
    if (idx === -1) throw new Error("Therapy not found");
    
    mockTherapies[idx].status = status;
    return mockTherapies[idx];
  }
};

export default therapyService;
import { mockTherapySessions, mockPackages, mockTherapies, mockDoctors } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const therapySessionService = {
  assignToPatient: async (patientId, assignmentData) => {
    await delay();
    const { type, itemId, assignedDocId } = assignmentData;
    const docId = assignedDocId || 'doc1';
    
    let generatedSessions = [];
    const sessionBase = { 
      patientId, 
      docId, 
      scheduledDate: new Date().toISOString().split('T')[0], 
      status: 'Pending', 
      notes: '', 
      date: Date.now() 
    };
    
    // FR-050 Fix: Check for duplicate assignment
    // (A patient shouldn't be assigned the same therapy/package twice while one is pending)
    if (type === 'package') {
      const pkg = mockPackages.find(p => p._id === itemId);
      if (!pkg) throw new Error("Package not found");

      // Simple deduplication: Check if there are already pending sessions for this patient from this package
      // In a real DB, patientPackage model tracks this, but here we check therapy matching
      const hasPendingForPackage = mockTherapySessions.some(s => 
        s.patientId === patientId && s.status === 'Pending' && pkg.therapies.some(t => t.therapyId === s.therapyId)
      );

      if (hasPendingForPackage) {
        throw new Error("Patient already has pending sessions from this package or identical therapies.");
      }

      pkg.therapies.forEach(tItem => {
        for(let i = 0; i < tItem.count; i++) {
          generatedSessions.push({ 
            _id: "sess" + Date.now() + Math.random(), 
            therapyId: tItem.therapyId, 
            ...sessionBase 
          });
        }
      });
    } else if (type === 'therapy') {
      const hasPendingTherapy = mockTherapySessions.some(s => 
        s.patientId === patientId && s.status === 'Pending' && s.therapyId === itemId
      );

      if (hasPendingTherapy) {
        throw new Error("Patient already has a pending session for this therapy.");
      }

      generatedSessions.push({ 
        _id: "sess" + Date.now(), 
        therapyId: itemId, 
        ...sessionBase 
      });
    }

    mockTherapySessions.push(...generatedSessions);
    return { 
      sessions: generatedSessions, 
      message: `Assigned successfully. Generated ${generatedSessions.length} sessions.` 
    };
  },

  getPatientSessions: async (patientId) => {
    await delay();
    const sessions = mockTherapySessions.filter(s => s.patientId === patientId);
    return sessions;
  },

  getPatientTherapyHistory: async (patientId) => {
    await delay();
    const rawSessions = mockTherapySessions.filter(s => s.patientId === patientId);
    
    // Enrich with therapy and doctor details
    const enrichedSessions = rawSessions.map(s => {
      const therapy = mockTherapies.find(t => t._id === s.therapyId);
      const doc = mockDoctors.find(d => d._id === s.docId);
      return {
        ...s,
        therapyName: therapy ? therapy.name : 'Unknown Therapy',
        duration: therapy ? therapy.duration : 0,
        doctorName: doc ? doc.name : 'Unknown Doctor'
      };
    }).sort((a, b) => b.date - a.date);

    // Compute stats
    const stats = {
      total: enrichedSessions.length,
      completed: enrichedSessions.filter(s => s.status === 'Completed').length,
      upcoming: enrichedSessions.filter(s => s.status === 'Pending').length,
      cancelled: enrichedSessions.filter(s => s.status === 'Cancelled' || s.status === 'No Show').length
    };

    return { success: true, sessions: enrichedSessions, stats };
  },

  getAllSessions: async () => {
    await delay();
    const role = localStorage.getItem('userRole');
    const docId = 'doc1';
    
    if (role === 'doctor') {
       return mockTherapySessions.filter(s => s.docId === docId);
    }
    return mockTherapySessions;
  },

  completeSession: async (id, notes) => {
    await delay();
    const idx = mockTherapySessions.findIndex(s => s._id === id);
    if (idx === -1) throw new Error("Session not found");
    
    mockTherapySessions[idx].status = 'Completed';
    mockTherapySessions[idx].notes = notes || '';
    
    return mockTherapySessions[idx];
  },

  rescheduleSession: async (id, date) => {
    await delay();
    const idx = mockTherapySessions.findIndex(s => s._id === id);
    if (idx === -1) throw new Error("Session not found");
    
    mockTherapySessions[idx].scheduledDate = date;
    
    return mockTherapySessions[idx];
  }
};

export default therapySessionService;
import { mockDoctors } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const mockAdmins = [
  { _id: 'admin1', name: 'Super Admin', email: 'admin@aimnature.com', role: 'Admin', status: 'Active', lastActive: Date.now() - 3600000 }
];

export const userService = {
  getUsers: async () => {
    await delay();
    const mappedDoctors = mockDoctors.map(doc => ({
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      role: 'Doctor',
      status: doc.available ? 'Active' : 'Inactive',
      lastActive: Date.now() - Math.random() * 86400000
    }));

    return {
      success: true,
      users: [...mockAdmins, ...mappedDoctors]
    };
  },

  updateUserStatus: async (userId, newStatus) => {
    await delay();
    return { success: true, message: 'Status updated' };
  }
};
