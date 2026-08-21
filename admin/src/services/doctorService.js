import { mockDoctors, mockAppointments, mockPatients, mockProfile } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const doctorService = {
  getDashData: async () => {
    await delay();
    const dashData = {
      doctors: mockDoctors.length, // Just for mock demo
      appointments: mockAppointments.filter(a => a.docId === 'doc1').length,
      patients: mockPatients.filter(p => p.assignedDoctor === 'doc1').length,
      latestAppointments: [...mockAppointments].filter(a => a.docId === 'doc1').reverse().slice(0, 5),
      earnings: 800,
    };
    return { success: true, dashData };
  },

  getProfileData: async () => {
    await delay();
    return { success: true, profileData: mockProfile.doctor };
  },

  updateProfileData: async (updateData) => {
    await delay();
    mockProfile.doctor = { ...mockProfile.doctor, ...updateData };
    return { success: true, message: 'Profile updated' };
  }
};
