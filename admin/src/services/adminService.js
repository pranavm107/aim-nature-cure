import { mockDoctors, mockAppointments, mockPatients } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

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
    const generatedPassword = generatePassword();
    const email = formData.get('email');
    
    // Simulate email send
    console.log(`[SIMULATED EMAIL] To: ${email} | Subject: Your new Doctor Account | Body: Your password is ${generatedPassword}`);

    // Simplified mock implementation
    const newDoc = {
      _id: "doc" + Date.now(),
      name: formData.get('name'),
      email: email,
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

    const users = getStore('mockUsers');
    users.push({
      _id: 'u_' + Date.now(),
      name: newDoc.name,
      email: newDoc.email,
      password: generatedPassword,
      role: 'doctor',
      doctorId: newDoc._id,
      mustChangePassword: true,
      status: 'Active'
    });
    setStore('mockUsers', users);

    return { success: true, message: 'Doctor added successfully', doctor: newDoc, generatedPassword };
  }
};
