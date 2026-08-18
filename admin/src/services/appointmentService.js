import apiClient from './apiClient';

export const appointmentService = {
  getAllAppointments: async () => {
    const response = await apiClient.get('/appointments');
    return response.data;
  },
  getDoctorAppointments: async () => {
    const response = await apiClient.get('/appointments/doctor');
    return response.data;
  },
  getPatientAppointments: async (patientId) => {
    const response = await apiClient.get(`/patients/${patientId}/appointments`);
    return response.data;
  },
  createAppointment: async (appointmentData) => {
    const response = await apiClient.post('/appointments', appointmentData);
    return response.data;
  },
  updateAppointmentStatus: async (id, status) => {
    const response = await apiClient.patch(`/appointments/${id}/status`, { status });
    return response.data;
  }
};
