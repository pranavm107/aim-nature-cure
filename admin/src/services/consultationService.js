import apiClient from './apiClient';

export const consultationService = {
  getConsultations: async (filters = {}) => {
    try {
      const response = await apiClient.get('/consultations/all', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }
  },

  getConsultationById: async (id) => {
    try {
      const response = await apiClient.get(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation by id:', error);
      throw error;
    }
  },

  createConsultation: async (consultationData) => {
    try {
      const response = await apiClient.post('/consultations/create', consultationData);
      return response.data;
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  },

  updateConsultation: async (consultationData) => {
    try {
      const response = await apiClient.put('/consultations/update', consultationData);
      return response.data;
    } catch (error) {
      console.error('Error updating consultation:', error);
      throw error;
    }
  },

  deleteConsultation: async (id) => {
    try {
      const response = await apiClient.delete(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting consultation:', error);
      throw error;
    }
  }
};
