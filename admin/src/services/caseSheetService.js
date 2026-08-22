const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data for Case Sheets
// Each case sheet belongs to a patient
const mockCaseSheets = [
  {
    patientId: 'pat1', // John Doe
    date: Date.now(),
    presentComplaints: 'Frequent headaches and neck pain.',
    vitals: {
      height: '172',
      weight: '68',
      bp: '120/80',
      heartRate: '72',
      respiratoryRate: '16',
      temperature: '98.4'
    },
    personalHistory: {
      appetite: 'Normal',
      sleep: 'Disturbed',
      bowel: 'Regular',
      micturition: 'Normal',
      thirst: 'Moderate',
      addiction: 'None'
    },
    obgHistory: '', // Male
    gpe: 'Patient conscious and oriented. General condition stable.',
    systemicExamination: 'No significant abnormality noted.',
    pulseDiagnosis: {
      lu: 'Normal', li: 'Weak', st: 'Normal', sp: 'Normal', tw: 'Normal', pc: 'Normal',
      ht: 'Normal', si: 'Normal', liv: 'Excess', gb: 'Normal', ub: 'Normal', kid: 'Weak'
    },
    finalDiagnosis: 'Tension headache',
    treatmentProtocols: [
      { _id: 'tp1', date: Date.now() - 86400000 * 2, details: 'Hydrotherapy - contrast bath for 15 mins.' },
      { _id: 'tp2', date: Date.now() - 86400000 * 1, details: 'Physiotherapy - cervical traction and stretches.' }
    ]
  }
];

export const caseSheetService = {
  getCaseSheetByPatientId: async (patientId) => {
    await delay();
    const caseSheet = mockCaseSheets.find(c => c.patientId === patientId);
    if (!caseSheet) return { success: true, caseSheet: null };
    return { success: true, caseSheet };
  },

  saveCaseSheet: async (patientId, data) => {
    await delay();
    const idx = mockCaseSheets.findIndex(c => c.patientId === patientId);
    
    if (idx > -1) {
      // Update existing
      mockCaseSheets[idx] = { ...mockCaseSheets[idx], ...data };
      return { success: true, caseSheet: mockCaseSheets[idx] };
    } else {
      // Create new
      const newCaseSheet = {
        patientId,
        date: Date.now(),
        treatmentProtocols: [],
        ...data
      };
      mockCaseSheets.push(newCaseSheet);
      return { success: true, caseSheet: newCaseSheet };
    }
  },

  addTreatmentProtocol: async (patientId, details) => {
    await delay();
    const caseSheet = mockCaseSheets.find(c => c.patientId === patientId);
    if (!caseSheet) throw new Error("Case sheet not found");

    const newProtocol = {
      _id: 'tp' + Date.now(),
      date: Date.now(),
      details
    };
    caseSheet.treatmentProtocols.push(newProtocol);
    return { success: true, protocol: newProtocol };
  },

  updateTreatmentProtocol: async (patientId, protocolId, details) => {
    await delay();
    const caseSheet = mockCaseSheets.find(c => c.patientId === patientId);
    if (!caseSheet) throw new Error("Case sheet not found");

    const protocol = caseSheet.treatmentProtocols.find(p => p._id === protocolId);
    if (protocol) {
      protocol.details = details;
    }
    return { success: true };
  },

  deleteTreatmentProtocol: async (patientId, protocolId) => {
    await delay();
    const caseSheet = mockCaseSheets.find(c => c.patientId === patientId);
    if (!caseSheet) throw new Error("Case sheet not found");

    caseSheet.treatmentProtocols = caseSheet.treatmentProtocols.filter(p => p._id !== protocolId);
    return { success: true };
  }
};
