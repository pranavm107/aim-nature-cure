const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'mockData.js');
let code = fs.readFileSync(mockDataPath, 'utf8');

// Add doc3
code = code.replace(
  /export const mockDoctors = \[([\s\S]*?)\];/,
  `export const mockDoctors = [$1, 
  {
    _id: 'doc3', name: 'Dr. Vikram Singh', speciality: 'Physiotherapy',
    degree: 'BPT', experience: '10 Years', fees: 1400, address: { line1: 'Rehab Center', line2: 'AIM Nature Cure' },
    date: dateBase - (dayMs * 400), available: true, image: ''
  }
];`
);

// Add mockCaseSheets array if it doesn't exist
if (!code.includes('export const mockCaseSheets')) {
  code += `\n\nexport const mockCaseSheets = [
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
];\n`;
}

// Modify mockPatients
code = code.replace(
  /export const mockPatients = \[([\s\S]*?)\];/,
  `export const mockPatients = [
  { _id: 'PAT001', name: 'Priya Menon', age: 29, gender: 'Female', phone: '9876543210', address: 'Coimbatore', condition: 'Digestive Wellness', assignedDoctor: 'doc1', status: 'Active', leadSource: 'Direct', date: dateBase - (dayMs * 30) },
  { _id: 'PAT002', name: 'Arun Kumar', age: 42, gender: 'Male', phone: '9876543211', address: 'Pollachi', condition: 'Chronic Back Pain', assignedDoctor: 'doc1', status: 'Active', leadSource: 'Google', date: dateBase - (dayMs * 45) },
  { _id: 'PAT003', name: 'Kavya Krishnan', age: 35, gender: 'Female', phone: '9876543212', address: 'Coimbatore', condition: 'Stress and Sleep Management', assignedDoctor: 'doc2', status: 'Active', leadSource: 'Referral', date: dateBase - (dayMs * 60) },
  { _id: 'PAT004', name: 'Suresh Ravi', age: 51, gender: 'Male', phone: '9876543213', address: 'Tiruppur', condition: 'Diabetes Wellness', assignedDoctor: 'doc2', status: 'Active', leadSource: 'Direct', date: dateBase - (dayMs * 15) },
  { _id: 'PAT005', name: 'Meena Raj', age: 38, gender: 'Female', phone: '9876543214', address: 'Coimbatore', condition: 'Weight Management', assignedDoctor: 'doc3', status: 'Active', leadSource: 'Instagram', date: dateBase - (dayMs * 10) },
  { _id: 'PAT006', name: 'Vignesh Kumar', age: 31, gender: 'Male', phone: '9876543215', address: 'Pollachi', condition: 'Lifestyle Management', assignedDoctor: 'doc3', status: 'Active', leadSource: 'Referral', date: dateBase - (dayMs * 5) },
  { _id: 'PAT007', name: 'Neha Sharma', age: 45, gender: 'Female', phone: '9876543216', address: 'Coimbatore', condition: 'Joint Pain', assignedDoctor: 'doc1', status: 'Completed Treatment', leadSource: 'Direct', date: dateBase - (dayMs * 25) },
  { _id: 'PAT008', name: 'Rahul Das', age: 50, gender: 'Male', phone: '9876543217', address: 'Chennai', condition: 'Post-Op Recovery', assignedDoctor: 'doc2', status: 'Inactive', leadSource: 'Google', date: dateBase - (dayMs * 100) }
];`
);

// Modify mockAppointments
code = code.replace(
  /export const mockAppointments = \[([\s\S]*?)\];/,
  `export const mockAppointments = [
  { _id: 'app1', userId: 'PAT001', docId: 'doc1', slotDate: new Date(dateBase + dayMs).toISOString().split('T')[0], slotTime: '10:00 am', userData: { name: 'Priya Menon', image: '' }, docData: { name: 'Dr. Ananya Sharma', _id: 'doc1' }, amount: 1500, date: dateBase - dayMs, cancelled: false, isCompleted: false },
  { _id: 'app2', userId: 'PAT005', docId: 'doc3', slotDate: new Date(dateBase - dayMs*2).toISOString().split('T')[0], slotTime: '10:00 am', userData: { name: 'Meena Raj', image: '' }, docData: { name: 'Dr. Vikram Singh', _id: 'doc3' }, amount: 1400, date: dateBase - dayMs*5, cancelled: false, isCompleted: true },
  { _id: 'app3', userId: 'PAT005', docId: 'doc3', slotDate: new Date(dateBase - dayMs).toISOString().split('T')[0], slotTime: '11:00 am', userData: { name: 'Meena Raj', image: '' }, docData: { name: 'Dr. Vikram Singh', _id: 'doc3' }, amount: 1400, date: dateBase - dayMs*5, cancelled: true, isCompleted: false },
  { _id: 'app4', userId: 'PAT005', docId: 'doc3', slotDate: new Date(dateBase + dayMs*3).toISOString().split('T')[0], slotTime: '02:00 pm', userData: { name: 'Meena Raj', image: '' }, docData: { name: 'Dr. Vikram Singh', _id: 'doc3' }, amount: 1400, date: dateBase - dayMs*1, cancelled: false, isCompleted: false }
];`
);

// Modify mockConsultations
code = code.replace(
  /export const mockConsultations = \[([\s\S]*?)\];/,
  `export const mockConsultations = [
  { _id: 'CONS001', patientId: 'PAT001', doctorId: 'doc1', date: dateBase - (dayMs * 25), chiefComplaint: 'Severe bloating and indigestion after meals', history: 'Irregular eating habits, desk job', observations: 'Abdominal distension', diagnosis: 'Indigestion', treatmentPlan: 'Sattvic diet', dietAdvice: 'Avoid spicy food', followUpDate: new Date(dateBase - (dayMs * 15)).toISOString().split('T')[0] },
  { _id: 'CONS002', patientId: 'PAT003', doctorId: 'doc2', date: dateBase - (dayMs * 50), chiefComplaint: 'Severe insomnia', history: '6 months stress', observations: 'Anxious', diagnosis: 'Stress Insomnia', treatmentPlan: 'Yoga Nidra', dietAdvice: 'Warm milk at night', followUpDate: new Date(dateBase - (dayMs * 40)).toISOString().split('T')[0], addendums: [{ date: dateBase - (dayMs * 48), notes: 'Patient called, prescribed ashwagandha.' }] },
  { _id: 'CONS003', patientId: 'PAT003', doctorId: 'doc2', date: dateBase - (dayMs * 40), chiefComplaint: 'Follow up', history: 'Sleeping 4 hours now', observations: 'Calmer', diagnosis: 'Improving Insomnia', treatmentPlan: 'Continue Yoga', dietAdvice: 'Same', followUpDate: new Date(dateBase - (dayMs * 20)).toISOString().split('T')[0] },
  { _id: 'CONS004', patientId: 'PAT007', doctorId: 'doc1', date: dateBase - (dayMs * 25), chiefComplaint: 'Knee pain', history: 'Osteoarthritis', observations: 'Crepitus', diagnosis: 'OA Knee', treatmentPlan: 'Mud therapy', dietAdvice: 'Calcium rich', followUpDate: '' }
];`
);

// Modify mockPatientDocuments
code = code.replace(
  /export const mockPatientDocuments = \[([\s\S]*?)\];/,
  `export const mockPatientDocuments = [
  { _id: 'DOCM001', patientId: 'PAT007', name: 'Knee X-Ray', type: 'application/pdf', uploadedBy: 'Admin', url: 'mock-url-xray.pdf', date: dateBase - dayMs*24, description: 'Shows reduced joint space', fileSize: '1.2 MB' },
  { _id: 'DOCM002', patientId: 'PAT007', name: 'Physio Prescription', type: 'image/jpeg', uploadedBy: 'doc1', url: 'mock-url-rx.jpg', date: dateBase - dayMs*20, description: 'External doc prescription', fileSize: '500 KB' },
  { _id: 'DOCM003', patientId: 'PAT008', name: 'Post-Op Report', type: 'application/pdf', uploadedBy: 'Admin', url: 'mock-url-report.pdf', date: dateBase - dayMs*90, description: 'Discharge summary', fileSize: '3.4 MB' }
];`
);

fs.writeFileSync(mockDataPath, code, 'utf8');
console.log('mockData.js successfully updated.');
