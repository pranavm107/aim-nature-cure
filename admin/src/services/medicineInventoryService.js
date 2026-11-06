import apiClient from './apiClient';

/**
 * Medicine Inventory Service
 * Interacts with Spring Boot reactive endpoints for stock, batches, movements & adjustments
 */
export const medicineInventoryService = {
  /**
   * Get stock summary list with pagination, search and status filter
   * @param {Object} params
   * @param {string} [params.search]
   * @param {string} [params.status] - IN_STOCK, LOW_STOCK, OUT_OF_STOCK
   * @param {number} [params.page=0]
   * @param {number} [params.size=10]
   */
  getStockSummaries: async ({ search = '', status = '', page = 0, size = 10 } = {}) => {
    try {
      const params = {
        page: Math.max(0, page),
        size: Math.max(1, size)
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (status && status !== 'ALL') {
        params.status = status;
      }

      const response = await apiClient.get('/medicines/stock', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        stockSummaries: items,
        totalElements: typeof resData.totalElements === 'number' ? resData.totalElements : items.length,
        totalPages: typeof resData.noOfPages === 'number' ? resData.noOfPages : 1,
        numberOfElements: typeof resData.noOfElements === 'number' ? resData.noOfElements : items.length,
        page,
        size
      };
    } catch (error) {
      console.error('Error fetching stock summaries:', error);
      return {
        success: false,
        stockSummaries: [],
        totalElements: 0,
        totalPages: 1,
        message: error.response?.data?.message || error.message || 'Failed to fetch stock summaries',
        error
      };
    }
  },

  /**
   * Get list of medicines running below minimum stock level
   */
  getLowStockMedicines: async ({ search = '', page = 0, size = 10 } = {}) => {
    try {
      const params = {
        page: Math.max(0, page),
        size: Math.max(1, size)
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiClient.get('/medicines/stock/low', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        lowStockMedicines: items,
        totalElements: typeof resData.totalElements === 'number' ? resData.totalElements : items.length,
        totalPages: typeof resData.noOfPages === 'number' ? resData.noOfPages : 1,
        numberOfElements: typeof resData.noOfElements === 'number' ? resData.noOfElements : items.length,
        page,
        size
      };
    } catch (error) {
      console.error('Error fetching low stock medicines:', error);
      return {
        success: false,
        lowStockMedicines: [],
        totalElements: 0,
        totalPages: 1,
        message: error.response?.data?.message || error.message || 'Failed to fetch low stock alerts',
        error
      };
    }
  },

  /**
   * Get batches expiring within given number of days (default 90)
   */
  getExpiringBatches: async ({ days = 90, page = 0, size = 10 } = {}) => {
    try {
      const params = {
        days,
        page: Math.max(0, page),
        size: Math.max(1, size)
      };

      const response = await apiClient.get('/medicines/stock/expiry', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        expiringBatches: items,
        totalElements: typeof resData.totalElements === 'number' ? resData.totalElements : items.length,
        totalPages: typeof resData.noOfPages === 'number' ? resData.noOfPages : 1,
        numberOfElements: typeof resData.noOfElements === 'number' ? resData.noOfElements : items.length,
        page,
        size
      };
    } catch (error) {
      console.error('Error fetching expiring batches:', error);
      return {
        success: false,
        expiringBatches: [],
        totalElements: 0,
        totalPages: 1,
        message: error.response?.data?.message || error.message || 'Failed to fetch expiring batches',
        error
      };
    }
  },

  /**
   * Get active batches for a specific medicine
   */
  getBatchesByMedicine: async (medicineId) => {
    try {
      const response = await apiClient.get(`/medicines/${medicineId}/batches`);
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        batches: items
      };
    } catch (error) {
      console.error(`Error fetching batches for medicine ${medicineId}:`, error);
      return {
        success: false,
        batches: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch batches',
        error
      };
    }
  },

  /**
   * Get stock movement audit trail
   */
  getStockMovements: async ({ medicineId = null, movementType = '', page = 0, size = 20 } = {}) => {
    try {
      const params = {
        page: Math.max(0, page),
        size: Math.max(1, size)
      };
      if (medicineId) {
        params.medicineId = medicineId;
      }
      if (movementType && movementType !== 'ALL') {
        params.movementType = movementType;
      }

      const response = await apiClient.get('/medicine-stock-movements', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        movements: items,
        totalElements: typeof resData.totalElements === 'number' ? resData.totalElements : items.length,
        totalPages: typeof resData.noOfPages === 'number' ? resData.noOfPages : 1,
        numberOfElements: typeof resData.noOfElements === 'number' ? resData.noOfElements : items.length,
        page,
        size
      };
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      return {
        success: false,
        movements: [],
        totalElements: 0,
        totalPages: 1,
        message: error.response?.data?.message || error.message || 'Failed to fetch stock movements',
        error
      };
    }
  },

  /**
   * Adjust stock manually (e.g. DAMAGE, EXPIRY, MANUAL_ADJUSTMENT)
   * @param {Object} data - StockAdjustmentRequest
   */
  adjustStock: async (data) => {
    try {
      const response = await apiClient.post('/medicines/stock/adjust', data);
      return {
        success: true,
        data: response.data?.result || response.data,
        message: response.data?.message || 'Stock adjusted successfully'
      };
    } catch (error) {
      console.error('Error adjusting stock:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to adjust stock',
        error
      };
    }
  }
};

export default medicineInventoryService;

