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
  // Get case sheet by patient ID
  getCaseSheetByPatientId: async (patientId) => {
    await delay();
    const caseSheet = state.caseSheets.find(c => c.patientId === patientId);
    return {
      success: true,
      caseSheet: caseSheet || null
    };
  },

  // Create a new case sheet (immutable after this)
  createCaseSheet: async (patientId, caseSheetData, doctorId) => {
    await delay();
    
    // Enforce cardinality: One per patient
    const existing = state.caseSheets.find(c => c.patientId === patientId);
    if (existing) {
      return { success: false, message: "Patient already has a Case Sheet." };
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
      pulseDiagnosis: caseSheetData.pulseDiagnosis,
      finalDiagnosis: caseSheetData.finalDiagnosis,
      doctorSignature: {
        doctorId,
        timestamp: new Date().toISOString()
      },
      isFinalized: true, // Immutability lock
      treatmentProtocols: []
    };

    state.caseSheets.push(newCaseSheet);
    saveCaseSheets(state.caseSheets);
    return { success: true, caseSheet: newCaseSheet };
  },

  // Append a treatment protocol entry
  appendProtocol: async (caseSheetId, notes, doctorId) => {
    await delay();
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

    caseSheet.treatmentProtocols.push(newEntry);
    saveCaseSheets(state.caseSheets);
    return { success: true, protocol: newEntry };
  }
};
