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

export const mockPatientDocuments = [
  {
    _id: "docm1",
    patientId: "pat1",
    name: "Blood Test Report",
    type: "application/pdf",
    url: "mock-url-blood-test.pdf",
    date: 1712124536000
  }
];

export const mockTherapies = [
  {
    _id: "ther1",
    name: "Acupuncture",
    duration: 45, // in minutes
    price: 30,
    status: true,
    date: 1712124536000
  },
  {
    _id: "ther2",
    name: "Massage Therapy",
    duration: 60,
    price: 50,
    status: true,
    date: 1712124536100
  },
  {
    _id: "ther3",
    name: "Herbal Detox",
    duration: 30,
    price: 20,
    status: false, // inactive
    date: 1712124536200
  }
];

export const mockPackages = [
  {
    _id: "pkg1",
    name: "Full Recovery Package",
    therapies: [
      { therapyId: "ther1", count: 5 },
      { therapyId: "ther2", count: 3 }
    ],
    price: 250,
    status: true,
    date: 1712124536000
  },
  {
    _id: "pkg2",
    name: "Quick Detox",
    therapies: [
      { therapyId: "ther3", count: 3 }
    ],
    price: 50,
    status: true,
    date: 1712124536100
  }
];

export const mockTherapySessions = [
  {
    _id: "sess1",
    patientId: "pat1",
    docId: "doc1",
    therapyId: "ther1",
    scheduledDate: "2024-10-15",
    status: "Pending", // Pending, Completed, Cancelled
    notes: "",
    date: 1712124536000
  },
  {
    _id: "sess2",
    patientId: "pat1",
    docId: "doc1",
    therapyId: "ther2",
    scheduledDate: "2024-10-12",
    status: "Completed",
    notes: "Patient felt much better after session.",
    date: 1712124536100
  }
];

export const mockInvoices = [
  {
    _id: "inv1",
    patientId: "pat1",
    docId: "doc1",
    date: 1712124536000,
    items: [
      { type: "Consultation", description: "Initial Consultation", amount: 50 },
      { type: "Therapy", description: "Massage Therapy", amount: 50 }
    ],
    totalAmount: 100,
    paidAmount: 50,
    status: "Partial",
    dueDate: "2024-10-30"
  },
  {
    _id: "inv2",
    patientId: "pat2",
    docId: "doc1",
    date: 1712124536100,
    items: [
      { type: "Package", description: "Quick Detox", amount: 50 }
    ],
    totalAmount: 50,
    paidAmount: 50,
    status: "Paid",
    dueDate: "2024-10-15"
  }
];

export const mockPayments = [
  {
    _id: "pay1",
    invoiceId: "inv1",
    patientId: "pat1",
    amount: 50,
    mode: "UPI",
    date: 1712124536000,
    transactionId: "TXN12345678"
  },
  {
    _id: "pay2",
    invoiceId: "inv2",
    patientId: "pat2",
    amount: 50,
    mode: "Cash",
    date: 1712124536100,
    transactionId: "CASH_001"
  }
];

export const mockIncentiveRules = [
  {
    _id: "rule1",
    docId: "doc1",
    targetAmount: 5000,
    percentage: 10,
    effectiveDate: "2024-01-01",
    date: 1712124536000
  },
  {
    _id: "rule2",
    docId: "doc2",
    targetAmount: 6000,
    percentage: 12,
    effectiveDate: "2024-01-01",
    date: 1712124536100
  }
];

export const mockIncentives = [
  {
    _id: "inc1",
    docId: "doc1",
    period: "2024-09",
    totalRevenue: 6000, // BR-09: paid revenue
    target: 5000,
    percentage: 10,
    calculatedAmount: 100, // (6000 - 5000) * 10%
    status: "Approved",
    date: 1712124536000
  },
  {
    _id: "inc2",
    docId: "doc1",
    period: "2024-10",
    totalRevenue: 5500,
    target: 5000,
    percentage: 10,
    calculatedAmount: 50,
    status: "Pending",
    date: 1712124536100
  }
];

export const mockFollowUps = [
  {
    _id: "fu1",
    patientId: "pat1",
    docId: "doc1",
    dueDate: "2024-10-25",
    type: "Post-Therapy Check",
    notes: "Check if neck pain reduced after acupuncture.",
    status: "Pending", // Pending, Completed, Cancelled
    priority: "High",
    date: 1712124536000
  },
  {
    _id: "fu2",
    patientId: "pat2",
    docId: "doc1",
    dueDate: "2024-10-10",
    type: "General Follow-up",
    notes: "Review diet chart adherence.",
    status: "Completed",
    priority: "Medium",
    date: 1712124536100
  }
];

export const mockLeads = [
  {
    _id: "lead1",
    name: "Alex Hunter",
    phone: "1112223333",
    source: "Instagram",
    status: "New", // New, Contacted, Converted, Lost
    notes: "Interested in detox package.",
    date: 1712124536000
  }
];

export const mockSocialSubmissions = [
  {
    _id: "soc1",
    docId: "doc1",
    type: "Article", // Video, Article, Testimonial
    title: "Benefits of Naturopathy",
    content: "A short article discussing the holistic approach...",
    status: "Pending", // Pending, Approved, Rejected
    date: 1712124536000
  }
];
