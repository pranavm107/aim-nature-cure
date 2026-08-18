import axios from 'axios';
import { toast } from 'react-toastify';

import { mockDoctors, mockAppointments, mockPatients, mockConsultations } from '../mocks/mockData';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const apiClient = axios.create({
  baseURL: backendUrl + '/api/v1', // Also updating to include /v1 as per API spec
  headers: {
    'Content-Type': 'application/json',
  },
});

if (USE_MOCK) {
  apiClient.defaults.adapter = async (config) => {
    console.log('[Mock Adapter] Intercepted:', config.method.toUpperCase(), config.url);
    let data = { success: true, message: 'Mock response' };

    const url = config.url || '';
    const method = config.method ? config.method.toUpperCase() : 'GET';
    const parsedData = config.data ? JSON.parse(config.data) : null;
    const aToken = config.headers?.aToken;
    const dToken = config.headers?.dToken;
    const isDoctor = !!dToken; // Simple check for mock routing

    // Auth
    if (url.includes('/login')) {
      data.token = url.includes('admin') ? 'mock-admin-token' : 'mock-doctor-token';
    } 
    // Dashboard & Profile
    else if (url.includes('/dashboard')) {
      data.dashData = {
        doctors: mockDoctors.length,
        appointments: mockAppointments.length,
        patients: mockPatients.length,
        latestAppointments: mockAppointments.slice(0, 5),
        earnings: 1250,
      };
    } 
    else if (url.includes('/doctor/profile')) {
      data.profileData = mockDoctors[0];
    } 
    else if (url.includes('/admin/all-doctors')) {
      data.doctors = mockDoctors;
    }
    // Patients
    else if (url.match(/\/patients$/) && method === 'GET') {
      // Mock BR-02: Doctor sees only assigned
      data.patients = isDoctor ? mockPatients.filter(p => p.assignedDoctor === 'doc1') : mockPatients;
    }
    else if (url.match(/\/patients\/search/)) {
      const q = new URLSearchParams(url.split('?')[1]).get('q')?.toLowerCase() || '';
      data.patients = mockPatients.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q));
    }
    else if (url.match(/\/patients$/) && method === 'POST') {
      const newPatient = { _id: "pat" + Date.now(), ...parsedData, date: Date.now() };
      mockPatients.push(newPatient);
      data.patient = newPatient;
    }
    else if (url.match(/\/patients\/([^\/]+)$/) && method === 'GET') {
      const id = url.split('/').pop();
      data.patient = mockPatients.find(p => p._id === id);
    }
    else if (url.match(/\/patients\/([^\/]+)$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const idx = mockPatients.findIndex(p => p._id === id);
      if(idx > -1) mockPatients[idx] = { ...mockPatients[idx], ...parsedData };
      data.patient = mockPatients[idx];
    }
    else if (url.includes('/status') && url.includes('/patients/')) {
      const id = url.split('/')[2];
      const idx = mockPatients.findIndex(p => p._id === id);
      if(idx > -1) mockPatients[idx].status = parsedData.status;
    }
    else if (url.includes('/assign-doctor') && url.includes('/patients/')) {
      const id = url.split('/')[2];
      const idx = mockPatients.findIndex(p => p._id === id);
      if(idx > -1) mockPatients[idx].assignedDoctor = parsedData.doctorId;
    }
    else if (url.includes('/timeline') && url.includes('/patients/')) {
      const id = url.split('/')[2];
      const patientConsultations = mockConsultations.filter(c => c.patientId === id);
      data.timeline = patientConsultations.map(c => ({ type: 'consultation', date: c.date, data: c }));
    }
    // Consultations
    else if (url.match(/\/patients\/([^\/]+)\/consultations$/) && method === 'GET') {
      const id = url.split('/')[2];
      data.consultations = mockConsultations.filter(c => c.patientId === id);
    }
    else if (url.match(/\/patients\/([^\/]+)\/consultations$/) && method === 'POST') {
      const patientId = url.split('/')[2];
      const newCons = { _id: "cons" + Date.now(), patientId, date: Date.now(), ...parsedData, addendums: [] };
      mockConsultations.push(newCons);
      data.consultation = newCons;
    }
    else if (url.match(/\/consultations\/([^\/]+)$/) && method === 'GET') {
      const id = url.split('/').pop();
      data.consultation = mockConsultations.find(c => c._id === id);
    }
    else if (url.match(/\/consultations\/([^\/]+)\/addendum$/) && method === 'POST') {
      const id = url.split('/')[2];
      const idx = mockConsultations.findIndex(c => c._id === id);
      if(idx > -1) {
        mockConsultations[idx].addendums.push({ date: Date.now(), text: parsedData.text });
      }
      data.consultation = mockConsultations[idx];
    }

    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    };
  };
}

// Interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const aToken = localStorage.getItem('aToken');
    const dToken = localStorage.getItem('dToken');
    if (aToken) {
      config.headers.aToken = aToken;
    } else if (dToken) {
      config.headers.dToken = dToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // If the server returns success: false with a message, throw an error to be caught by the service
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || 'Operation failed'));
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('aToken');
      localStorage.removeItem('dToken');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'Network Error';
    toast.error(message);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
