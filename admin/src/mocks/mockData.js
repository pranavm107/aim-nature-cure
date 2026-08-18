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
  },
  {
    _id: "doc3",
    name: "Dr. Zero Patients",
    image: "",
    speciality: "Dermatologist",
    degree: "MBBS",
    experience: "1 Year",
    about: "Newly joined doctor with zero assigned patients.",
    fees: 40,
    address: {
      line1: "New Block",
      line2: "London"
    },
    date: 1712124536967,
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

export const mockPatients = [
  {
    _id: "pat1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    dob: "1980-05-15",
    gender: "Male",
    address: "123 Main St, Cityville",
    leadSource: "Google",
    assignedDoctor: "doc1",
    status: "Active",
    date: 1712124536000
  },
  {
    _id: "pat2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "0987654321",
    dob: "1992-11-20",
    gender: "Female",
    address: "456 Oak Rd, Townsville",
    leadSource: "Instagram",
    assignedDoctor: "doc1",
    status: "Completed Treatment",
    date: 1712124536100
  },
  {
    _id: "pat3",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    phone: "5551234567",
    dob: "2000-01-01",
    gender: "Female",
    address: "789 Pine Ln, Villageton",
    leadSource: "Walk-in",
    assignedDoctor: "doc2",
    status: "Active",
    date: 1712124536200
  },
  {
    _id: "pat4", // Empty timeline patient
    name: "Bob Builder",
    email: "bob@example.com",
    phone: "9998887776",
    dob: "1975-08-30",
    gender: "Male",
    address: "321 Brick Way, Construct City",
    leadSource: "Referral",
    assignedDoctor: "doc1",
    status: "Active",
    date: Date.now()
  }
];

export const mockConsultations = [
  {
    _id: "cons1",
    patientId: "pat1",
    doctorId: "doc1",
    date: 1712124536000,
    chiefComplaint: "Frequent headaches and neck pain.",
    history: "No prior history of migraines. Desk job, poor posture.",
    observations: "Stiff neck muscles, normal blood pressure.",
    diagnosis: "Tension headache",
    treatmentPlan: "Acupuncture and neck exercises.",
    notes: "Patient advised to take breaks every hour.",
    addendums: []
  },
  {
    _id: "cons2",
    patientId: "pat1",
    doctorId: "doc1",
    date: 1712124546000,
    chiefComplaint: "Follow-up for neck pain.",
    history: "Neck pain reduced after acupuncture.",
    observations: "Improved range of motion.",
    diagnosis: "Recovering tension headache",
    treatmentPlan: "Continue neck exercises.",
    notes: "Patient doing well.",
    addendums: [
      {
        date: 1712124556000,
        text: "Addendum: Advised to use ergonomic chair."
      }
    ]
  },
  {
    _id: "cons3",
    patientId: "pat2",
    doctorId: "doc1",
    date: 1712124536100,
    chiefComplaint: "Lower back pain.",
    history: "Lifting heavy objects at work.",
    observations: "Muscle spasms in lower back.",
    diagnosis: "Muscle strain",
    treatmentPlan: "Rest and hot fomentation.",
    notes: "Treatment completed successfully.",
    addendums: []
  },
  {
    _id: "cons4",
    patientId: "pat3",
    doctorId: "doc2",
    date: 1712124536200,
    chiefComplaint: "Digestive issues.",
    history: "Irregular eating habits.",
    observations: "Bloating and discomfort.",
    diagnosis: "Indigestion",
    treatmentPlan: "Dietary changes and herbal supplements.",
    notes: "",
    addendums: []
  }
];
