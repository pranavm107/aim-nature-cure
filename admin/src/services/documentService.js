import apiClient from './apiClient';

export const documentService = {
  getPatientDocuments: async (patientId) => {
    const response = await apiClient.get(`/patients/${patientId}/documents`);
    return response.data;
  },
  uploadDocument: async (patientId, formData) => {
    // In a real app this uses multipart/form-data. For mock we just pass the object
    const response = await apiClient.post(`/patients/${patientId}/documents`, formData);
    return response.data;
  },
  deleteDocument: async (patientId, documentId) => {
    const response = await apiClient.delete(`/patients/${patientId}/documents/${documentId}`);
    return response.data;
  }
};
