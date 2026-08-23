import { mockAppointments } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

let state = {
  appointments: getStore('mockAppointments', mockAppointments)
};

const saveState = () => setStore('mockAppointments', state.appointments);

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const appointmentService = {
  getAllAppointments: async () => {
    await delay();
    return { success: true, appointments: state.appointments };
  },
  
  getDoctorAppointments: async () => {
    await delay();
    const docId = 'doc1'; // Mock doctor id
    const appointments = state.appointments.filter(a => a.docId === docId);
    return { success: true, appointments };
  },
  
  getPatientAppointments: async (patientId) => {
    await delay();
    const appointments = state.appointments.filter(a => a.userId === patientId);
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
    state.appointments.push(newAppt);
    saveState();
    return { success: true, appointment: newAppt };
  },
  
  updateAppointmentStatus: async (id, status) => {
    await delay();
    const idx = state.appointments.findIndex(a => a._id === id);
    if (idx === -1) throw new Error("Appointment not found");
    
    if (status === 'Completed') state.appointments[idx].isCompleted = true;
    else if (status === 'Cancelled') state.appointments[idx].cancelled = true;
    
    saveState();
    return { success: true, appointment: state.appointments[idx] };
  }
};
