import { mockPatients, mockConsultations, mockTherapySessions } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

let state = {
  patients: getStore('mockPatients', mockPatients)
};

const saveState = () => setStore('mockPatients', state.patients);

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const patientService = {
  getPatients: async () => {
    await delay();
    const role = localStorage.getItem('userRole');
    // Assuming doc1 for mock doctor session based on mock Credentials
    const docId = 'doc1'; 
    
    // BR-02: Doctor sees only assigned patients
    const patients = role === 'doctor' 
      ? state.patients.filter(p => p.assignedDoctor === docId)
      : state.patients;
      
    return { success: true, patients };
  },
  
  searchPatients: async (query) => {
    await delay();
    const q = query.toLowerCase();
    const role = localStorage.getItem('userRole');
    const docId = 'doc1';
    
    let patients = state.patients.filter(p => 
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
    state.patients.push(newPatient);
    saveState();
    return { success: true, patient: newPatient };
  },
  
  getPatientById: async (id) => {
    await delay();
    const patient = state.patients.find(p => p._id === id);
    if (!patient) throw new Error("Patient not found");
    return { success: true, patient };
  },
  
  updatePatient: async (id, patientData) => {
    await delay();
    const idx = state.patients.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Patient not found");
    
    state.patients[idx] = { ...state.patients[idx], ...patientData };
    saveState();
    return { success: true, patient: state.patients[idx] };
  },
  
  setPatientStatus: async (id, status) => {
    await delay();
    const idx = state.patients.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Patient not found");
    
    state.patients[idx].status = status;
    saveState();
    return { success: true, patient: state.patients[idx] };
  },
  
  assignDoctor: async (id, doctorId) => {
    await delay();
    const idx = state.patients.findIndex(p => p._id === id);
    if (idx === -1) throw new Error("Patient not found");
    
    state.patients[idx].assignedDoctor = doctorId;
    saveState();
    return { success: true, patient: state.patients[idx] };
  },
  
  getPatientTimeline: async (id) => {
    await delay();
    const consultations = getStore('mockConsultations', mockConsultations);
    const sessions = getStore('mockTherapySessions', mockTherapySessions);
    
    const patientConsultations = consultations.filter(c => c.patientId === id);
    
    const completedSessions = sessions
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
