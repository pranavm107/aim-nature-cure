import { mockDoctors, mockAppointments, mockPatients } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const adminService = {
  getAllDoctors: async () => {
    await delay();
    return { success: true, doctors: mockDoctors };
  },

  changeAvailability: async (docId) => {
    await delay();
    const doc = mockDoctors.find(d => d._id === docId);
    if (doc) {
      doc.available = !doc.available;
      return { success: true, message: 'Availability changed' };
    }
    return { success: false, message: 'Doctor not found' };
  },

  getDashData: async () => {
    await delay();
    const dashData = {
      doctors: mockDoctors.length,
      appointments: mockAppointments.length,
      patients: mockPatients.length,
      latestAppointments: [...mockAppointments].reverse().slice(0, 5),
      earnings: 1250,
    };
    return { success: true, dashData };
  },

  addDoctor: async (formData) => {
    await delay();
    // Simplified mock implementation
    const newDoc = {
      _id: "doc" + Date.now(),
      name: formData.get('name'),
      email: formData.get('email'),
      speciality: formData.get('speciality'),
      degree: formData.get('degree'),
      experience: formData.get('experience'),
      about: formData.get('about'),
      fees: Number(formData.get('fees')),
      address: JSON.parse(formData.get('address')),
      date: Date.now(),
      slots_booked: {},
      available: true
    };
    mockDoctors.push(newDoc);
    return { success: true, message: 'Doctor added successfully', doctor: newDoc };
  }
};
