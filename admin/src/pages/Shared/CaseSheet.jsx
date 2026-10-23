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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await patientService.getPatientById(id);
      if (pRes.success) {
         setPatient(pRes.patient);
         const csRes = await caseSheetService.getCaseSheetByPatientId(pRes.patient._id || id, pRes.patient.patientId);
         if (csRes.success) {
            setCaseSheet(csRes.caseSheet);
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

  const handleCreateCaseSheet = async (caseSheetData) => {
     try {
       const patientKey = patient?._id || id;
       const res = await caseSheetService.createCaseSheet(patientKey, caseSheetData, docData?._id || 'admin');
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
       const targetId = caseSheet?._id || ('cs_' + (patient?._id || id));
       const res = await caseSheetService.updateCaseSheet(targetId, caseSheetData, docData?._id || 'admin');
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

  const handleAddProtocol = async () => {
     if(!protocolNotes.trim()) return toast.warn("Protocol notes cannot be empty");
     try {
       const res = await caseSheetService.appendProtocol(caseSheet._id, protocolNotes, docData?._id || 'admin');
       if(res.success) {
          toast.success("Protocol appended");
          setAddProtocolModalOpen(false);
          setProtocolNotes('');
          fetchData(); // refresh to get new protocol
       } else {
          toast.error(res.message || "Failed to add protocol");
       }
     } catch (err) {
       toast.error("Error adding protocol");
       console.error(err);
     }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-gray-500 font-medium">Loading Case Sheet...</p></div>;
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
             <div className="bg-gray-50 rounded border border-dashed border-gray-300 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Case Sheet Found</h3>
                <p className="text-gray-500">The assigned doctor has not yet created a Case Sheet for this patient.</p>
             </div>
          )
        ) : (
          <div>
            <CaseSheetView 
              caseSheet={caseSheet} 
              patient={patient}
              canEdit={canEdit}
              onEdit={() => setIsEditing(true)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Treatment Protocol</h3>
            <p className="text-sm text-gray-500 mb-4">Append a new treatment protocol entry to the patient's clinical record.</p>
            <textarea 
              value={protocolNotes}
              onChange={(e) => setProtocolNotes(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              rows={5}
              placeholder="Enter protocol notes..."
            />
            <div className="flex justify-end gap-3 mt-5">
              <button 
                onClick={() => setAddProtocolModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
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
