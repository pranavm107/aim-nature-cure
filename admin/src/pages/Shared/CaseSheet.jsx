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
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [caseSheet, setCaseSheet] = useState(null);

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
      } else {
         toast.error("Failed to load patient");
         navigate('/patients');
         return;
      }

      const csRes = await caseSheetService.getCaseSheetByPatientId(id);
      if (csRes.success) {
         setCaseSheet(csRes.caseSheet);
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
       const res = await caseSheetService.createCaseSheet(id, caseSheetData, docData?._id);
       if (res.success) {
         toast.success("Case Sheet finalized successfully");
         setCaseSheet(res.caseSheet);
       } else {
         toast.error(res.message || "Failed to create Case Sheet");
       }
     } catch (err) {
       toast.error("Error creating Case Sheet");
       console.error(err);
     }
  };

  const handleAddProtocol = async () => {
     if(!protocolNotes.trim()) return toast.warn("Protocol notes cannot be empty");
     try {
       const res = await caseSheetService.appendProtocol(caseSheet._id, protocolNotes, docData?._id);
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

  return (
    <PageContainer>
      <PageHeader 
        title={`Case Sheet: ${patient.name}`} 
        subtitle="Complete intake evaluation and treatment protocols" 
        onBack={() => navigate(`/patient/${id}`)}
      />

      <div className="max-w-5xl mx-auto pb-12">
        {!caseSheet ? (
          isDoctor ? (
            <CaseSheetForm patient={patient} onSubmit={handleCreateCaseSheet} onCancel={() => navigate(`/patient/${id}`)} />
          ) : (
             <div className="bg-gray-50 rounded border border-dashed border-gray-300 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Case Sheet Found</h3>
                <p className="text-gray-500">The assigned doctor has not yet created a Case Sheet for this patient.</p>
             </div>
          )
        ) : (
          <div>
            <CaseSheetView caseSheet={caseSheet} />
            <TreatmentProtocolList 
               protocols={caseSheet.treatmentProtocols || []} 
               isDoctor={isDoctor} 
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
            <p className="text-sm text-gray-500 mb-4">Append a new treatment protocol entry. This action is immutable.</p>
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
