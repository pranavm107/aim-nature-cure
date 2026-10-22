import apiClient from './apiClient';

export const followUpService = {
  getFollowUps: async (search = '', page = 0, size = 10) => {
    try {
      const response = await apiClient.get('/follow-ups/all', {
        params: { search, page, size }
      });
      let result = response.data;
      if (result.result) result = result.result; // Normalize wrapped responses
      
      return {
        success: true,
        followUps: result.content || result.items || result.followUps || (Array.isArray(result) ? result : []),
        totalElements: result.totalElements || 0,
        totalPages: result.totalPages || 0,
        page: result.number || page,
        size: result.size || size
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load follow-ups'
      };
    }
  },

  getFollowUpById: async (followUpId) => {
    try {
      const response = await apiClient.get(`/follow-ups/${followUpId}`);
      let result = response.data;
      if (result.result) result = result.result;
      
      return {
        success: true,
        followUp: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load follow-up details'
      };
    }
  },

  updateFollowUpStatus: async (followUpId, status, description) => {
    try {
      const payload = { status };
      if (description !== undefined) {
        payload.description = description;
      }
      const response = await apiClient.put(`/follow-ups/${followUpId}/status`, payload);
      return {
        success: true,
        message: response.data?.message || 'Follow-up status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update follow-up status'
      };
    }
  },

  deleteFollowUp: async (followUpId) => {
    try {
      const response = await apiClient.delete(`/follow-ups/${followUpId}`);
      return {
        success: true,
        message: response.data?.message || 'Follow-up deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete follow-up'
      };
    }
  }
};
