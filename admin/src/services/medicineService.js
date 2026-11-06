import apiClient from './apiClient';

/**
 * Medicine Master Service
 * Interacts with Spring Boot reactive endpoints under /api/v1/medicines
 */
export const medicineService = {
  /**
   * Create a new medicine entry in master catalog
   * @param {Object} data - CreateMedicineRequest
   */
  createMedicine: async (data) => {
    try {
      const response = await apiClient.post('/medicines', data);
      return {
        success: true,
        data: response.data?.result || response.data,
        message: response.data?.message || 'Medicine created successfully'
      };
    } catch (error) {
      console.error('Error creating medicine:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create medicine',
        error
      };
    }
  },

  /**
   * Get paginated medicines with optional search and active status filters
   */
  getAllMedicines: async ({ search = '', active, page = 0, size = 10 } = {}) => {
    try {
      const params = {
        page: Math.max(0, page),
        size: Math.max(1, size)
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (typeof active === 'boolean') {
        params.active = active;
      }

      const response = await apiClient.get('/medicines', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        medicines: items,
        totalElements: typeof resData.totalElements === 'number' ? resData.totalElements : items.length,
        totalPages: typeof resData.noOfPages === 'number' ? resData.noOfPages : 1,
        numberOfElements: typeof resData.noOfElements === 'number' ? resData.noOfElements : items.length,
        page,
        size
      };
    } catch (error) {
      console.error('Error fetching medicines:', error);
      return {
        success: false,
        medicines: [],
        totalElements: 0,
        totalPages: 1,
        message: error.response?.data?.message || error.message || 'Failed to fetch medicines',
        error
      };
    }
  },

  /**
   * Get all active medicines for dropdowns in prescriptions/purchases
   */
  getActiveMedicines: async () => {
    try {
      const response = await apiClient.get('/medicines/active');
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);
      return {
        success: true,
        medicines: items
      };
    } catch (error) {
      console.error('Error fetching active medicines:', error);
      return {
        success: false,
        medicines: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch active medicines'
      };
    }
  },

  /**
   * Get medicine details by UUID
   */
  getMedicineById: async (id) => {
    try {
      const response = await apiClient.get(`/medicines/${id}`);
      return {
        success: true,
        medicine: response.data?.result || response.data
      };
    } catch (error) {
      console.error(`Error fetching medicine ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch medicine details'
      };
    }
  },

  /**
   * Update existing medicine
   */
  updateMedicine: async (id, data) => {
    try {
      const response = await apiClient.put(`/medicines/${id}`, { ...data, uuid: id });
      return {
        success: true,
        data: response.data?.result || response.data,
        message: response.data?.message || 'Medicine updated successfully'
      };
    } catch (error) {
      console.error(`Error updating medicine ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update medicine',
        error
      };
    }
  },

  /**
   * Deactivate or soft-delete medicine
   */
  deleteMedicine: async (id) => {
    try {
      const response = await apiClient.delete(`/medicines/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Medicine deactivated successfully'
      };
    } catch (error) {
      console.error(`Error deleting medicine ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to deactivate medicine',
        error
      };
    }
  }
};

export default medicineService;

