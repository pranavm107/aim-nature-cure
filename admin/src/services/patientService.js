import apiClient from './apiClient';

export const patientService = {
  getPatients: async () => {
    const response = await apiClient.get('/patients');
    return response.data;
  },
  searchPatients: async (query) => {
    const response = await apiClient.get(`/patients/search?q=${query}`);
    return response.data;
  },
  createPatient: async (patientData) => {
    const response = await apiClient.post('/patients', patientData);
    return response.data;
  },
  getPatientById: async (id) => {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },
  updatePatient: async (id, patientData) => {
    const response = await apiClient.put(`/patients/${id}`, patientData);
    return response.data;
  },
  setPatientStatus: async (id, status) => {
    const response = await apiClient.patch(`/patients/${id}/status`, { status });
    return response.data;
  },
  assignDoctor: async (id, doctorId) => {
    const response = await apiClient.patch(`/patients/${id}/assign-doctor`, { doctorId });
    return response.data;
  },
  getPatientTimeline: async (id) => {
    const response = await apiClient.get(`/patients/${id}/timeline`);
    return response.data;
  }
};
