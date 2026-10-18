import apiClient from './apiClient';

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const mapDoctorToFrontend = (backendDoctor) => {
  if (!backendDoctor) return null;
  return {
    _id: backendDoctor.uuid,
    uuid: backendDoctor.uuid,
    name: backendDoctor.name,
    email: backendDoctor.email,
    phone: backendDoctor.phone,
    speciality: backendDoctor.speciality,
    degree: backendDoctor.degree,
    experience: backendDoctor.experience,
    fees: backendDoctor.fees,
    salary: backendDoctor.salary,
    address: {
      line1: backendDoctor.address1 || '',
      line2: backendDoctor.address2 || ''
    },
    about: backendDoctor.about,
    image: backendDoctor.photo,
    active: backendDoctor.active,
    available: backendDoctor.available,
    status: backendDoctor.active ? 'Active' : 'Inactive',
    date: Date.now() // Mock fallback for UI rendering
  };
};

const mapDoctorToBackend = (frontendDoctor) => {
  return {
    uuid: frontendDoctor._id || frontendDoctor.uuid,
    name: frontendDoctor.name,
    email: frontendDoctor.email,
    phone: frontendDoctor.phone,
    speciality: frontendDoctor.speciality,
    degree: frontendDoctor.degree,
    experience: frontendDoctor.experience,
    fees: Number(frontendDoctor.fees) || 0,
    salary: Number(frontendDoctor.salary) || 0,
    address1: frontendDoctor.address?.line1 || frontendDoctor.address1 || '',
    address2: frontendDoctor.address?.line2 || frontendDoctor.address2 || '',
    about: frontendDoctor.about,
    photo: frontendDoctor.image || frontendDoctor.photo || '',
    active: frontendDoctor.active !== undefined ? frontendDoctor.active : (frontendDoctor.status === 'Active'),
    available: frontendDoctor.available !== undefined ? frontendDoctor.available : true,
    userId: frontendDoctor.userId || localStorage.getItem('userId') || null
  };
};

export const adminService = {
  getAllDoctors: async (params = {}) => {
    try {
      const { search = '', page = 0, size = 10 } = params;
      const response = await apiClient.get('/doctors/all', {
        params: { search, page, size }
      });
      const data = response.data;
      let doctorsList = [];
      if (data.content) {
        doctorsList = data.content.map(mapDoctorToFrontend);
      } else if (data.doctors) {
        doctorsList = data.doctors.map(mapDoctorToFrontend);
      } else if (data.result && Array.isArray(data.result)) {
        doctorsList = data.result.map(mapDoctorToFrontend);
      } else if (Array.isArray(data)) {
        doctorsList = data.map(mapDoctorToFrontend);
      }
      return {
        success: true,
        doctors: doctorsList,
        pagination: {
          page: data.number || page,
          size: data.size || size,
          totalElements: data.totalElements || doctorsList.length,
          totalPages: data.totalPages || 1
        }
      };
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch doctors' };
    }
  },

  getDoctorById: async (docId) => {
    try {
      const response = await apiClient.get(`/doctors/${docId}`);
      let doctorData = response.data;
      if (doctorData.result) doctorData = doctorData.result;
      if (doctorData.doctor) doctorData = doctorData.doctor;
      return { success: true, doctor: mapDoctorToFrontend(doctorData) };
    } catch (error) {
      console.error("Error fetching doctor:", error);
      return { success: false, message: error.response?.data?.message || 'Doctor not found' };
    }
  },

  addDoctor: async (doctorData) => {
    try {
      const backendPayload = mapDoctorToBackend(doctorData);
      const response = await apiClient.post('/doctors/create', backendPayload);
      let newDoc = response.data;
      if (newDoc.result) newDoc = newDoc.result;
      if (newDoc.doctor) newDoc = newDoc.doctor;
      return {
        success: true,
        message: 'Doctor added successfully',
        doctor: mapDoctorToFrontend(newDoc),
        generatedPassword: response.data?.generatedPassword
      };
    } catch (error) {
      console.error("Error creating doctor:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to create doctor' };
    }
  },

  updateDoctor: async (docId, updateData) => {
    try {
      const payload = { ...updateData, _id: docId, uuid: docId };
      const backendPayload = mapDoctorToBackend(payload);
      const response = await apiClient.put('/doctors/update', backendPayload);
      let updatedDoc = response.data;
      if (updatedDoc.result) updatedDoc = updatedDoc.result;
      if (updatedDoc.doctor) updatedDoc = updatedDoc.doctor;
      return { success: true, message: 'Doctor updated successfully', doctor: mapDoctorToFrontend(updatedDoc) };
    } catch (error) {
      console.error("Error updating doctor:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to update doctor' };
    }
  },

  changeAvailability: async (docId, available) => {
    try {
      await apiClient.patch(`/doctors/update/availability/${docId}/${available}`);
      return { success: true, message: 'Availability changed successfully' };
    } catch (error) {
      console.error("Error changing availability:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to change availability' };
    }
  },

  changeStatus: async (docId, active) => {
    try {
      await apiClient.patch(`/doctors/update/status/${docId}/${active}`);
      return { success: true, message: 'Status changed successfully' };
    } catch (error) {
      console.error("Error changing status:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to change status' };
    }
  },

  deleteDoctor: async (docId) => {
    try {
      await apiClient.delete(`/doctors/${docId}`);
      return { success: true, message: 'Doctor deleted successfully' };
    } catch (error) {
      console.error("Error deleting doctor:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete doctor' };
    }
  },

  getDoctorsDropdown: async () => {
    try {
      const response = await apiClient.get('/doctors/dropdown');
      let data = response.data;
      if (data.result) data = data.result;

      const doctorsList = (Array.isArray(data) ? data : []).map(d => ({
        ...d,
        _id: d.uuid || d.id || d._id // Map backend uuid to frontend _id
      }));
      return { success: true, doctors: doctorsList };
    } catch (error) {
      console.error("Error fetching doctors dropdown:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch doctors dropdown' };
    }
  },

  getDashData: async () => {
    try {
      const response = await apiClient.get('/dashboard/admin');
      const data = response.data?.result || response.data;
      if (data) {
        return {
          success: true,
          dashData: {
            doctors: Number(data.totalDoctors || 0),
            appointments: 0,
            patients: Number(data.totalPatients || 0),
            latestAppointments: [],
            earnings: Number(data.totalRevenue || 0),
            todaysConsultations: Number(data.todaysConsultations || 0),
            pendingPayments: Number(data.pendingPayments || 0),
            raw: data
          }
        };
      }
    } catch (e) {
      console.warn("Could not fetch backend admin dashboard metrics:", e);
    }
    return {
      success: true,
      dashData: {
        doctors: 0,
        appointments: 0,
        patients: 0,
        latestAppointments: [],
        earnings: 0
      }
    };
  }
};
