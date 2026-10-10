import apiClient from './apiClient';

export const appointmentService = {
  getAppointments: async (search = '', page = 0, size = 10) => {
    try {
      const response = await apiClient.get('/appointments/all', {
        params: { search, page, size }
      });
      let result = response.data;
      if (result.result) result = result.result;
      
      return { 
        success: true, 
        appointments: result.content || [],
        totalElements: result.totalElements || 0,
        totalPages: result.totalPages || 0,
        page: result.page || 0,
        size: result.size || 10
      };
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to load appointments' };
    }
  },

  getAllAppointments: async () => {
    // For components that haven't been migrated to server-side pagination yet
    // Defaulting to page 0, size 100 for backward compatibility
    return appointmentService.getAppointments('', 0, 100);
  },

  getAppointmentById: async (appointmentId) => {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`);
      let appointment = response.data;
      if (appointment.result) appointment = appointment.result;
      return { success: true, appointment };
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to load appointment details' };
    }
  },

  createAppointment: async (payload) => {
    try {
      // payload expects: patientId, doctorId, appointmentDate, appointmentTime
      const response = await apiClient.post('/appointments/create', payload);
      let appointment = response.data;
      if (appointment.result) appointment = appointment.result;
      return { success: true, appointment, message: response.data?.message || 'Appointment created successfully' };
    } catch (error) {
      console.error("Failed to create appointment:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to create appointment' };
    }
  },

  updateAppointment: async (payload) => {
    try {
      // payload expects: uuid, patientId, doctorId, appointmentDate, appointmentTime, status
      const response = await apiClient.put('/appointments/update', payload);
      let appointment = response.data;
      if (appointment.result) appointment = appointment.result;
      return { success: true, appointment, message: response.data?.message || 'Appointment updated successfully' };
    } catch (error) {
      console.error("Failed to update appointment:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to update appointment' };
    }
  },

  completeAppointment: async (appointmentId) => {
    try {
      const response = await apiClient.patch(`/appointments/status/complete/${appointmentId}`);
      let appointment = response.data;
      if (appointment.result) appointment = appointment.result;
      return { success: true, appointment, message: response.data?.message || 'Appointment marked as completed' };
    } catch (error) {
      console.error("Failed to complete appointment:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to complete appointment' };
    }
  },

  cancelAppointment: async (appointmentId, reason) => {
    try {
      const response = await apiClient.patch(`/appointments/status/cancel/${appointmentId}`, null, {
        params: { reason }
      });
      let appointment = response.data;
      if (appointment.result) appointment = appointment.result;
      return { success: true, appointment, message: response.data?.message || 'Appointment cancelled successfully' };
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to cancel appointment' };
    }
  },

  deleteAppointment: async (appointmentId, reason) => {
    try {
      const response = await apiClient.delete(`/appointments/${appointmentId}`, {
        params: { reason }
      });
      return { success: true, message: response.data?.message || 'Appointment deleted successfully' };
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete appointment' };
    }
  }
};
