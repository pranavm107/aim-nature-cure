import apiClient from './apiClient';

export const consultationService = {
  getConsultations: async (patientId) => {
    const response = await apiClient.get(`/patients/${patientId}/consultations`);
    return response.data;
  },
  createConsultation: async (patientId, consultationData) => {
    const response = await apiClient.post(`/patients/${patientId}/consultations`, consultationData);
    return response.data;
  },
  getConsultationById: async (id) => {
    const response = await apiClient.get(`/consultations/${id}`);
    return response.data;
  },
  addConsultationAddendum: async (id, text) => {
    const response = await apiClient.post(`/consultations/${id}/addendum`, { text });
    return response.data;
  }
};
