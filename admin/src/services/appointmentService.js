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
