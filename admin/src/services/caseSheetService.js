// Mock storage for Case Sheets since backend is not connected yet
import { mockCaseSheets } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

// Mock storage for Case Sheets since backend is not connected yet
const loadCaseSheets = () => {
  return getStore('mockCaseSheets', mockCaseSheets);
};

const saveCaseSheets = (data) => {
  setStore('mockCaseSheets', data);
};

let state = {
  caseSheets: loadCaseSheets()
};

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const caseSheetService = {
  // Get case sheet by patient ID (UUID, patientId, or idNumber)
  getCaseSheetByPatientId: async (patientId, secondaryPatientId) => {
    await delay();
    state.caseSheets = loadCaseSheets();
    const caseSheet = state.caseSheets.find(c => 
      c.patientId === patientId || 
      (secondaryPatientId && c.patientId === secondaryPatientId) ||
      c.headerSnapshot?.idNumber === patientId ||
      c.headerSnapshot?.patientId === patientId ||
      (secondaryPatientId && (c.headerSnapshot?.idNumber === secondaryPatientId || c.headerSnapshot?.patientId === secondaryPatientId))
    );
    return {
      success: true,
      caseSheet: caseSheet || null
    };
  },

  // Create a new case sheet or update if already existing
  createCaseSheet: async (patientId, caseSheetData, doctorId) => {
    await delay();
    state.caseSheets = loadCaseSheets();
    const existingIndex = state.caseSheets.findIndex(c => 
      c.patientId === patientId || 
      (caseSheetData.headerSnapshot?.patientId && c.patientId === caseSheetData.headerSnapshot.patientId) ||
      (caseSheetData.headerSnapshot?.idNumber && (c.patientId === caseSheetData.headerSnapshot.idNumber || c.headerSnapshot?.idNumber === caseSheetData.headerSnapshot.idNumber))
    );

    if (existingIndex !== -1) {
      const updatedCaseSheet = {
        ...state.caseSheets[existingIndex],
        ...caseSheetData,
        generalDiagnosis: caseSheetData.generalDiagnosis || '',
        lastModified: new Date().toISOString(),
        lastModifiedBy: doctorId
      };
      state.caseSheets[existingIndex] = updatedCaseSheet;
      saveCaseSheets(state.caseSheets);
      return { success: true, caseSheet: updatedCaseSheet };
    }

    const newCaseSheet = {
      _id: 'cs_' + Date.now(),
      patientId,
      date: new Date().toISOString(),
      headerSnapshot: caseSheetData.headerSnapshot,
      presentComplaints: caseSheetData.presentComplaints,
      vitals: caseSheetData.vitals,
      obgHistory: caseSheetData.obgHistory,
      personalHistory: caseSheetData.personalHistory,
      gpe: caseSheetData.gpe,
      systemicExamination: caseSheetData.systemicExamination,
      generalDiagnosis: caseSheetData.generalDiagnosis || '',
      pulseDiagnosis: caseSheetData.pulseDiagnosis,
      finalDiagnosis: caseSheetData.finalDiagnosis,
      doctorSignature: {
        doctorId,
        timestamp: new Date().toISOString()
      },
      isFinalized: true,
      treatmentProtocols: []
    };

    state.caseSheets.push(newCaseSheet);
    saveCaseSheets(state.caseSheets);
    return { success: true, caseSheet: newCaseSheet };
  },

  // Update an existing case sheet
  updateCaseSheet: async (caseSheetId, caseSheetData, doctorId) => {
    await delay();
    state.caseSheets = loadCaseSheets();
    const index = state.caseSheets.findIndex(c => 
      c._id === caseSheetId || 
      c.patientId === caseSheetData.patientId ||
      (caseSheetData.headerSnapshot?.patientId && c.patientId === caseSheetData.headerSnapshot.patientId) ||
      (caseSheetData.headerSnapshot?.idNumber && c.headerSnapshot?.idNumber === caseSheetData.headerSnapshot.idNumber)
    );

    if (index === -1) {
      return { success: false, message: "Case Sheet not found." };
    }

    const updatedCaseSheet = {
      ...state.caseSheets[index],
      ...caseSheetData,
      generalDiagnosis: caseSheetData.generalDiagnosis || '',
      lastModified: new Date().toISOString(),
      lastModifiedBy: doctorId
    };

    state.caseSheets[index] = updatedCaseSheet;
    saveCaseSheets(state.caseSheets);
    return { success: true, caseSheet: updatedCaseSheet };
  },

  // Append a treatment protocol entry
  appendProtocol: async (caseSheetId, notes, doctorId) => {
    await delay();
    state.caseSheets = loadCaseSheets();
    const caseSheet = state.caseSheets.find(c => c._id === caseSheetId);
    if (!caseSheet) {
      return { success: false, message: "Case Sheet not found." };
    }

    const newEntry = {
      _id: 'tpe_' + Date.now(),
      date: new Date().toISOString(),
      notes,
      doctorId
    };

    if (!caseSheet.treatmentProtocols) {
      caseSheet.treatmentProtocols = [];
    }
    caseSheet.treatmentProtocols.push(newEntry);
    saveCaseSheets(state.caseSheets);
    return { success: true, protocol: newEntry };
  }
};
