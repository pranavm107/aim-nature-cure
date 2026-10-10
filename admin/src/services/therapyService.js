import apiClient from './apiClient';

const therapyService = {
  getTherapiesDropdown: async () => {
    try {
      const response = await apiClient.get('/therapies/all/dropdown');
      let result = response.data;
      if (result.result) result = result.result;
      
      return {
        success: true,
        therapies: (Array.isArray(result) ? result : []).map(t => ({ ...t, _id: t.uuid }))
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch therapy dropdown'
      };
    }
  },

  getAllTherapies: async (search = '', page = 0, size = 10) => {
    try {
      const response = await apiClient.get('/therapies/all', {
        params: { search, page, size }
      });
      let result = response.data;
      if (result.result) result = result.result; // Normalize wrapped responses
      
      return {
        success: true,
        therapies: result.content || result.therapies || result.items || (Array.isArray(result) ? result : []),
        totalElements: result.totalElements || 0,
        totalPages: result.totalPages || 0,
        page: result.number || page,
        size: result.size || size
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch therapies'
      };
    }
  },

  getTherapyById: async (therapyId) => {
    try {
      const response = await apiClient.get(`/therapies/${therapyId}`);
      let result = response.data;
      if (result.result) result = result.result;
      
      return {
        success: true,
        therapy: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch therapy details'
      };
    }
  },

  createTherapy: async (payload) => {
    try {
      const response = await apiClient.post('/therapies/create', payload);
      let result = response.data;
      if (result.result) result = result.result;
      
      return {
        success: true,
        therapy: result,
        message: 'Therapy created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create therapy'
      };
    }
  },

  updateTherapy: async (payload) => {
    try {
      const response = await apiClient.put('/therapies/update', payload);
      let result = response.data;
      if (result.result) result = result.result;
      
      return {
        success: true,
        therapy: result,
        message: 'Therapy updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update therapy'
      };
    }
  },

  deleteTherapy: async (therapyId) => {
    try {
      const response = await apiClient.delete(`/therapies/${therapyId}`);
      return {
        success: true,
        message: response.data?.message || 'Therapy deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete therapy'
      };
    }
  }
};

export default therapyService;
