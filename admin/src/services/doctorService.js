import { taskService } from './taskService';
import { revenueService } from './revenueService';
import { patientService } from './patientService';
import { appointmentService } from './appointmentService';
import therapyAssignmentService from './therapyAssignmentService';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const doctorService = {
  getDashData: async () => {
    const resolvedDocId = await revenueService.resolveDoctorId();
    const docId = resolvedDocId || localStorage.getItem('doctorId') || '';

    let earnings = 0;
    let monthlyRevenue = 0;
    let appointmentsCount = 0;
    let patientsCount = 0;
    let activeTherapySessions = 0;
    let latestAppointments = [];
    let pendingTasks = 0;

    try {
      const [todayRev, monthRev, patRes, apptRes, sessRes, taskRes] = await Promise.allSettled([
        revenueService.getDoctorRevenue(resolvedDocId, 'today'),
        revenueService.getDoctorRevenue(resolvedDocId, 'this_month'),
        patientService.getPatients({ size: 100 }),
        appointmentService.getAppointments('', 0, 10),
        therapyAssignmentService.getPatientSessions(null, 0, 50),
        taskService.getTasks(docId)
      ]);

      if (todayRev.status === 'fulfilled' && todayRev.value?.success) {
        earnings = todayRev.value.revenue || 0;
      }
      if (monthRev.status === 'fulfilled' && monthRev.value?.success) {
        monthlyRevenue = monthRev.value.revenue || 0;
      }
      if (patRes.status === 'fulfilled' && patRes.value?.success) {
        const docPatients = (patRes.value.patients || []).filter(p => !docId || p.assignedDoctor === docId);
        patientsCount = docPatients.length;
      }
      if (apptRes.status === 'fulfilled' && apptRes.value?.success) {
        const appts = apptRes.value.appointments || [];
        const docAppts = appts.filter(a => !docId || a.doctorId === docId);
        appointmentsCount = docAppts.length;
        latestAppointments = docAppts.slice(0, 5);
      }
      if (sessRes.status === 'fulfilled' && sessRes.value?.success) {
        activeTherapySessions = (sessRes.value.sessions || []).filter(s => s.status === 'Pending').length;
      }
      if (taskRes.status === 'fulfilled' && taskRes.value?.tasks) {
        pendingTasks = (taskRes.value.tasks || []).filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
      }
    } catch (e) {
      console.warn("Could not fetch real metrics for doctor dashboard:", e);
    }

    const dashData = {
      doctors: 0,
      appointments: appointmentsCount,
      patients: patientsCount,
      todayConsultations: 0,
      pendingFollowUps: 0,
      pendingTasks,
      activeTherapySessions,
      earnings,
      monthlyRevenue,
      latestAppointments,
    };
    return { success: true, dashData };
  },

  getProfileData: async () => {
    try {
      const docId = (await revenueService.resolveDoctorId()) || localStorage.getItem('doctorId');
      if (docId) {
        const { adminService } = await import('./adminService');
        const res = await adminService.getDoctorById(docId);
        if (res.success && res.doctor) {
          return { success: true, profileData: res.doctor };
        }
      }
    } catch (e) {
      console.warn("Could not fetch doctor profile:", e);
    }
    return {
      success: true,
      profileData: {
        name: localStorage.getItem('userName') || 'Doctor',
        email: localStorage.getItem('userEmail') || '',
        role: 'doctor',
        speciality: '',
        fees: 0,
        address: { line1: '', line2: '' },
        about: '',
        available: true
      }
    };
  },

  updateProfileData: async (updateData) => {
    try {
      const docId = (await revenueService.resolveDoctorId()) || localStorage.getItem('doctorId');
      if (docId) {
        const { adminService } = await import('./adminService');
        return await adminService.updateDoctor({ ...updateData, _id: docId, uuid: docId });
      }
    } catch (e) {
      console.warn("Could not update doctor profile:", e);
    }
    return { success: true, message: 'Profile updated' };
  }
};
