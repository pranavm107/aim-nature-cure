import { assets } from '../assets/assets'

const dateBase = Date.now();
const dayMs = 86400000;

export const mockDoctors = [
  {
    _id: 'doc1', name: 'Dr. Ananya Sharma', speciality: 'Naturopathy & Diet',
    degree: 'BNYS', experience: '8 Years', fees: 1500, address: { line1: 'Wellness Wing', line2: 'AIM Nature Cure' },
    date: dateBase - (dayMs * 365), available: true, image: assets.doc1 || ''
  },
  {
    _id: 'doc2', name: 'Dr. Rahul Menon', speciality: 'Acupuncture & Yoga',
    degree: 'BNYS', experience: '5 Years', fees: 1200, address: { line1: 'Therapy Block', line2: 'AIM Nature Cure' },
    date: dateBase - (dayMs * 300), available: true, image: assets.doc2 || ''
  }
, 
  {
    _id: 'doc3', name: 'Dr. Vikram Singh', speciality: 'Physiotherapy',
    degree: 'BPT', experience: '10 Years', fees: 1400, address: { line1: 'Rehab Center', line2: 'AIM Nature Cure' },
    date: dateBase - (dayMs * 400), available: true, image: ''
  }
];

export const mockProfile = {
  admin: { name: 'Admin', email: 'admin@aimnaturecure.com', role: 'admin', image: '' },
  doctor: { name: 'Dr. Ananya Sharma', email: 'doctor@aimnaturecure.com', role: 'doctor', speciality: 'Naturopathy & Diet', _id: 'doc1', image: '' }
};

export const mockCredentials = {
  admin: { email: 'admin@aimnaturecure.dev', password: 'mock-admin-pass' },
  doctor: { email: 'doctor@aimnaturecure.dev', password: 'mock-doc-pass' }
};

export const mockUsers = [
  { _id: 'u1', name: 'Admin', email: 'admin@aimnaturecure.dev', password: 'mock-admin-pass', role: 'admin', mustChangePassword: false, status: 'Active' },
  { _id: 'u2', name: 'Dr. Ananya Sharma', email: 'doctor@aimnaturecure.dev', password: 'mock-doc-pass', role: 'doctor', doctorId: 'doc1', mustChangePassword: false, status: 'Active' },
  { _id: 'u3', name: 'New Doc', email: 'newdoc@aimnaturecure.dev', password: 'temp-password', role: 'doctor', doctorId: 'doc3', mustChangePassword: true, status: 'Active' }
];

export const mockPatients = [
  { _id: 'PAT001', name: 'Priya Menon', age: 29, gender: 'Female', phone: '9876543210', address: 'Coimbatore', condition: 'Digestive Wellness', assignedDoctor: 'doc1', status: 'Active', leadSource: 'Direct', date: dateBase - (dayMs * 30), totalSessions: 5, sessionsAttended: 3 },
  { _id: 'PAT002', name: 'Arun Kumar', age: 42, gender: 'Male', phone: '9876543211', address: 'Pollachi', condition: 'Chronic Back Pain', assignedDoctor: 'doc1', status: 'Active', leadSource: 'Google', date: dateBase - (dayMs * 45), totalSessions: 10, sessionsAttended: 10 },
  { _id: 'PAT003', name: 'Kavya Krishnan', age: 35, gender: 'Female', phone: '9876543212', address: 'Coimbatore', condition: 'Stress and Sleep Management', assignedDoctor: 'doc2', status: 'Active', leadSource: 'Referral', date: dateBase - (dayMs * 60), totalSessions: 6, sessionsAttended: 6 },
  { _id: 'PAT004', name: 'Suresh Ravi', age: 51, gender: 'Male', phone: '9876543213', address: 'Tiruppur', condition: 'Diabetes Wellness', assignedDoctor: 'doc2', status: 'Active', leadSource: 'Direct', date: dateBase - (dayMs * 15), totalSessions: 7, sessionsAttended: 4 },
  { _id: 'PAT005', name: 'Meena Raj', age: 38, gender: 'Female', phone: '9876543214', address: 'Coimbatore', condition: 'Weight Management', assignedDoctor: 'doc3', status: 'Active', leadSource: 'Instagram', date: dateBase - (dayMs * 10), totalSessions: 10, sessionsAttended: 2 },
  { _id: 'PAT006', name: 'Vignesh Kumar', age: 31, gender: 'Male', phone: '9876543215', address: 'Pollachi', condition: 'Lifestyle Management', assignedDoctor: 'doc3', status: 'Active', leadSource: 'Referral', date: dateBase - (dayMs * 5), totalSessions: 0, sessionsAttended: 0 },
  { _id: 'PAT007', name: 'Neha Sharma', age: 45, gender: 'Female', phone: '9876543216', address: 'Coimbatore', condition: 'Joint Pain', assignedDoctor: 'doc1', status: 'Completed Treatment', leadSource: 'Direct', date: dateBase - (dayMs * 25), totalSessions: 10, sessionsAttended: 10 },
  { _id: 'PAT008', name: 'Rahul Das', age: 50, gender: 'Male', phone: '9876543217', address: 'Chennai', condition: 'Post-Op Recovery', assignedDoctor: 'doc2', status: 'Inactive', leadSource: 'Google', date: dateBase - (dayMs * 100), totalSessions: 0, sessionsAttended: 0 }
];

export const mockAppointments = [
  { _id: 'app1', userId: 'PAT001', docId: 'doc1', slotDate: new Date(dateBase + dayMs).toISOString().split('T')[0], slotTime: '10:00 am', userData: { name: 'Priya Menon', image: '' }, docData: { name: 'Dr. Ananya Sharma', _id: 'doc1' }, amount: 1500, date: dateBase - dayMs, cancelled: false, isCompleted: false },
  { _id: 'app2', userId: 'PAT005', docId: 'doc3', slotDate: new Date(dateBase - dayMs*2).toISOString().split('T')[0], slotTime: '10:00 am', userData: { name: 'Meena Raj', image: '' }, docData: { name: 'Dr. Vikram Singh', _id: 'doc3' }, amount: 1400, date: dateBase - dayMs*5, cancelled: false, isCompleted: true },
  { _id: 'app3', userId: 'PAT005', docId: 'doc3', slotDate: new Date(dateBase - dayMs).toISOString().split('T')[0], slotTime: '11:00 am', userData: { name: 'Meena Raj', image: '' }, docData: { name: 'Dr. Vikram Singh', _id: 'doc3' }, amount: 1400, date: dateBase - dayMs*5, cancelled: true, isCompleted: false },
  { _id: 'app4', userId: 'PAT005', docId: 'doc3', slotDate: new Date(dateBase + dayMs*3).toISOString().split('T')[0], slotTime: '02:00 pm', userData: { name: 'Meena Raj', image: '' }, docData: { name: 'Dr. Vikram Singh', _id: 'doc3' }, amount: 1400, date: dateBase - dayMs*1, cancelled: false, isCompleted: false }
];

export const mockConsultations = [
  { _id: 'CONS001', patientId: 'PAT001', doctorId: 'doc1', date: dateBase - (dayMs * 25), chiefComplaint: 'Severe bloating and indigestion after meals', history: 'Irregular eating habits, desk job', observations: 'Abdominal distension', diagnosis: 'Indigestion', treatmentPlan: 'Sattvic diet', dietAdvice: 'Avoid spicy food', followUpDate: new Date(dateBase - (dayMs * 15)).toISOString().split('T')[0] },
  { _id: 'CONS002', patientId: 'PAT003', doctorId: 'doc2', date: dateBase - (dayMs * 50), chiefComplaint: 'Severe insomnia', history: '6 months stress', observations: 'Anxious', diagnosis: 'Stress Insomnia', treatmentPlan: 'Yoga Nidra', dietAdvice: 'Warm milk at night', followUpDate: new Date(dateBase - (dayMs * 40)).toISOString().split('T')[0], addendums: [{ date: dateBase - (dayMs * 48), notes: 'Patient called, prescribed ashwagandha.' }] },
  { _id: 'CONS003', patientId: 'PAT003', doctorId: 'doc2', date: dateBase - (dayMs * 40), chiefComplaint: 'Follow up', history: 'Sleeping 4 hours now', observations: 'Calmer', diagnosis: 'Improving Insomnia', treatmentPlan: 'Continue Yoga', dietAdvice: 'Same', followUpDate: new Date(dateBase - (dayMs * 20)).toISOString().split('T')[0] },
  { _id: 'CONS004', patientId: 'PAT007', doctorId: 'doc1', date: dateBase - (dayMs * 25), chiefComplaint: 'Knee pain', history: 'Osteoarthritis', observations: 'Crepitus', diagnosis: 'OA Knee', treatmentPlan: 'Mud therapy', dietAdvice: 'Calcium rich', followUpDate: '' },
  { _id: 'CONS005', patientId: 'PAT001', doctorId: 'doc1', date: dateBase - (dayMs * 1), chiefComplaint: 'Digestion review', history: '', observations: 'Normal', diagnosis: 'Improving', treatmentPlan: 'Continue', dietAdvice: 'Same', followUpDate: '' },
  { _id: 'CONS006', patientId: 'PAT002', doctorId: 'doc1', date: dateBase - (dayMs * 1), chiefComplaint: 'Back pain', history: '', observations: 'Stiffness', diagnosis: 'Spasm', treatmentPlan: 'Spine Care', dietAdvice: 'Hydration', followUpDate: '' },
  { _id: 'CONS007', patientId: 'PAT003', doctorId: 'doc1', date: dateBase - (dayMs * 1), chiefComplaint: 'Stress review', history: '', observations: 'Calm', diagnosis: 'Good', treatmentPlan: 'Continue Yoga', dietAdvice: 'Same', followUpDate: '' }
];

export const mockTherapies = [
  { _id: 'ther1', name: 'Acupuncture', duration: 45, price: 1000, status: true },
  { _id: 'ther2', name: 'Hot Fomentation', duration: 30, price: 500, status: true },
  { _id: 'ther3', name: 'Shirodhara', duration: 60, price: 2000, status: true },
  { _id: 'ther4', name: 'Mud Therapy', duration: 45, price: 800, status: true },
  { _id: 'ther5', name: 'Hydrotherapy', duration: 45, price: 1200, status: true },
  { _id: 'ther6', name: 'Yoga Session', duration: 60, price: 500, status: true }
];

export const mockPackages = [
  { _id: 'pkg1', name: 'Naturopathy Detox Program', therapies: [{ therapyId: 'ther4', count: 3 }, { therapyId: 'ther5', count: 2 }], price: 5000, status: true },
  { _id: 'pkg2', name: 'Spine Care Therapy', therapies: [{ therapyId: 'ther1', count: 5 }, { therapyId: 'ther2', count: 5 }], price: 7500, status: true },
  { _id: 'pkg3', name: 'Stress Management Program', therapies: [{ therapyId: 'ther3', count: 3 }, { therapyId: 'ther6', count: 3 }], price: 7500, status: true },
  { _id: 'pkg4', name: 'Diabetes Wellness Program', therapies: [{ therapyId: 'ther6', count: 5 }, { therapyId: 'ther4', count: 2 }], price: 4100, status: true },
  { _id: 'pkg5', name: 'Weight Management Program', therapies: [{ therapyId: 'ther5', count: 5 }, { therapyId: 'ther6', count: 5 }], price: 8500, status: true }
];

export const mockTherapyAssignments = [
  { _id: 'ASSIGN001', patientId: 'PAT001', doctorId: 'doc1', therapyName: 'Naturopathy Detox Program', packageName: 'Naturopathy Detox Program', startDate: dateBase - (dayMs * 12), endDate: dateBase + (dayMs * 2), totalSessions: 5, completedSessions: 3, remainingSessions: 2, status: 'In Progress' },
  { _id: 'ASSIGN002', patientId: 'PAT002', doctorId: 'doc1', therapyName: 'Spine Care Therapy', packageName: 'Spine Care Therapy', startDate: dateBase - (dayMs * 30), endDate: dateBase - (dayMs * 5), totalSessions: 10, completedSessions: 10, remainingSessions: 0, status: 'Completed' },
  { _id: 'ASSIGN003', patientId: 'PAT003', doctorId: 'doc1', therapyName: 'Stress Management Program', packageName: 'Stress Management Program', startDate: dateBase - (dayMs * 20), endDate: dateBase - (dayMs * 2), totalSessions: 6, completedSessions: 6, remainingSessions: 0, status: 'Completed' },
  { _id: 'ASSIGN004', patientId: 'PAT004', doctorId: 'doc1', therapyName: 'Diabetes Wellness Program', packageName: 'Diabetes Wellness Program', startDate: dateBase - (dayMs * 10), endDate: dateBase + (dayMs * 10), totalSessions: 7, completedSessions: 4, remainingSessions: 3, status: 'In Progress' },
  { _id: 'ASSIGN005', patientId: 'PAT005', doctorId: 'doc1', therapyName: 'Weight Management Program', packageName: 'Weight Management Program', startDate: dateBase - (dayMs * 5), endDate: dateBase + (dayMs * 15), totalSessions: 10, completedSessions: 2, remainingSessions: 8, status: 'In Progress' }
];

export const mockTherapySessions = [
  { _id: 'SESS001', assignmentId: 'ASSIGN001', patientId: 'PAT001', doctorId: 'doc1', therapyId: 'ther4', therapyName: 'Mud Therapy', sessionNumber: 1, scheduledDate: new Date(dateBase - dayMs*10).toISOString().split('T')[0], status: 'Completed', notes: 'Patient responded well' },
  { _id: 'SESS002', assignmentId: 'ASSIGN001', patientId: 'PAT001', doctorId: 'doc1', therapyId: 'ther5', therapyName: 'Hydrotherapy', sessionNumber: 2, scheduledDate: new Date(dateBase - dayMs*8).toISOString().split('T')[0], status: 'Completed', notes: 'Felt relaxed' },
  { _id: 'SESS003', assignmentId: 'ASSIGN001', patientId: 'PAT001', doctorId: 'doc1', therapyId: 'ther4', therapyName: 'Mud Therapy', sessionNumber: 3, scheduledDate: new Date(dateBase - dayMs*5).toISOString().split('T')[0], status: 'Missed', notes: 'Patient did not show up' },
  { _id: 'SESS004', assignmentId: 'ASSIGN001', patientId: 'PAT001', doctorId: 'doc1', therapyId: 'ther5', therapyName: 'Hydrotherapy', sessionNumber: 4, scheduledDate: new Date(dateBase + dayMs*1).toISOString().split('T')[0], status: 'Pending', notes: '' },
  { _id: 'SESS005', assignmentId: 'ASSIGN001', patientId: 'PAT001', doctorId: 'doc1', therapyId: 'ther4', therapyName: 'Mud Therapy', sessionNumber: 5, scheduledDate: new Date(dateBase + dayMs*3).toISOString().split('T')[0], status: 'Pending', notes: '' },
  { _id: 'SESS006', assignmentId: 'ASSIGN004', patientId: 'PAT004', doctorId: 'doc1', therapyId: 'ther6', therapyName: 'Yoga Session', sessionNumber: 1, scheduledDate: new Date(dateBase - dayMs*9).toISOString().split('T')[0], status: 'Completed', notes: '' },
  { _id: 'SESS007', assignmentId: 'ASSIGN004', patientId: 'PAT004', doctorId: 'doc1', therapyId: 'ther4', therapyName: 'Mud Therapy', sessionNumber: 2, scheduledDate: new Date(dateBase - dayMs*7).toISOString().split('T')[0], status: 'Completed', notes: '' },
  { _id: 'SESS008', assignmentId: 'ASSIGN004', patientId: 'PAT004', doctorId: 'doc1', therapyId: 'ther6', therapyName: 'Yoga Session', sessionNumber: 3, scheduledDate: new Date(dateBase - dayMs*5).toISOString().split('T')[0], status: 'Completed', notes: '' },
  { _id: 'SESS009', assignmentId: 'ASSIGN004', patientId: 'PAT004', doctorId: 'doc1', therapyId: 'ther6', therapyName: 'Yoga Session', sessionNumber: 4, scheduledDate: new Date(dateBase - dayMs*2).toISOString().split('T')[0], status: 'Completed', notes: '' },
  { _id: 'SESS010', assignmentId: 'ASSIGN004', patientId: 'PAT004', doctorId: 'doc1', therapyId: 'ther4', therapyName: 'Mud Therapy', sessionNumber: 5, scheduledDate: new Date(dateBase + dayMs*1).toISOString().split('T')[0], status: 'Pending', notes: '' },
  { _id: 'SESS011', assignmentId: 'ASSIGN004', patientId: 'PAT004', doctorId: 'doc1', therapyId: 'ther6', therapyName: 'Yoga Session', sessionNumber: 6, scheduledDate: new Date(dateBase + dayMs*3).toISOString().split('T')[0], status: 'Pending', notes: '' },
  { _id: 'SESS012', assignmentId: 'ASSIGN005', patientId: 'PAT005', doctorId: 'doc1', therapyId: 'ther5', therapyName: 'Hydrotherapy', sessionNumber: 1, scheduledDate: new Date(dateBase - dayMs*4).toISOString().split('T')[0], status: 'Completed', notes: '' },
  { _id: 'SESS013', assignmentId: 'ASSIGN005', patientId: 'PAT005', doctorId: 'doc1', therapyId: 'ther6', therapyName: 'Yoga Session', sessionNumber: 2, scheduledDate: new Date(dateBase - dayMs*1).toISOString().split('T')[0], status: 'Completed', notes: '' },
  { _id: 'SESS014', assignmentId: 'ASSIGN005', patientId: 'PAT005', doctorId: 'doc1', therapyId: 'ther5', therapyName: 'Hydrotherapy', sessionNumber: 3, scheduledDate: new Date(dateBase + dayMs*1).toISOString().split('T')[0], status: 'Pending', notes: '' },
  { _id: 'SESS015', assignmentId: 'ASSIGN005', patientId: 'PAT005', doctorId: 'doc1', therapyId: 'ther6', therapyName: 'Yoga Session', sessionNumber: 4, scheduledDate: new Date(dateBase + dayMs*3).toISOString().split('T')[0], status: 'Pending', notes: '' },
  { _id: 'SESS016', assignmentId: 'ASSIGN002', patientId: 'PAT002', doctorId: 'doc1', therapyId: 'ther1', therapyName: 'Acupuncture', sessionNumber: 10, scheduledDate: new Date(dateBase - dayMs*5).toISOString().split('T')[0], status: 'Completed', notes: 'Pain resolved' },
  { _id: 'SESS017', assignmentId: 'ASSIGN003', patientId: 'PAT003', doctorId: 'doc1', therapyId: 'ther3', therapyName: 'Shirodhara', sessionNumber: 6, scheduledDate: new Date(dateBase - dayMs*2).toISOString().split('T')[0], status: 'Completed', notes: 'Sleeping well now' },
  { _id: 'SESS018', assignmentId: 'ASSIGN001', patientId: 'PAT001', doctorId: 'doc1', therapyId: 'ther4', therapyName: 'Mud Therapy', sessionNumber: 6, scheduledDate: new Date(dateBase - dayMs*1).toISOString().split('T')[0], status: 'Completed', notes: '' },
  { _id: 'SESS019', assignmentId: 'ASSIGN002', patientId: 'PAT002', doctorId: 'doc1', therapyId: 'ther1', therapyName: 'Acupuncture', sessionNumber: 11, scheduledDate: new Date(dateBase - dayMs*1).toISOString().split('T')[0], status: 'Completed', notes: '' },
  { _id: 'SESS020', assignmentId: 'ASSIGN004', patientId: 'PAT004', doctorId: 'doc1', therapyId: 'ther6', therapyName: 'Yoga Session', sessionNumber: 7, scheduledDate: new Date(dateBase - dayMs*1).toISOString().split('T')[0], status: 'Completed', notes: '' }
];

export const mockFollowUps = [
  { _id: 'FOL001', patientId: 'PAT001', doctorId: 'doc1', consultationId: 'CONS001', dueDate: new Date(dateBase - dayMs*15).toISOString().split('T')[0], type: 'Treatment Follow-up', reason: 'Review digestion', status: 'Completed', priority: 'Normal', notes: 'Did well on diet' },
  { _id: 'FOL002', patientId: 'PAT001', doctorId: 'doc1', consultationId: 'CONS002', dueDate: new Date(dateBase + dayMs*5).toISOString().split('T')[0], type: 'Post-Therapy Check', reason: 'Review detox results', status: 'Upcoming', priority: 'Important', notes: '' },
  { _id: 'FOL003', patientId: 'PAT002', doctorId: 'doc1', consultationId: 'CONS003', dueDate: new Date(dateBase - dayMs*20).toISOString().split('T')[0], type: 'Treatment Follow-up', reason: 'Back pain review', status: 'Completed', priority: 'Normal', notes: 'Pain reduced by 80%' },
  { _id: 'FOL004', patientId: 'PAT003', doctorId: 'doc1', consultationId: 'CONS004', dueDate: new Date(dateBase - dayMs*30).toISOString().split('T')[0], type: 'Treatment Follow-up', reason: 'Sleep quality check', status: 'Completed', priority: 'Normal', notes: 'Sleeping 7 hours continuous' },
  { _id: 'FOL005', patientId: 'PAT004', doctorId: 'doc1', consultationId: 'CONS005', dueDate: new Date(dateBase + dayMs*3).toISOString().split('T')[0], type: 'Review', reason: 'Sugar levels monitoring', status: 'Upcoming', priority: 'High', notes: '' },
  { _id: 'FOL006', patientId: 'PAT005', doctorId: 'doc1', consultationId: 'CONS006', dueDate: new Date(dateBase + dayMs*7).toISOString().split('T')[0], type: 'Treatment Follow-up', reason: 'Weight check', status: 'Upcoming', priority: 'Normal', notes: '' },
  { _id: 'FOL007', patientId: 'PAT006', doctorId: 'doc1', consultationId: 'CONS007', dueDate: new Date(dateBase).toISOString().split('T')[0], type: 'General Follow-up', reason: 'Immunity assessment', status: 'Due Today', priority: 'Important', notes: '' },
  { _id: 'FOL008', patientId: 'PAT007', doctorId: 'doc2', consultationId: 'CONS008', dueDate: new Date(dateBase + dayMs*1).toISOString().split('T')[0], type: 'Review', reason: 'Joint pain check', status: 'Upcoming', priority: 'Normal', notes: '' }
];

export const mockTasks = [
  { _id: 'TASK001', doctorId: 'doc1', docId: 'doc1', title: 'Review Priya Menon follow-up notes', description: 'Check digestion improvements.', priority: 'Medium', status: 'Pending', date: dateBase },
  { _id: 'TASK002', doctorId: 'doc1', docId: 'doc1', title: 'Complete Arun Kumar therapy assessment', description: 'Finalize report for spine care.', priority: 'High', status: 'In Progress', date: dateBase - dayMs },
  { _id: 'TASK003', doctorId: 'doc1', docId: 'doc1', title: 'Submit today closing report', description: 'Log all revenue and patients.', priority: 'Urgent', status: 'Pending', date: dateBase },
  { _id: 'TASK004', doctorId: 'doc1', docId: 'doc1', title: 'Review pending consultation documentation', description: 'Upload lab reports for Kavya.', priority: 'Medium', status: 'Completed', date: dateBase - dayMs*2 },
  { _id: 'TASK005', doctorId: 'doc1', docId: 'doc1', title: 'Call Suresh Ravi regarding follow-up', description: 'Check fasting sugar levels.', priority: 'High', status: 'Pending', date: dateBase },
  { _id: 'TASK006', doctorId: 'doc1', docId: 'doc1', title: 'Prepare wellness plan for new patient', description: 'Vignesh lifestyle routine.', priority: 'Low', status: 'Completed', date: dateBase - dayMs*4 },
  { _id: 'TASK007', doctorId: 'doc1', docId: 'doc1', title: 'Review today therapy session notes', description: 'Check mud therapy feedback.', priority: 'Medium', status: 'Pending', date: dateBase },
  { _id: 'TASK008', doctorId: 'doc1', docId: 'doc1', title: 'Update personal notes for upcoming webinar', description: 'Naturopathy benefits outline.', priority: 'Low', status: 'In Progress', date: dateBase - dayMs*1 }
];

export const mockInvoices = [
  { _id: 'INV001', patientId: 'PAT001', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 25), items: [{ type: 'Consultation', description: 'Initial Consultation', amount: 1500 }], totalAmount: 1500, paidAmount: 1500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 25)).toISOString().split('T')[0] },
  { _id: 'INV002', patientId: 'PAT001', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 12), items: [{ type: 'Package', description: 'Naturopathy Detox Program', amount: 5000 }], totalAmount: 5000, paidAmount: 5000, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 12)).toISOString().split('T')[0] },
  { _id: 'INV003', patientId: 'PAT002', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 40), items: [{ type: 'Consultation', description: 'Initial Consultation', amount: 1500 }], totalAmount: 1500, paidAmount: 1500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 40)).toISOString().split('T')[0] },
  { _id: 'INV004', patientId: 'PAT002', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 30), items: [{ type: 'Package', description: 'Spine Care Therapy', amount: 7500 }], totalAmount: 7500, paidAmount: 7500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 30)).toISOString().split('T')[0] },
  { _id: 'INV005', patientId: 'PAT003', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 55), items: [{ type: 'Consultation', description: 'Initial Consultation', amount: 1500 }], totalAmount: 1500, paidAmount: 1500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 55)).toISOString().split('T')[0] },
  { _id: 'INV006', patientId: 'PAT003', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 20), items: [{ type: 'Package', description: 'Stress Management Program', amount: 7500 }], totalAmount: 7500, paidAmount: 7500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 20)).toISOString().split('T')[0] },
  { _id: 'INV007', patientId: 'PAT004', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 12), items: [{ type: 'Consultation', description: 'Initial Consultation', amount: 1500 }], totalAmount: 1500, paidAmount: 1500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 12)).toISOString().split('T')[0] },
  { _id: 'INV008', patientId: 'PAT004', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 10), items: [{ type: 'Package', description: 'Diabetes Wellness Program', amount: 4100 }], totalAmount: 4100, paidAmount: 4100, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 10)).toISOString().split('T')[0] },
  { _id: 'INV009', patientId: 'PAT005', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 8), items: [{ type: 'Consultation', description: 'Initial Consultation', amount: 1500 }], totalAmount: 1500, paidAmount: 1500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 8)).toISOString().split('T')[0] },
  { _id: 'INV010', patientId: 'PAT005', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 5), items: [{ type: 'Package', description: 'Weight Management Program', amount: 8500 }], totalAmount: 8500, paidAmount: 8500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 5)).toISOString().split('T')[0] },
  { _id: 'INV011', patientId: 'PAT006', docId: 'doc1', doctorId: 'doc1', date: dateBase - (dayMs * 2), items: [{ type: 'Consultation', description: 'Initial Consultation', amount: 1500 }], totalAmount: 1500, paidAmount: 1500, status: 'Paid', dueDate: new Date(dateBase - (dayMs * 2)).toISOString().split('T')[0] },
  { _id: 'INV012', patientId: 'PAT001', docId: 'doc1', doctorId: 'doc1', date: dateBase, items: [{ type: 'Consultation', description: 'Follow-Up Consultation', amount: 1000 }], totalAmount: 1000, paidAmount: 1000, status: 'Paid', dueDate: new Date(dateBase).toISOString().split('T')[0] },
  { _id: 'INV013', patientId: 'PAT006', docId: 'doc1', doctorId: 'doc1', date: dateBase, items: [{ type: 'Therapy', description: 'Acupuncture Session', amount: 1000 }], totalAmount: 1000, paidAmount: 1000, status: 'Paid', dueDate: new Date(dateBase).toISOString().split('T')[0] }
];

export const mockPayments = mockInvoices.map(inv => ({
  _id: 'PAY_' + inv._id, invoiceId: inv._id, patientId: inv.patientId, amount: inv.paidAmount, mode: 'UPI', date: inv.date, transactionId: 'TXN' + Math.floor(Math.random()*10000000)
}));

export const mockIncentives = [
  { _id: 'INC001', docId: 'doc1', doctorId: 'doc1', period: '2026-03', totalRevenue: 82500, target: 75000, percentage: 5, calculatedAmount: 4125, status: 'Approved', date: dateBase - dayMs*150 },
  { _id: 'INC002', docId: 'doc1', doctorId: 'doc1', period: '2026-04', totalRevenue: 91000, target: 80000, percentage: 5, calculatedAmount: 4550, status: 'Approved', date: dateBase - dayMs*120 },
  { _id: 'INC003', docId: 'doc1', doctorId: 'doc1', period: '2026-05', totalRevenue: 85000, target: 80000, percentage: 5, calculatedAmount: 4250, status: 'Approved', date: dateBase - dayMs*90 },
  { _id: 'INC004', docId: 'doc1', doctorId: 'doc1', period: '2026-06', totalRevenue: 95000, target: 80000, percentage: 5, calculatedAmount: 4750, status: 'Approved', date: dateBase - dayMs*60 },
  { _id: 'INC005', docId: 'doc1', doctorId: 'doc1', period: '2026-07', totalRevenue: 105000, target: 90000, percentage: 5, calculatedAmount: 5250, status: 'Approved', date: dateBase - dayMs*30 },
  { _id: 'INC006', docId: 'doc1', doctorId: 'doc1', period: '2026-08', totalRevenue: 41600, target: 90000, percentage: 5, calculatedAmount: 2080, status: 'Pending', date: dateBase }
];

export const mockSocialSubmissions = [
  { _id: 'SOC001', docId: 'doc1', doctorId: 'doc1', platform: 'Instagram', title: 'Top 5 Detox Diets', description: 'A short reel on naturopathy detox basics', link: 'https://instagram.com/aimnaturecure/reel1', type: 'Video', status: 'Approved', date: dateBase - dayMs*30, reviewNote: 'Great engagement!' },
  { _id: 'SOC002', docId: 'doc1', doctorId: 'doc1', platform: 'Facebook', title: 'Managing Diabetes Naturally', description: 'Article link to our new blog post', link: 'https://facebook.com/aimnaturecure/post1', type: 'Article', status: 'Approved', date: dateBase - dayMs*20, reviewNote: 'Approved for boosting.' },
  { _id: 'SOC003', docId: 'doc1', doctorId: 'doc1', platform: 'YouTube', title: 'Yoga for Spine Care', description: '15-min follow along routine', link: 'https://youtube.com/watch?v=mock1', type: 'Video', status: 'Approved', date: dateBase - dayMs*15, reviewNote: 'Excellent quality.' },
  { _id: 'SOC004', docId: 'doc1', doctorId: 'doc1', platform: 'LinkedIn', title: 'Corporate Wellness Programs', description: 'Why companies should invest in naturopathy', link: 'https://linkedin.com/aimnaturecure/post1', type: 'Article', status: 'Pending', date: dateBase - dayMs*2, reviewNote: '' },
  { _id: 'SOC005', docId: 'doc1', doctorId: 'doc1', platform: 'Instagram', title: 'Acupuncture Myths Busted', description: 'Carousel post', link: 'https://instagram.com/aimnaturecure/post2', type: 'Article', status: 'Rejected', date: dateBase - dayMs*5, reviewNote: 'Please use the updated brand colors.' },
  { _id: 'SOC006', docId: 'doc1', doctorId: 'doc1', platform: 'YouTube', title: 'Patient Testimonial - Priya', description: 'Digestive wellness success story', link: 'https://youtube.com/watch?v=mock2', type: 'Testimonial', status: 'Pending', date: dateBase, reviewNote: '' }
];

export const mockDailyReports = [
  { _id: 'REP001', docId: 'doc1', doctorId: 'doc1', date: dateBase - dayMs*6, patientsSeen: 8, consultationsCompleted: 4, therapySessions: 6, followUpsCompleted: 3, revenue: 14500, closingStatus: 'Submitted', status: 'Reviewed', notes: 'Busy morning, smooth afternoon.', addendums: [{ date: dateBase - dayMs*5.5, notes: 'Forgot to mention we ran out of size 2 needles.' }] },
  { _id: 'REP002', docId: 'doc1', doctorId: 'doc1', date: dateBase - dayMs*5, patientsSeen: 6, consultationsCompleted: 3, therapySessions: 5, followUpsCompleted: 2, revenue: 11000, closingStatus: 'Submitted', notes: 'All appointments attended.' },
  { _id: 'REP003', docId: 'doc1', doctorId: 'doc1', date: dateBase - dayMs*4, patientsSeen: 9, consultationsCompleted: 5, therapySessions: 7, followUpsCompleted: 4, revenue: 18500, closingStatus: 'Submitted', notes: 'High patient inflow.' },
  { _id: 'REP004', docId: 'doc1', doctorId: 'doc1', date: dateBase - dayMs*3, patientsSeen: 7, consultationsCompleted: 4, therapySessions: 5, followUpsCompleted: 2, revenue: 12500, closingStatus: 'Submitted', notes: 'Normal day.' },
  { _id: 'REP005', docId: 'doc1', doctorId: 'doc1', date: dateBase - dayMs*2, patientsSeen: 5, consultationsCompleted: 2, therapySessions: 4, followUpsCompleted: 1, revenue: 8500, closingStatus: 'Submitted', notes: 'Light schedule due to rain.' },
  { _id: 'REP006', docId: 'doc1', doctorId: 'doc1', date: dateBase - dayMs*1, patientsSeen: 8, consultationsCompleted: 4, therapySessions: 6, followUpsCompleted: 3, revenue: 15500, closingStatus: 'Submitted', notes: 'Completed all sessions on time.' },
  { _id: 'REP007', docId: 'doc1', doctorId: 'doc1', date: dateBase, patientsSeen: 4, consultationsCompleted: 2, therapySessions: 2, followUpsCompleted: 1, revenue: 5500, closingStatus: 'Draft', notes: 'Half day completed.' }
];

export const mockDoctorNotes = [
  { _id: 'NOTE001', docId: 'doc1', doctorId: 'doc1', title: 'Priya Menon Treatment Plan', content: 'Consider advancing her to intermittent fasting next week if digestion holds.', date: dateBase - dayMs*14 },
  { _id: 'NOTE002', docId: 'doc1', doctorId: 'doc1', title: 'Weekly Therapy Review', content: 'Acupuncture showing great results for back pain cases this month.', date: dateBase - dayMs*10 },
  { _id: 'NOTE003', docId: 'doc1', doctorId: 'doc1', title: 'Follow-Up Preparation', content: 'Need to review Kavya sleep logs before her next visit.', date: dateBase - dayMs*5 },
  { _id: 'NOTE004', docId: 'doc1', doctorId: 'doc1', title: 'Patient Wellness Observations', type: 'Clinical', content: 'Notice an increase in lifestyle disorder cases post holidays.', date: dateBase - dayMs*2 },
  { _id: 'NOTE005', docId: 'doc1', doctorId: 'doc1', title: 'August Consultation Notes', content: 'Keep consultations strict to 20 mins to avoid schedule overflow.', date: dateBase - dayMs*1 },
  { _id: 'NOTE006', docId: 'doc1', doctorId: 'doc1', title: 'Therapy Package Ideas', content: 'Drafting a new Corporate Destress Package. Speak with admin.', date: dateBase },
  { _id: 'NOTE007', docId: 'doc1', doctorId: 'doc1', title: 'Diet Chart Template', content: 'Need to update the standard sattvic diet chart with more local fruit options.', date: dateBase - dayMs*20 },
  { _id: 'NOTE008', docId: 'doc1', doctorId: 'doc1', title: 'Inventory Request', content: 'Need more acupuncture needles size 0.25mm.', date: dateBase - dayMs*8 }
];

export const mockPatientDocuments = [
  { _id: 'DOCM001', patientId: 'PAT007', name: 'Knee X-Ray', type: 'application/pdf', uploadedBy: 'Admin', url: 'mock-url-xray.pdf', date: dateBase - dayMs*24, description: 'Shows reduced joint space', fileSize: '1.2 MB' },
  { _id: 'DOCM002', patientId: 'PAT007', name: 'Physio Prescription', type: 'image/jpeg', uploadedBy: 'doc1', url: 'mock-url-rx.jpg', date: dateBase - dayMs*20, description: 'External doc prescription', fileSize: '500 KB' },
  { _id: 'DOCM003', patientId: 'PAT008', name: 'Post-Op Report', type: 'application/pdf', uploadedBy: 'Admin', url: 'mock-url-report.pdf', date: dateBase - dayMs*90, description: 'Discharge summary', fileSize: '3.4 MB' }
];

export const mockLeads = [
  { _id: 'lead1', name: 'Ramesh Singh', phone: '9112223333', source: 'Instagram', status: 'New', notes: 'Interested in detox package.', date: dateBase - dayMs*2 }
];

export const mockIncentiveRules = [
  { _id: 'rule1', docId: 'doc1', targetAmount: 75000, percentage: 5, effectiveDate: '2026-01-01', date: dateBase - dayMs*200 }
];


export const mockCaseSheets = [
  {
    _id: 'cs_101', patientId: 'PAT001', date: new Date(dateBase - (dayMs * 28)).toISOString(),
    headerSnapshot: { patientName: 'Priya Menon', age: 29, gender: 'Female', doctorName: 'Dr. Ananya Sharma' },
    presentComplaints: 'Severe bloating after meals, acidic reflux.',
    vitals: { bp: '120/80', pulse: '72', weight: '65', height: '160', bmi: '25.4' },
    obgHistory: 'Regular cycles', personalHistory: 'Vegetarian, sedentary lifestyle', gpe: 'Normal appearance',
    systemicExamination: 'Abdomen slightly distended, tender in epigastric region.',
    pulseDiagnosis: { Vata: { l1: 'High', l2: 'Normal' } }, finalDiagnosis: 'Acid Peptic Disease (Pitta imbalance)',
    doctorSignature: { doctorId: 'doc1', timestamp: new Date(dateBase - (dayMs * 28)).toISOString() },
    isFinalized: true,
    treatmentProtocols: [
      { _id: 'tpe_1', date: new Date(dateBase - (dayMs * 27)).toISOString(), notes: 'Started on Sattvic diet.', doctorId: 'doc1' },
      { _id: 'tpe_2', date: new Date(dateBase - (dayMs * 15)).toISOString(), notes: 'Bloating reduced. Continue same diet.', doctorId: 'doc1' },
      { _id: 'tpe_3', date: new Date(dateBase - (dayMs * 5)).toISOString(), notes: 'Patient reports 80% improvement.', doctorId: 'doc1' }
    ]
  }
];
