import apiClient from './apiClient';

/**
 * Medicine Issue & Dispensing Service
 * Interacts with Spring Boot reactive endpoints under /api/v1/medicine-issues
 */
export const medicineIssueService = {
  /**
   * Dispense/Issue medicine to a patient, automatically allocating batches (FIFO) or manual batches,
   * creating an invoice if requested and taking optional immediate payment.
   * @param {Object} data - CreateMedicineIssueRequest
   */
  issueMedicine: async (data) => {
    try {
      const response = await apiClient.post('/medicine-issues', data);
      return {
        success: true,
        data: response.data?.result || response.data,
        message: response.data?.message || 'Medicine issued successfully'
      };
    } catch (error) {
      console.error('Error issuing medicine:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to issue medicine',
        error
      };
    }
  },

  /**
   * Get paginated medicine issues with optional patient and date filtering
   */
  getAllIssues: async ({ patientId = null, startDate = '', endDate = '', page = 0, size = 10 } = {}) => {
    try {
      const params = {
        page: Math.max(0, page),
        size: Math.max(1, size)
      };
      if (patientId) {
        params.patientId = patientId;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await apiClient.get('/medicine-issues', { params });
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        issues: items,
        totalElements: typeof resData.totalElements === 'number' ? resData.totalElements : items.length,
        totalPages: typeof resData.noOfPages === 'number' ? resData.noOfPages : 1,
        numberOfElements: typeof resData.noOfElements === 'number' ? resData.noOfElements : items.length,
        page,
        size
      };
    } catch (error) {
      console.error('Error fetching medicine issues:', error);
      return {
        success: false,
        issues: [],
        totalElements: 0,
        totalPages: 1,
        message: error.response?.data?.message || error.message || 'Failed to fetch medicine issues',
        error
      };
    }
  },

  /**
   * Get single medicine issue details by ID (including all dispensed batch items)
   */
  getIssueById: async (id) => {
    try {
      const response = await apiClient.get(`/medicine-issues/${id}`);
      return {
        success: true,
        issue: response.data?.result || response.data
      };
    } catch (error) {
      console.error(`Error fetching issue ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch issue details',
        error
      };
    }
  },

  /**
   * Get all medicine issues dispensed to a specific patient
   */
  getIssuesByPatient: async (patientId) => {
    try {
      const response = await apiClient.get(`/medicine-issues/patient/${patientId}`);
      const resData = response.data || {};
      const items = Array.isArray(resData.result) ? resData.result : (resData.result?.content || []);

      return {
        success: true,
        issues: items
      };
    } catch (error) {
      console.error(`Error fetching issues for patient ${patientId}:`, error);
      return {
        success: false,
        issues: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch patient issues',
        error
      };
    }
  }
};

export default medicineIssueService;

