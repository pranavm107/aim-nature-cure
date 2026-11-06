import apiClient from './apiClient';

/**
 * Medicine Purchase Service
 * Interacts with Spring Boot reactive endpoints under /api/v1/medicine-purchases
 */
export const medicinePurchaseService = {
  /**
   * Create a new medicine purchase invoice and record inventory batch inflow
   * @param {Object} data - CreateMedicinePurchaseRequest
   */
  createPurchase: async (data) => {
    try {
      const response = await apiClient.post('/medicine-purchases', data);
      return {
        success: true,
        data: response.data?.result || response.data,
        message: response.data?.message || 'Medicine purchase recorded successfully'
      };
    } catch (error) {
      console.error('Error creating medicine purchase:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to record medicine purchase',
        error
      };
    }
  },

  /**
   * Get paginated purchases with search and date filters
   */
  getAllPurchases: async ({ search = '', startDate = '', endDate = '', page = 0, size = 10 } = {}) => {
    try {
      const params = {
        page: Math.max(0, page),
        size: Math.max(1, size)
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await apiClient.get('/medicine-purchases', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        purchases: items,
        totalElements: typeof resData.totalElements === 'number' ? resData.totalElements : items.length,
        totalPages: typeof resData.noOfPages === 'number' ? resData.noOfPages : 1,
        numberOfElements: typeof resData.noOfElements === 'number' ? resData.noOfElements : items.length,
        page,
        size
      };
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return {
        success: false,
        purchases: [],
        totalElements: 0,
        totalPages: 1,
        message: error.response?.data?.message || error.message || 'Failed to fetch purchases',
        error
      };
    }
  },

  /**
   * Get purchase details by UUID including all line items and batches
   */
  getPurchaseById: async (id) => {
    try {
      const response = await apiClient.get(`/medicine-purchases/${id}`);
      return {
        success: true,
        purchase: response.data?.result || response.data
      };
    } catch (error) {
      console.error(`Error fetching purchase ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch purchase details',
        error
      };
    }
  }
};

export default medicinePurchaseService;

