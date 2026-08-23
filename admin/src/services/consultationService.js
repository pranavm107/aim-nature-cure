import { mockConsultations } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

let state = {
  consultations: getStore('mockConsultations', mockConsultations)
};

const saveState = () => setStore('mockConsultations', state.consultations);

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const consultationService = {
  getConsultations: async (patientId) => {
    await delay();
    const consultations = state.consultations.filter(c => c.patientId === patientId);
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
    state.consultations.push(newCons);
    saveState();
    return { success: true, consultation: newCons };
  },
  
  getConsultationById: async (id) => {
    await delay();
    const consultation = state.consultations.find(c => c._id === id);
    if (!consultation) throw new Error("Consultation not found");
    return { success: true, consultation };
  },
  
  // Immutability rule BR-13: Can only add addendums, cannot update original fields
  addConsultationAddendum: async (id, text) => {
    await delay();
    const idx = state.consultations.findIndex(c => c._id === id);
    if (idx === -1) throw new Error("Consultation not found");
    
    if (!state.consultations[idx].addendums) {
      state.consultations[idx].addendums = [];
    }
    state.consultations[idx].addendums.push({ date: Date.now(), notes: text });
    saveState();
    return { success: true, consultation: state.consultations[idx] };
  }
};
