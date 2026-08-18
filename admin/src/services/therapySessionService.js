import { realApiClient as apiClient } from './apiClient';

const therapySessionService = {
  assignToPatient: async (patientId, assignmentData) => {
    const response = await apiClient.post(`/patients/${patientId}/therapy-assignments`, assignmentData);
    return response.data; // { sessions, message }
  },

  getPatientSessions: async (patientId) => {
    const response = await apiClient.get(`/patients/${patientId}/therapy-sessions`);
    return response.data.sessions;
  },

  getAllSessions: async () => {
    const response = await apiClient.get(`/therapy-sessions`);
    return response.data.sessions;
  },

  completeSession: async (id, notes) => {
    const response = await apiClient.patch(`/therapy-sessions/${id}/complete`, { notes });
    return response.data.session;
  },

  rescheduleSession: async (id, date) => {
    const response = await apiClient.patch(`/therapy-sessions/${id}/reschedule`, { date });
    return response.data.session;
  }
};

export default therapySessionService;

