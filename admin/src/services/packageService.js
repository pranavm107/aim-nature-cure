import { realApiClient as apiClient } from './apiClient';

const packageService = {
  getAllPackages: async () => {
    const response = await apiClient.get('/packages');
    return response.data.packages;
  },

  createPackage: async (data) => {
    const response = await apiClient.post('/packages', data);
    return response.data.package;
  },

  updatePackage: async (id, data) => {
    const response = await apiClient.put(`/packages/${id}`, data);
    return response.data.package;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/packages/${id}/status`, { status });
    return response.data.package;
  }
};

export default packageService;

