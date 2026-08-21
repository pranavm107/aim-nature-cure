import { mockPatientDocuments } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const documentService = {
  getPatientDocuments: async (patientId) => {
    await delay();
    const documents = mockPatientDocuments.filter(d => d.patientId === patientId);
    return { success: true, documents };
  },
  
  uploadDocument: async (patientId, formData) => {
    await delay();
    const file = formData.get('file');
    const fileName = file && file.name ? file.name : "Uploaded Document";
    
    const newDoc = { 
      _id: "docm" + Date.now(), 
      patientId, 
      name: fileName, 
      type: file ? file.type : "application/pdf", 
      url: "mock-url.pdf", 
      date: Date.now() 
    };
    
    mockPatientDocuments.push(newDoc);
    return { success: true, document: newDoc };
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
