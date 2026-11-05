import apiClient from './apiClient';
import { getStore, setStore } from '../utils/mockStore';

const isValidUUID = (str) => {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(str.trim());
};

const mapBackendToFrontend = (data, fallbackPatient = null) => {
  if (!data) return null;

  const idNumber = data.patientCustomId || fallbackPatient?.patientId || fallbackPatient?.idNumber || '';

  // Retrieve any locally persisted treatment protocols for this case sheet
  const storageKey = `protocols_${data.uuid || data._id}`;
  const localProtocols = getStore(storageKey, data.treatmentProtocols || []);

  return {
    _id: data.uuid || data._id,
    uuid: data.uuid,
    patientId: data.patientId,
    patientCustomId: data.patientCustomId,
    date: data.visitDate || data.createdAt || new Date().toISOString(),
    visitDate: data.visitDate || (data.createdAt ? String(data.createdAt).split('T')[0] : new Date().toISOString().split('T')[0]),
    presentComplaints: data.presentComplaints || '',
    vitals: {
      height: data.height != null ? data.height : '',
      weight: data.weight != null ? data.weight : '',
      bp: data.bloodPressure || '',
      bloodPressure: data.bloodPressure || '',
      heartRate: data.heartRate != null ? data.heartRate : '',
      respiratoryRate: data.respiratoryRate != null ? data.respiratoryRate : '',
      temperature: data.temperature != null ? data.temperature : '',
    },
    obgHistory: data.obgHistory || '',
    personalHistory: {
      appetite: data.appetite || '',
      sleep: data.sleep || '',
      bowel: data.bowel || '',
      micturition: data.micturition || '',
      thirst: data.thirst || '',
      addiction: data.addiction || '',
    },
    gpe: data.gpe || '',
    systemicExamination: data.systemicExamination || '',
    generalDiagnosis: data.generalDiagnosis || '',
    pulseDiagnosis: {
      lu: data.pulseLu || '',
      li: data.pulseLi || '',
      st: data.pulseSt || '',
      sp: data.pulseSp || '',
      tw: data.pulseTw || '',
      pc: data.pulsePc || '',
      ht: data.pulseHt || '',
      si: data.pulseSi || '',
      liv: data.pulseLiv || '',
      gb: data.pulseGb || '',
      ub: data.pulseUb || '',
      kid: data.pulseKid || '',
    },
    finalDiagnosis: data.finalDiagnosis || '',
    doctorSignature: data.doctorSignature || '',
    active: data.active !== false,
    headerSnapshot: {
      idNumber: idNumber,
      patientId: idNumber,
      name: data.patientName || fallbackPatient?.name || '',
      phone: fallbackPatient?.phone || '',
      age: fallbackPatient?.age != null ? `${fallbackPatient.age}` : (fallbackPatient?.dob || ''),
      gender: fallbackPatient?.gender || '',
      occupation: fallbackPatient?.occupation || 'N/A',
      address: fallbackPatient?.address || '',
    },
    treatmentProtocols: localProtocols,
    createdAt: data.createdAt,
    modifiedAt: data.modifiedAt,
  };
};

const mapFrontendToBackend = (formData, patientId, doctorSignature, isUpdate = false, existingUuid = null) => {
  const vitals = formData.vitals || {};
  const personal = formData.personalHistory || {};
  const pulse = formData.pulseDiagnosis || {};
  const header = formData.headerSnapshot || {};

  const cleanNum = (val, isInt = false) => {
    if (val === '' || val == null) return null;
    const parsed = isInt ? parseInt(val, 10) : parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  };

  const payload = {
    patientId: isValidUUID(patientId) ? patientId : (isValidUUID(formData.patientId) ? formData.patientId : null),
    patientIdentifier: header.patientId || header.idNumber || formData.patientIdentifier || (typeof patientId === 'string' && !isValidUUID(patientId) ? patientId : null),
    visitDate: formData.visitDate || (formData.date ? String(formData.date).split('T')[0] : new Date().toISOString().split('T')[0]),
    presentComplaints: formData.presentComplaints || '',
    height: cleanNum(vitals.height),
    weight: cleanNum(vitals.weight),
    bloodPressure: vitals.bp || vitals.bloodPressure || '',
    heartRate: cleanNum(vitals.heartRate, true),
    respiratoryRate: cleanNum(vitals.respiratoryRate, true),
    temperature: cleanNum(vitals.temperature),
    obgHistory: formData.obgHistory || '',
    appetite: personal.appetite || '',
    sleep: personal.sleep || '',
    bowel: personal.bowel || '',
    micturition: personal.micturition || '',
    thirst: personal.thirst || '',
    addiction: personal.addiction || '',
    gpe: formData.gpe || '',
    systemicExamination: formData.systemicExamination || '',
    generalDiagnosis: formData.generalDiagnosis || '',
    pulseLu: pulse.lu || '',
    pulseLi: pulse.li || '',
    pulseSt: pulse.st || '',
    pulseSp: pulse.sp || '',
    pulseTw: pulse.tw || '',
    pulsePc: pulse.pc || '',
    pulseHt: pulse.ht || '',
    pulseSi: pulse.si || '',
    pulseLiv: pulse.liv || '',
    pulseGb: pulse.gb || '',
    pulseUb: pulse.ub || '',
    pulseKid: pulse.kid || '',
    finalDiagnosis: formData.finalDiagnosis || '',
    doctorSignature: typeof formData.doctorSignature === 'string' && formData.doctorSignature.trim()
      ? formData.doctorSignature.trim()
      : (typeof doctorSignature === 'string' && doctorSignature ? doctorSignature : 'Dr. Assigned'),
    userId: localStorage.getItem('userId') || undefined,
  };

  if (isUpdate && existingUuid) {
    payload.uuid = existingUuid;
    payload.active = formData.active !== false;
  }

  return payload;
};

export const caseSheetService = {
  // Get case sheet by patient ID (UUID or custom identifier)
  getCaseSheetByPatientId: async (patientId, secondaryPatientId = null) => {
    try {
      if (!patientId && !secondaryPatientId) {
        return { success: true, caseSheet: null };
      }

      const primaryId = patientId || secondaryPatientId;
      let res = await apiClient.get(`/case-sheets/patient/${encodeURIComponent(primaryId)}`);
      let data = res.data?.result;

      // Fallback to secondary if primary returned empty array or null
      const isEmpty = !data || (Array.isArray(data) && data.length === 0);
      if (isEmpty && secondaryPatientId && secondaryPatientId !== primaryId) {
        try {
          const secRes = await apiClient.get(`/case-sheets/patient/${encodeURIComponent(secondaryPatientId)}`);
          if (secRes.data?.result) {
            data = secRes.data.result;
          }
        } catch (secErr) {
          console.warn('Fallback secondary query failed:', secErr);
        }
      }

      if (!data) {
        return { success: true, caseSheet: null };
      }

      const raw = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
      if (!raw) {
        return { success: true, caseSheet: null };
      }

      return {
        success: true,
        caseSheet: mapBackendToFrontend(raw)
      };
    } catch (error) {
      console.error('Error fetching case sheet by patient:', error);
      if (error.response?.status === 404) {
        return { success: true, caseSheet: null };
      }
      return { success: false, message: error.response?.data?.message || 'Failed to fetch case sheet', caseSheet: null };
    }
  },

  // Get case sheet by Case Sheet UUID
  getCaseSheetById: async (id) => {
    try {
      const res = await apiClient.get(`/case-sheets/${id}`);
      const data = res.data?.result || res.data;
      return {
        success: true,
        caseSheet: mapBackendToFrontend(data)
      };
    } catch (error) {
      console.error('Error fetching case sheet by id:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch case sheet' };
    }
  },

  // Create a new case sheet
  createCaseSheet: async (patientId, caseSheetData, doctorId = null) => {
    try {
      const payload = mapFrontendToBackend(caseSheetData, patientId, doctorId, false);
      const res = await apiClient.post('/case-sheets/create', payload);

      // Fetch the newly created record to get complete generated fields (uuid, etc.)
      const fetchId = payload.patientId || payload.patientIdentifier || patientId;
      const secId = payload.patientIdentifier || caseSheetData.headerSnapshot?.patientId;
      const refetch = await caseSheetService.getCaseSheetByPatientId(fetchId, secId);
      if (refetch.success && refetch.caseSheet) {
        return { success: true, caseSheet: refetch.caseSheet };
      }

      const generatedUuid = res.data?.result?.uuid || res.data?.uuid;
      return {
        success: true,
        caseSheet: {
          ...caseSheetData,
          _id: generatedUuid || 'cs_' + Date.now(),
          uuid: generatedUuid
        }
      };
    } catch (error) {
      console.error('Error creating case sheet:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to save case sheet' };
    }
  },

  // Update an existing case sheet
  updateCaseSheet: async (caseSheetId, caseSheetData, doctorId = null) => {
    try {
      const uuid = isValidUUID(caseSheetId) ? caseSheetId : (caseSheetData.uuid || caseSheetData._id);
      if (!isValidUUID(uuid)) {
        return { success: false, message: "Valid Case Sheet UUID is required for update" };
      }

      const payload = mapFrontendToBackend(caseSheetData, caseSheetData.patientId, doctorId, true, uuid);
      await apiClient.put('/case-sheets/update', payload);

      const refetch = await caseSheetService.getCaseSheetById(uuid);
      if (refetch.success && refetch.caseSheet) {
        return { success: true, caseSheet: refetch.caseSheet };
      }

      return {
        success: true,
        caseSheet: { ...caseSheetData, uuid, _id: uuid }
      };
    } catch (error) {
      console.error('Error updating case sheet:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update case sheet' };
    }
  },

  // Delete a case sheet by UUID
  deleteCaseSheet: async (id) => {
    try {
      if (!isValidUUID(id)) {
        return { success: false, message: "Valid Case Sheet UUID is required for deletion" };
      }
      await apiClient.delete(`/case-sheets/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting case sheet:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete case sheet' };
    }
  },

  // Append a treatment protocol entry to local store
  appendProtocol: async (caseSheetId, notes, doctorId) => {
    try {
      const storageKey = `protocols_${caseSheetId}`;
      const current = getStore(storageKey, []);
      const newEntry = {
        _id: 'tpe_' + Date.now(),
        date: new Date().toISOString(),
        notes,
        doctorId
      };
      const updated = [newEntry, ...current];
      setStore(storageKey, updated);
      return { success: true, protocol: newEntry };
    } catch (error) {
      console.error('Error appending protocol:', error);
      return { success: false, message: 'Failed to append protocol' };
    }
  }
};
