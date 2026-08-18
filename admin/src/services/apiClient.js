import axios from 'axios';
import { toast } from 'react-toastify';

import { mockDoctors, mockAppointments, mockPatients, mockConsultations, mockPatientDocuments, mockTherapies, mockPackages, mockTherapySessions } from '../mocks/mockData';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const apiClient = axios.create({
  baseURL: backendUrl + '/api/v1', // Also updating to include /v1 as per API spec
  headers: {
    'Content-Type': 'application/json',
  },
});

export const realApiClient = axios.create({
  baseURL: backendUrl + '/api', // Backend routes are actually under /api, not /api/v1 currently
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
    let parsedData = null;
    try {
      if (config.data && typeof config.data === 'string') {
        parsedData = JSON.parse(config.data);
      } else if (config.data instanceof FormData) {
        parsedData = {};
        for (let [key, value] of config.data.entries()) {
          parsedData[key] = value;
        }
      } else if (typeof config.data === 'object') {
        parsedData = config.data;
      }
    } catch (e) {
      console.warn("Could not parse mock request data", e);
    }
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
      
      let realSessions = [];
      try {
        const res = await realApiClient.get(`/patients/${id}/therapy-sessions`);
        realSessions = res.data.sessions.filter(s => s.status === 'Completed').map(s => {
          return {
            ...s,
            date: new Date(s.completionDate).getTime(),
            therapyId: s.therapy?._id || s.therapy,
            _id: s._id,
            status: s.status,
            notes: s.notes
          };
        });
      } catch (err) {
        console.error("Failed to fetch real sessions for timeline:", err);
      }
      
      const timeline = [
        ...patientConsultations.map(c => ({ type: 'consultation', date: c.date, data: c })),
        ...realSessions.map(s => ({ type: 'therapy_session', date: s.date, data: s }))
      ].sort((a, b) => b.date - a.date); // Descending
      
      data.timeline = timeline;
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
    // Appointments
    else if (url.match(/\/appointments$/) && method === 'GET') {
      data.appointments = mockAppointments;
    }
    else if (url.match(/\/appointments\/doctor$/) && method === 'GET') {
      data.appointments = mockAppointments.filter(a => a.docId === 'doc1'); // mock doctor 1
    }
    else if (url.match(/\/patients\/([^\/]+)\/appointments$/) && method === 'GET') {
      const patientId = url.split('/')[2];
      data.appointments = mockAppointments.filter(a => a.userId === patientId);
    }
    else if (url.match(/\/appointments$/) && method === 'POST') {
      const newAppt = { _id: "app" + Date.now(), ...parsedData, date: Date.now(), isCompleted: false, cancelled: false };
      mockAppointments.push(newAppt);
      data.appointment = newAppt;
    }
    else if (url.match(/\/appointments\/([^\/]+)\/status$/) && method === 'PATCH') {
      const id = url.split('/')[2];
      const idx = mockAppointments.findIndex(a => a._id === id);
      if(idx > -1) {
        if (parsedData.status === 'Completed') mockAppointments[idx].isCompleted = true;
        else if (parsedData.status === 'Cancelled') mockAppointments[idx].cancelled = true;
      }
      data.appointment = mockAppointments[idx];
    }
    // Documents
    else if (url.match(/\/patients\/([^\/]+)\/documents$/) && method === 'GET') {
      const patientId = url.split('/')[2];
      data.documents = mockPatientDocuments.filter(d => d.patientId === patientId);
    }
    else if (url.match(/\/patients\/([^\/]+)\/documents$/) && method === 'POST') {
      const patientId = url.split('/')[2];
      const fileName = (parsedData?.file && parsedData.file.name) ? parsedData.file.name : "Uploaded Document";
      const newDoc = { 
        _id: "docm" + Date.now(), 
        patientId, 
        name: fileName, 
        type: "application/pdf", 
        url: "mock-url.pdf", 
        date: Date.now() 
      };
      mockPatientDocuments.push(newDoc);
      data.document = newDoc;
    }
    else if (url.match(/\/patients\/([^\/]+)\/documents\/([^\/]+)$/) && method === 'DELETE') {
      const docId = url.split('/')[4];
      const idx = mockPatientDocuments.findIndex(d => d._id === docId);
      if(idx > -1) mockPatientDocuments.splice(idx, 1);
      data.success = true;
    }
    // Therapies & Packages
    else if (url.match(/\/therapies$/) && method === 'GET') {
      data.therapies = mockTherapies;
    }
    else if (url.match(/\/therapies$/) && method === 'POST') {
      const newTherapy = { _id: "ther" + Date.now(), ...parsedData, date: Date.now() };
      mockTherapies.push(newTherapy);
      data.therapy = newTherapy;
    }
    else if (url.match(/\/therapies\/([^\/]+)$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const idx = mockTherapies.findIndex(t => t._id === id);
      if(idx > -1) mockTherapies[idx] = { ...mockTherapies[idx], ...parsedData };
      data.therapy = mockTherapies[idx];
    }
    else if (url.match(/\/therapies\/([^\/]+)\/status$/) && method === 'PATCH') {
      const id = url.split('/')[2];
      const idx = mockTherapies.findIndex(t => t._id === id);
      if(idx > -1) mockTherapies[idx].status = parsedData.status;
      data.therapy = mockTherapies[idx];
    }
    else if (url.match(/\/packages$/) && method === 'GET') {
      data.packages = mockPackages;
    }
    else if (url.match(/\/packages$/) && method === 'POST') {
      const newPackage = { _id: "pkg" + Date.now(), ...parsedData, date: Date.now() };
      mockPackages.push(newPackage);
      data.package = newPackage;
    }
    else if (url.match(/\/packages\/([^\/]+)$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const idx = mockPackages.findIndex(p => p._id === id);
      if(idx > -1) mockPackages[idx] = { ...mockPackages[idx], ...parsedData };
      data.package = mockPackages[idx];
    }
    else if (url.match(/\/packages\/([^\/]+)\/status$/) && method === 'PATCH') {
      const id = url.split('/')[2];
      const idx = mockPackages.findIndex(p => p._id === id);
      if(idx > -1) mockPackages[idx].status = parsedData.status;
      data.package = mockPackages[idx];
    }
    // Therapy Assignments & Sessions
    else if (url.match(/\/patients\/([^\/]+)\/therapy-assignments$/) && method === 'POST') {
      const patientId = url.split('/')[2];
      const { type, itemId, assignedDocId } = parsedData; // type can be 'therapy' or 'package'
      
      let generatedSessions = [];
      const sessionBase = { patientId, docId: assignedDocId || 'doc1', scheduledDate: new Date().toISOString().split('T')[0], status: 'Pending', notes: '', date: Date.now() };
      
      if (type === 'package') {
        const pkg = mockPackages.find(p => p._id === itemId);
        if (pkg) {
          pkg.therapies.forEach(tItem => {
            for(let i=0; i<tItem.count; i++) {
              generatedSessions.push({ _id: "sess" + Date.now() + Math.random(), therapyId: tItem.therapyId, ...sessionBase });
            }
          });
        }
      } else if (type === 'therapy') {
        generatedSessions.push({ _id: "sess" + Date.now(), therapyId: itemId, ...sessionBase });
      }
      mockTherapySessions.push(...generatedSessions);
      data.sessions = generatedSessions;
      data.message = `Assigned successfully. Generated ${generatedSessions.length} sessions.`;
    }
    else if (url.match(/\/patients\/([^\/]+)\/therapy-sessions$/) && method === 'GET') {
      const patientId = url.split('/')[2];
      data.sessions = mockTherapySessions.filter(s => s.patientId === patientId);
    }
    else if (url.match(/\/therapy-sessions$/) && method === 'GET') {
      // For doctor sessions view (mock logic ignores actual doctor id for simplicity)
      data.sessions = mockTherapySessions;
    }
    else if (url.match(/\/therapy-sessions\/([^\/]+)\/complete$/) && method === 'PATCH') {
      const id = url.split('/')[2];
      const idx = mockTherapySessions.findIndex(s => s._id === id);
      if(idx > -1) {
        mockTherapySessions[idx].status = 'Completed';
        mockTherapySessions[idx].notes = parsedData.notes || '';
      }
      data.session = mockTherapySessions[idx];
    }
    else if (url.match(/\/therapy-sessions\/([^\/]+)\/reschedule$/) && method === 'PATCH') {
      const id = url.split('/')[2];
      const idx = mockTherapySessions.findIndex(s => s._id === id);
      if(idx > -1) {
        mockTherapySessions[idx].scheduledDate = parsedData.date;
      }
      data.session = mockTherapySessions[idx];
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

realApiClient.interceptors.request.use(
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
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || 'Operation failed'));
    }
    return response;
  },
  (error) => {
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

realApiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || 'Operation failed'));
    }
    return response;
  },
  (error) => {
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
