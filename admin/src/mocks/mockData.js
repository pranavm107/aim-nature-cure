import { assets } from '../assets/assets'

export const mockDoctors = [
  {
    _id: "doc1",
    name: "Dr. Richard James",
    image: assets.doc1 || "",
    speciality: "General physician",
    degree: "MBBS",
    experience: "4 Years",
    about: "Dr. Richard has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine.",
    fees: 50,
    address: {
      line1: "17th Cross, Richmond",
      line2: "Circle, Ring Road, London"
    },
    date: 1712124536965,
    slots_booked: {},
    available: true
  },
  {
    _id: "doc2",
    name: "Dr. Emily Larson",
    image: assets.doc2 || "",
    speciality: "Gynecologist",
    degree: "MBBS",
    experience: "3 Years",
    about: "Dr. Emily is specialized in women's reproductive health.",
    fees: 60,
    address: {
      line1: "27th Cross, Richmond",
      line2: "Circle, Ring Road, London"
    },
    date: 1712124536966,
    slots_booked: {},
    available: true
  }
];

export const mockAppointments = [
  {
    _id: "app1",
    userId: "user1",
    docId: "doc1",
    slotDate: "10_10_2024",
    slotTime: "10:00 am",
    userData: {
      name: "Edward Vincent",
      image: "",
      dob: "1990-01-01"
    },
    docData: mockDoctors[0],
    amount: 50,
    date: 1712124536970,
    cancelled: false,
    isCompleted: false
  },
  {
    _id: "app2",
    userId: "user2",
    docId: "doc2",
    slotDate: "11_10_2024",
    slotTime: "11:00 am",
    userData: {
      name: "Richard James",
      image: "",
      dob: "1985-05-05"
    },
    docData: mockDoctors[1],
    amount: 60,
    date: 1712124536971,
    cancelled: true,
    isCompleted: false
  }
];

export const mockProfile = {
  admin: {
    name: "Admin User",
    email: "admin@aimnaturecure.com",
    role: "admin",
    image: ""
  },
  doctor: {
    name: "Dr. Richard James",
    email: "richard@aimnaturecure.com",
    role: "doctor",
    image: "",
    speciality: "General physician"
  }
}

export const mockCredentials = {
  admin: {
    email: 'admin@aimnaturecure.dev',
    password: 'mock-admin-pass'
  },
  doctor: {
    email: 'doctor@aimnaturecure.dev',
    password: 'mock-doc-pass'
  }
};
