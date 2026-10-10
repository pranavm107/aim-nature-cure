import apiClient from './apiClient';

const packageService = {
  getAllPackages: async (search = '', page = 0, size = 10) => {
    try {
      const response = await apiClient.get('/packages/all', {
        params: { search, page, size }
      });
      let result = response.data;
      if (result.result) result = result.result; // Normalize wrapped responses
      
      return {
        success: true,
        packages: result.content || result.packages || result.items || (Array.isArray(result) ? result : []),
        totalElements: result.totalElements || 0,
        totalPages: result.totalPages || 0,
        page: result.number || page,
        size: result.size || size
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch packages'
      };
    }
  },

  getPackageById: async (packageId) => {
    try {
      const response = await apiClient.get(`/packages/${packageId}`);
      let result = response.data;
      if (result.result) result = result.result;
      
      return result; // Or { success: true, package: result } depending on UI usage. We will return raw result as previous mock did
    } catch (error) {
      throw error;
    }
  },

  createPackage: async (payload) => {
    try {
      const response = await apiClient.post('/packages/create', payload);
      let result = response.data;
      if (result.result) result = result.result;
      
      return {
        success: true,
        package: result,
        message: 'Package created successfully'
      };
    } catch (error) {
      throw error; // Let UI handle it or return success: false
    }
  },

  updatePackage: async (payload) => {
    try {
      const response = await apiClient.put('/packages/update', payload);
      let result = response.data;
      if (result.result) result = result.result;
      
      return {
        success: true,
        package: result,
        message: 'Package updated successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  deletePackage: async (packageId) => {
    try {
      const response = await apiClient.delete(`/packages/${packageId}`);
      return {
        success: true,
        message: response.data?.message || 'Package deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete package'
      };
    }
  }
};

export default packageService;
