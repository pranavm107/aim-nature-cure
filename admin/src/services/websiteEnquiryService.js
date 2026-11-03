import apiClient from './apiClient';

/**
 * Website Appointment Enquiry Service
 * Connects to Spring Boot backend endpoints under /api/v1/website/enquiries
 */
export const websiteEnquiryService = {
  /**
   * Fetch paginated list of website appointment enquiries
   * @param {Object} params
   * @param {number} [params.page=0] - 0-indexed page number
   * @param {number} [params.size=10] - Number of items per page
   * @param {string} [params.status=''] - Filter by status (NEW, CONTACTED, CONFIRMED, CANCELLED)
   * @param {string} [params.search=''] - Search term (name or phone number)
   */
  getEnquiries: async ({ page = 0, size = 10, status = '', search = '' } = {}) => {
    try {
      const queryParams = {
        page: Math.max(0, page),
        size: Math.max(1, size)
      };

      if (status && status !== 'ALL' && status.trim() !== '') {
        queryParams.status = status.trim().toUpperCase();
      }

      if (search && search.trim() !== '') {
        queryParams.search = search.trim();
      }

      const response = await apiClient.get('/website/enquiries', {
        params: queryParams
      });

      const data = response.data || {};
      const result = data.result;
      const enquiries = Array.isArray(result) ? result : (result?.content || []);

      return {
        success: true,
        enquiries,
        totalElements: typeof data.totalElements === 'number' ? data.totalElements : (result?.totalElements || enquiries.length),
        totalPages: typeof data.noOfPages === 'number' ? data.noOfPages : (result?.totalPages || 1),
        numberOfElements: typeof data.noOfElements === 'number' ? data.noOfElements : enquiries.length,
        page,
        size
      };
    } catch (error) {
      console.error('Failed to fetch website enquiries:', error);
      return {
        success: false,
        enquiries: [],
        totalElements: 0,
        totalPages: 0,
        message: error.response?.data?.message || error.message || 'Failed to load website enquiries'
      };
    }
  },

  /**
   * Fetch single enquiry details by ID
   * @param {string} id - UUID of enquiry
   */
  getEnquiryById: async (id) => {
    try {
      const response = await apiClient.get('/website/enquiries/' + id);
      const data = response.data || {};
      const enquiry = data.result || data;

      return {
        success: true,
        enquiry
      };
    } catch (error) {
      console.error('Failed to fetch enquiry details:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to load enquiry details'
      };
    }
  },

  /**
   * Update enquiry workflow status
   * Supported statuses: NEW, CONTACTED, CONFIRMED, CANCELLED
   * @param {string} id - UUID of enquiry
   * @param {string} status - New status
   */
  updateEnquiryStatus: async (id, status) => {
    try {
      const normalizedStatus = (status || '').trim().toUpperCase();
      const response = await apiClient.put('/website/enquiries/' + id + '/status', {
        status: normalizedStatus
      });
      const data = response.data || {};

      return {
        success: true,
        enquiry: data.result || data,
        message: data.message || 'Enquiry status updated successfully'
      };
    } catch (error) {
      console.error('Failed to update enquiry status:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update enquiry status'
      };
    }
  },

  /**
   * Update WhatsApp verification status
   * Must only be called manually when staff verifies message receipt.
   * @param {string} id - UUID of enquiry
   * @param {string} [whatsappStatus='MESSAGE_RECEIVED']
   */
  updateWhatsAppStatus: async (id, whatsappStatus = 'MESSAGE_RECEIVED') => {
    try {
      const response = await apiClient.put('/website/enquiries/' + id + '/whatsapp-status', {
        whatsappStatus: whatsappStatus.trim()
      });
      const data = response.data || {};

      return {
        success: true,
        enquiry: data.result || data,
        message: data.message || 'WhatsApp status updated successfully'
      };
    } catch (error) {
      console.error('Failed to update WhatsApp status:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update WhatsApp status'
      };
    }
  },

  /**
   * Summary counts for ERP Dashboard
   * Leverages existing GET /website/enquiries with page=0&size=1 for lightweight counting
   */
  getEnquirySummary: async () => {
    try {
      const [totalRes, newRes, contactedRes, confirmedRes] = await Promise.all([
        websiteEnquiryService.getEnquiries({ page: 0, size: 1, status: '' }),
        websiteEnquiryService.getEnquiries({ page: 0, size: 1, status: 'NEW' }),
        websiteEnquiryService.getEnquiries({ page: 0, size: 1, status: 'CONTACTED' }),
        websiteEnquiryService.getEnquiries({ page: 0, size: 1, status: 'CONFIRMED' })
      ]);

      return {
        success: true,
        total: totalRes.totalElements || 0,
        newCount: newRes.totalElements || 0,
        contactedCount: contactedRes.totalElements || 0,
        confirmedCount: confirmedRes.totalElements || 0
      };
    } catch (error) {
      console.error('Failed to load enquiry summary:', error);
      return {
        success: false,
        total: 0,
        newCount: 0,
        contactedCount: 0,
        confirmedCount: 0,
        message: error.message || 'Failed to load summary'
      };
    }
  }
};

export default websiteEnquiryService;
