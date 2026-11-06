import apiClient from './apiClient';

/**
 * Medicine Report & Analytics Service
 * Interacts with Spring Boot reactive endpoints under /api/v1/medicine-reports
 */
export const medicineReportService = {
  /**
   * Get medicine sales revenue report
   * @param {Object} params
   * @param {string} [params.period='this_month'] - today, this_week, this_month, this_year, custom, all
   * @param {string} [params.fromDate]
   * @param {string} [params.toDate]
   */
  getRevenueReport: async ({ period = 'this_month', fromDate = '', toDate = '' } = {}) => {
    try {
      const params = { period };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await apiClient.get('/medicine-reports/revenue', { params });
      return {
        success: true,
        report: response.data?.result || response.data
      };
    } catch (error) {
      console.error('Error fetching medicine revenue report:', error);
      return {
        success: false,
        report: null,
        message: error.response?.data?.message || error.message || 'Failed to fetch revenue report',
        error
      };
    }
  },

  /**
   * Get medicine profit and loss report (Revenue, COGS, Gross Profit)
   */
  getProfitReport: async ({ period = 'this_month', fromDate = '', toDate = '' } = {}) => {
    try {
      const params = { period };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await apiClient.get('/medicine-reports/profit', { params });
      return {
        success: true,
        report: response.data?.result || response.data
      };
    } catch (error) {
      console.error('Error fetching medicine profit report:', error);
      return {
        success: false,
        report: null,
        message: error.response?.data?.message || error.message || 'Failed to fetch profit report',
        error
      };
    }
  },

  /**
   * Get current total inventory stock valuation (at cost vs at selling price)
   */
  getStockValuation: async () => {
    try {
      const response = await apiClient.get('/medicine-reports/stock-value');
      return {
        success: true,
        valuation: response.data?.result || response.data
      };
    } catch (error) {
      console.error('Error fetching stock valuation:', error);
      return {
        success: false,
        valuation: null,
        message: error.response?.data?.message || error.message || 'Failed to fetch stock valuation',
        error
      };
    }
  },

  /**
   * Get top selling medicines ranked by volume and revenue
   */
  getTopSellingMedicines: async ({ period = 'this_month', fromDate = '', toDate = '', limit = 10 } = {}) => {
    try {
      const params = { period, limit };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await apiClient.get('/medicine-reports/top-selling', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        medicines: items
      };
    } catch (error) {
      console.error('Error fetching top selling medicines:', error);
      return {
        success: false,
        medicines: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch top selling medicines',
        error
      };
    }
  },

  /**
   * Get patient-wise medicine billing and outstanding report
   */
  getPatientWiseReport: async ({ search = '', page = 0, size = 10 } = {}) => {
    try {
      const params = {
        page: Math.max(0, page),
        size: Math.max(1, size)
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiClient.get('/medicine-reports/patient-wise', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        patientReports: items,
        totalElements: typeof resData.totalElements === 'number' ? resData.totalElements : items.length,
        totalPages: typeof resData.noOfPages === 'number' ? resData.noOfPages : 1,
        numberOfElements: typeof resData.noOfElements === 'number' ? resData.noOfElements : items.length,
        page,
        size
      };
    } catch (error) {
      console.error('Error fetching patient wise medicine report:', error);
      return {
        success: false,
        patientReports: [],
        totalElements: 0,
        totalPages: 1,
        message: error.response?.data?.message || error.message || 'Failed to fetch patient report',
        error
      };
    }
  }
};

export default medicineReportService;

