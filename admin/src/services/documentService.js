import { mockPatientDocuments } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const documentService = {
  getPatientDocuments: async (patientId) => {
    await delay();
    const documents = mockPatientDocuments.filter(d => d.patientId === patientId);
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
    
    mockPatientDocuments.push(newDoc);
    return { success: true, document: newDoc };
  },
  
  updateDocument: async (patientId, docId, updates) => {
    await delay();
    const idx = mockPatientDocuments.findIndex(d => d._id === docId);
    if (idx !== -1) {
      mockPatientDocuments[idx] = { ...mockPatientDocuments[idx], ...updates };
      return { success: true, document: mockPatientDocuments[idx] };
    }
    throw new Error("Document not found");
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
