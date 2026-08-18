import { realApiClient as apiClient } from './apiClient';

const therapyService = {
  getAllTherapies: async () => {
    const response = await apiClient.get('/therapies');
    return response.data.therapies;
  },

  createTherapy: async (data) => {
    const response = await apiClient.post('/therapies', data);
    return response.data.therapy;
  },

  updateTherapy: async (id, data) => {
    const response = await apiClient.put(`/therapies/${id}`, data);
    return response.data.therapy;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/therapies/${id}/status`, { status });
    return response.data.therapy;
  }
};

export default therapyService;

