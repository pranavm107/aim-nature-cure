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
