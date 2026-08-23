import { mockPatientDocuments } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

let state = {
  documents: getStore('mockPatientDocuments', mockPatientDocuments)
};

const saveState = () => setStore('mockPatientDocuments', state.documents);

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const documentService = {
  getPatientDocuments: async (patientId) => {
    await delay();
    const documents = state.documents.filter(d => d.patientId === patientId);
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
    
    state.documents.push(newDoc);
    saveState();
    return { success: true, document: newDoc };
  },
  
  updateDocument: async (patientId, docId, updates) => {
    await delay();
    const idx = state.documents.findIndex(d => d._id === docId);
    if (idx !== -1) {
      state.documents[idx] = { ...state.documents[idx], ...updates };
      saveState();
      return { success: true, document: state.documents[idx] };
    }
    throw new Error("Document not found");
  },
  
  deleteDocument: async (patientId, docId) => {
    await delay();
    const idx = state.documents.findIndex(d => d._id === docId);
    if (idx !== -1) {
      state.documents.splice(idx, 1);
      saveState();
    }
    return { success: true };
  }
};
