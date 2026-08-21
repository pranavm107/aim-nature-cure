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
