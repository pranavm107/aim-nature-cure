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
