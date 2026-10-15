import * as mockSeed from '../mocks/mockData';

// Automatically purge legacy mock data stored in localStorage so no dummy data remains
const mockKeys = [
  'mockPatients', 'mockDoctors', 'mockAppointments', 'mockConsultations',
  'mockTherapies', 'mockPackages', 'mockTherapyAssignments', 'mockTherapySessions',
  'mockFollowUps', 'mockTasks', 'mockInvoices', 'mockPayments',
  'mockSocialSubmissions', 'mockDailyReports', 'mockDoctorNotes',
  'mockPatientDocuments', 'mockLeads', 'mockCaseSheets', 'mockSalaries',
  'mockPayrollStatements', 'mockIncentiveRules', 'mockFollowUpActivities',
  'mockSocialMediaActivities'
];

try {
  mockKeys.forEach(k => {
    if (localStorage.getItem(k)) {
      localStorage.removeItem(k);
    }
  });
} catch (e) {
  // Ignore in non-browser env
}

export const getStore = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
  }
  return fallback || mockSeed[key] || [];
};

export const setStore = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

export const resetMockData = () => {
  mockKeys.forEach(k => localStorage.removeItem(k));
  window.location.reload();
};

if (typeof window !== 'undefined') {
  window.resetMockData = resetMockData;
}
