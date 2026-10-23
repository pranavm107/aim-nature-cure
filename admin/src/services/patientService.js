import apiClient from './apiClient';
import { getStore, setStore } from '../utils/mockStore';

const mapPatientToFrontend = (backendPatient) => {
  if (!backendPatient) return backendPatient;
  const docName = backendPatient.doctorName || backendPatient.assignedDoctorName || (backendPatient.assignedDoctor && typeof backendPatient.assignedDoctor === 'object' ? backendPatient.assignedDoctor.name : null) || 'Unassigned';
  const assignedDoctorObj = (backendPatient.assignedDoctor && typeof backendPatient.assignedDoctor === 'object')
    ? backendPatient.assignedDoctor
    : { _id: backendPatient.assignedDoctor, name: docName };

  return {
    ...backendPatient,
    _id: backendPatient.uuid || backendPatient.id || backendPatient._id,
    patientId: backendPatient.patientId || backendPatient.idNumber,
    phone: backendPatient.phoneNumber,
    dob: backendPatient.dateOfBirth,
    age: backendPatient.age,
    doctorName: docName,
    assignedDoctorName: docName,
    assignedDoctor: assignedDoctorObj,
    status: backendPatient.active ? 'Active' : 'Inactive',
  };
};

const isValidUUID = (str) => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(str);
};

const mapPatientToBackend = (frontendPatient) => {
  const docId = (frontendPatient.assignedDoctor && typeof frontendPatient.assignedDoctor === 'object')
    ? (frontendPatient.assignedDoctor._id || frontendPatient.assignedDoctor.uuid)
    : frontendPatient.assignedDoctor;

  return {
    uuid: frontendPatient._id || frontendPatient.uuid,
    patientId: frontendPatient.patientId ? frontendPatient.patientId.trim() : null,
    name: frontendPatient.name,
    email: frontendPatient.email,
    phoneNumber: frontendPatient.phone,
    dateOfBirth: frontendPatient.dob || null,
    age: frontendPatient.age ? parseInt(frontendPatient.age, 10) : null,
    gender: frontendPatient.gender,
    occupation: frontendPatient.occupation,
    address: frontendPatient.address,
    leadSource: frontendPatient.leadSource,
    assignedDoctor: isValidUUID(docId) ? docId : null,
    numberOfSessions: frontendPatient.sessions ? parseInt(frontendPatient.sessions, 10) : (frontendPatient.numberOfSessions ? parseInt(frontendPatient.numberOfSessions, 10) : null),
    followUpInterval: frontendPatient.periodOfDays ? parseInt(frontendPatient.periodOfDays, 10) : (frontendPatient.followUpInterval ? parseInt(frontendPatient.followUpInterval, 10) : null),
    active: frontendPatient.status === 'Active',
    userId: localStorage.getItem('userId') || ''
  };
};

export const patientService = {
  getPatients: async (params = {}) => {
    try {
      const { search = '', page = 0, size = 10 } = params;
      const userId = localStorage.getItem('userId') || '';
      const response = await apiClient.post('/patients/all', {
        searchKey: search,
        pageNo: page,
        pageSize: size,
        userId: userId
      });
      const data = response.data;

      let patientsList = [];
      if (data.content) {
        patientsList = data.content; // Spring Boot Page object
      } else if (data.patients) {
        patientsList = data.patients; // Custom wrapper
      } else if (data.result) {
        patientsList = data.result; // Custom wrapper
      } else if (Array.isArray(data)) {
        patientsList = data; // Direct array
      }

      const patients = patientsList.map(mapPatientToFrontend);
      patients.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.registrationDate || 0).getTime();
        const dateB = new Date(b.createdAt || b.registrationDate || 0).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return (b.idNumber || '').localeCompare(a.idNumber || '');
      });
      return {
        success: true,
        patients,
        pagination: {
          totalElements: data.totalElements || patients.length,
          totalPages: data.totalPages || 1,
          number: data.number || 0,
          size: data.size || 10
        }
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch patients' };
    }
  },

  createPatient: async (patientData) => {
    try {
      const payload = mapPatientToBackend(patientData);
      const response = await apiClient.post('/patients/create', payload);
      return { success: true, patient: mapPatientToFrontend(response.data) };
    } catch (error) {
      console.error('Error creating patient:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create patient' };
    }
  },

  getPatientById: async (id) => {
    try {
      if (isValidUUID(id)) {
        const response = await apiClient.get(`/patients/${id}`);
        let result = response.data;
        if (result.result) result = result.result;
        return { success: true, patient: mapPatientToFrontend(result) };
      }

      // If id is not a UUID (e.g. "001" or custom patientId), query /patients/all
      const response = await apiClient.post('/patients/all', {
        searchKey: id,
        pageNo: 0,
        pageSize: 50,
        userId: localStorage.getItem('userId') || ''
      });
      const data = response.data;
      let patientsList = [];
      if (data.content) patientsList = data.content;
      else if (data.patients) patientsList = data.patients;
      else if (data.result) patientsList = data.result;
      else if (Array.isArray(data)) patientsList = data;

      const mapped = patientsList.map(mapPatientToFrontend);
      const match = mapped.find(p => 
        (p.patientId && p.patientId.toLowerCase() === id.toLowerCase()) ||
        (p.idNumber && p.idNumber.toLowerCase() === id.toLowerCase()) ||
        p._id === id
      );

      if (match) {
        return { success: true, patient: match };
      }

      // Fallback: check local mock store
      const statePatients = getStore('mockPatients', []);
      const localMatch = statePatients.find(p => 
        (p.patientId && p.patientId.toLowerCase() === (id || '').toLowerCase()) ||
        (p.idNumber && p.idNumber.toLowerCase() === (id || '').toLowerCase()) ||
        p._id === id || p.uuid === id
      );
      if (localMatch) {
        return { success: true, patient: mapPatientToFrontend(localMatch) };
      }

      return { success: false, message: 'Patient not found' };
    } catch (error) {
      console.error('Error fetching patient:', error);
      // Fallback: check local mock store
      const statePatients = getStore('mockPatients', []);
      const localMatch = statePatients.find(p => 
        (p.patientId && p.patientId.toLowerCase() === (id || '').toLowerCase()) ||
        (p.idNumber && p.idNumber.toLowerCase() === (id || '').toLowerCase()) ||
        p._id === id || p.uuid === id
      );
      if (localMatch) {
        return { success: true, patient: mapPatientToFrontend(localMatch) };
      }
      return { success: false, message: error.response?.data?.message || 'Patient not found' };
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      const payload = mapPatientToBackend({ ...patientData, _id: id });
      const response = await apiClient.put('/patients/update', payload);
      return { success: true, patient: mapPatientToFrontend(response.data) };
    } catch (error) {
      console.error('Error updating patient:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update patient' };
    }
  },

  setPatientStatus: async (id, status) => {
    try {
      const active = status === 'Active';
      const response = await apiClient.patch(`/patients/update/status/${id}/${active}`);
      return { success: true, patient: mapPatientToFrontend(response.data) };
    } catch (error) {
      console.error('Error updating status:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update patient status' };
    }
  },

  deletePatient: async (id) => {
    try {
      await apiClient.delete(`/patients/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting patient:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete patient' };
    }
  },

  // Retain these methods for other integrations (mocks or separate updates)
  incrementSessionCount: async (id) => {
    const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));
    await delay();

    const statePatients = getStore('mockPatients', []);
    const idx = statePatients.findIndex(p => p._id === id || p.uuid === id);
    if (idx !== -1) {
      const newCount = (statePatients[idx].sessionsAttended || 0) + 1;
      statePatients[idx].sessionsAttended = newCount;
      if (newCount === 3) {
        const followUps = getStore('mockFollowUps', []);
        followUps.push({
          _id: 'fu_auto_' + Date.now(),
          patientId: id,
          doctorId: statePatients[idx].assignedDoctor,
          dueDate: new Date(Date.now() + (86400000 * 7)).toISOString().split('T')[0],
          reason: '3 therapy sessions completed',
          status: 'Pending',
          type: 'Routine',
          notes: ''
        });
        setStore('mockFollowUps', followUps);
      }
      setStore('mockPatients', statePatients);
    }
    return { success: true };
  },

  assignDoctor: async (id, doctorId) => {
    try {
      const patientRes = await patientService.getPatientById(id);
      if (patientRes.success) {
        const updatedPatient = { ...patientRes.patient, assignedDoctor: doctorId };
        return await patientService.updatePatient(id, updatedPatient);
      }
      return { success: false, message: 'Patient not found' };
    } catch (error) {
      console.error('Error assigning doctor:', error);
      return { success: false, message: 'Failed to assign doctor' };
    }
  },

  getPatientTimeline: async (id) => {
    try {
      let patientConsultations = [];
      try {
        const cRes = await apiClient.get('/consultations/all', { params: { patientId: id } });
        const cList = Array.isArray(cRes.data?.result)
          ? cRes.data.result
          : (Array.isArray(cRes.data?.content)
              ? cRes.data.content
              : (Array.isArray(cRes.data) ? cRes.data : []));
        patientConsultations = cList.filter(c => c.patientId === id || c.patient_id === id);
      } catch (e) {
        console.warn("Could not fetch consultations for timeline:", e);
      }

      let completedSessions = [];
      try {
        const sRes = await apiClient.get('/therapy-sessions/all', { params: { patientId: id } });
        const sList = Array.isArray(sRes.data?.result)
          ? sRes.data.result
          : (Array.isArray(sRes.data?.content)
              ? sRes.data.content
              : (Array.isArray(sRes.data) ? sRes.data : []));
        completedSessions = sList
          .filter(s => (s.patientId === id || s.patient_id === id) && s.status === 'Completed')
          .map(s => ({
            ...s,
            date: new Date(s.createdAt || s.sessionDate || Date.now()).getTime(),
          }));
      } catch (e) {
        console.warn("Could not fetch therapy sessions for timeline:", e);
      }

      const timeline = [
        ...patientConsultations.map(c => ({
          type: 'consultation',
          date: new Date(c.createdAt || c.date || Date.now()).getTime(),
          data: c
        })),
        ...completedSessions.map(s => ({
          type: 'therapy_session',
          date: s.date,
          data: s
        }))
      ].sort((a, b) => b.date - a.date);

      return { success: true, timeline };
    } catch (error) {
      console.error('Error fetching patient timeline:', error);
      return { success: false, timeline: [] };
    }
  }
};
