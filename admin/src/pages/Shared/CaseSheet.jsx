import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseSheetService } from '../../services/caseSheetService';
import { patientService } from '../../services/patientService';
import { AdminContext } from '../../context/AdminContext';
import { DoctorContext } from '../../context/DoctorContext';
import CaseSheetView from './CaseSheetView';
import CaseSheetForm from '../Doctor/CaseSheetForm';
import TreatmentProtocolList from '../../components/patient/TreatmentProtocolList';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';

const CaseSheet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { aToken } = useContext(AdminContext);
  const { dToken, docData } = useContext(DoctorContext);
  
  const isDoctor = !!dToken;
  const canEdit = isDoctor || !!aToken;
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [caseSheet, setCaseSheet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Add Protocol State
  const [addProtocolModalOpen, setAddProtocolModalOpen] = useState(false);
  const [protocolNotes, setProtocolNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await patientService.getPatientById(id);
      if (pRes.success && pRes.patient) {
        const pat = pRes.patient;
        setPatient(pat);
        const resolvedPatientId = pat._id || pat.uuid || id;
        const customPatientId = pat.patientId || pat.idNumber;
        const csRes = await caseSheetService.getCaseSheetByPatientId(resolvedPatientId, customPatientId);
        if (csRes.success) {
          setCaseSheet(csRes.caseSheet);
        } else {
          setCaseSheet(null);
        }
      } else {
        toast.error("Failed to load patient");
        navigate('/patients');
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading case sheet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateCaseSheet = async (caseSheetData) => {
    try {
      const patientKey = patient?._id || patient?.uuid || id;
      const defaultDoctorName = docData?.name || localStorage.getItem('doctorName') || 'Dr. Assigned';
      const doctorId = docData?._id || localStorage.getItem('userId');

      const res = await caseSheetService.createCaseSheet(patientKey, {
        ...caseSheetData,
        doctorSignature: caseSheetData.doctorSignature || defaultDoctorName
      }, doctorId);

      if (res.success) {
        toast.success("Case Sheet saved successfully");
        setCaseSheet(res.caseSheet);
        setIsEditing(false);
      } else {
        toast.error(res.message || "Failed to save Case Sheet");
      }
    } catch (err) {
      toast.error("Error saving Case Sheet");
      console.error(err);
    }
  };

  const handleUpdateCaseSheet = async (caseSheetData) => {
    try {
      const targetId = caseSheet?.uuid || caseSheet?._id;
      const defaultDoctorName = docData?.name || localStorage.getItem('doctorName') || 'Dr. Assigned';
      const doctorId = docData?._id || localStorage.getItem('userId');

      const res = await caseSheetService.updateCaseSheet(targetId, {
        ...caseSheetData,
        patientId: patient?._id || patient?.uuid || caseSheet?.patientId,
        doctorSignature: caseSheetData.doctorSignature || caseSheet?.doctorSignature || defaultDoctorName
      }, doctorId);

      if (res.success) {
        toast.success("Case Sheet updated successfully");
        setCaseSheet(res.caseSheet);
        setIsEditing(false);
      } else {
        toast.error(res.message || "Failed to update Case Sheet");
      }
    } catch (err) {
      toast.error("Error updating Case Sheet");
      console.error(err);
    }
  };

  const handleDeleteCaseSheet = async () => {
    if (!caseSheet?.uuid) {
      toast.error("Case Sheet identifier not found");
      return;
    }

    if (window.confirm("Are you sure you want to delete this case sheet? This action cannot be undone.")) {
      try {
        const res = await caseSheetService.deleteCaseSheet(caseSheet.uuid);
        if (res.success) {
          toast.success("Case Sheet deleted successfully");
          setCaseSheet(null);
          setIsEditing(false);
        } else {
          toast.error(res.message || "Failed to delete Case Sheet");
        }
      } catch (err) {
        toast.error("Error deleting Case Sheet");
        console.error(err);
      }
    }
  };

  const handleAddProtocol = async () => {
    if (!protocolNotes.trim()) return toast.warn("Protocol notes cannot be empty");
    try {
      const caseSheetKey = caseSheet?.uuid || caseSheet?._id;
      const res = await caseSheetService.appendProtocol(caseSheetKey, protocolNotes, docData?._id || 'admin');
      if (res.success) {
        toast.success("Protocol appended");
        setAddProtocolModalOpen(false);
        setProtocolNotes('');
        // Update local state directly
        setCaseSheet(prev => ({
          ...prev,
          treatmentProtocols: [res.protocol, ...(prev.treatmentProtocols || [])]
        }));
      } else {
        toast.error(res.message || "Failed to add protocol");
      }
    } catch (err) {
      toast.error("Error adding protocol");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-500 font-medium">Loading Case Sheet...</p>
      </div>
    );
  }

  if (!patient) return null;

  const patientBackUrl = `/patient/${patient.patientId || patient.idNumber || id}`;

  return (
    <PageContainer>
      <PageHeader 
        title={`Case Sheet: ${patient.name}`} 
        subtitle={`Patient ID: ${patient.patientId || patient.idNumber || 'N/A'} • Intake evaluation and treatment protocols`} 
        onBack={() => navigate(patientBackUrl)}
      />

      <div className="max-w-5xl mx-auto pb-12">
        {isEditing ? (
          <CaseSheetForm 
            patient={patient} 
            initialData={caseSheet} 
            isEditMode={true} 
            onSubmit={handleUpdateCaseSheet} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : !caseSheet ? (
          canEdit ? (
            <CaseSheetForm 
              patient={patient} 
              onSubmit={handleCreateCaseSheet} 
              onCancel={() => navigate(patientBackUrl)} 
            />
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <h3 className="text-lg font-medium text-slate-700 mb-2">No Case Sheet Found</h3>
              <p className="text-slate-500 mb-4">The attending doctor has not yet created a Case Sheet for this patient.</p>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Case Sheet
                </button>
              )}
            </div>
          )
        ) : (
          <div>
            <CaseSheetView 
              caseSheet={caseSheet} 
              patient={patient}
              canEdit={canEdit}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDeleteCaseSheet}
            />
            <TreatmentProtocolList 
              protocols={caseSheet.treatmentProtocols || []} 
              isDoctor={canEdit} 
              onAddProtocol={() => setAddProtocolModalOpen(true)} 
            />
          </div>
        )}
      </div>

      {/* Add Protocol Modal */}
      {addProtocolModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Add Treatment Protocol</h3>
            <p className="text-sm text-slate-500 mb-4">Append a new treatment protocol entry to the patient's clinical record.</p>
            <textarea 
              value={protocolNotes}
              onChange={(e) => setProtocolNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              rows={5}
              placeholder="Enter protocol notes..."
            />
            <div className="flex justify-end gap-3 mt-5">
              <button 
                onClick={() => setAddProtocolModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProtocol}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
              >
                Save Protocol
              </button>
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  );
};

export default CaseSheet;
