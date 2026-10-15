import apiClient from './apiClient';

export const analyticsService = {
  getDashboardData: async () => {
    try {
      const response = await apiClient.get('/dashboard/admin');
      let result = response.data;
      if (result.result) result = result.result;
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard data'
      };
    }
  }
};