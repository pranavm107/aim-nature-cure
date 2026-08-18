import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { consultationService } from '../../services/consultationService';
import ConsultationHistory from './ConsultationHistory';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // Addendum state
  const [addendumModalOpen, setAddendumModalOpen] = useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  const [addendumText, setAddendumText] = useState('');

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const patientRes = await patientService.getPatientById(id);
      if (patientRes.success) {
        setPatient(patientRes.patient);
      } else {
        toast.error("Failed to load patient");
        navigate('/patients');
        return;
      }

      const timelineRes = await patientService.getPatientTimeline(id);
      if (timelineRes.success) {
        setTimeline(timelineRes.timeline);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const handleAddAddendum = (consultationId) => {
    setActiveConsultationId(consultationId);
    setAddendumText('');
    setAddendumModalOpen(true);
  };

  const submitAddendum = async () => {
    if(!addendumText.trim()) return toast.warn("Addendum cannot be empty");
    try {
      const res = await consultationService.addConsultationAddendum(activeConsultationId, addendumText);
      if(res.success) {
        toast.success("Addendum added");
        setAddendumModalOpen(false);
        fetchPatientData(); // Refresh timeline
      } else {
        toast.error(res.message || "Failed to add addendum");
      }
    } catch(err) {
      toast.error("Error adding addendum");
      console.error(err);
    }
  };

  if (loading) return <div className="m-5 text-gray-500">Loading patient details...</div>;
  if (!patient) return null;

  // For now, filter timeline to only show consultations (as we haven't built therapies/invoices yet)
  const consultations = timeline.filter(item => item.type === 'consultation').map(item => item.data);

  return (
    <PageContainer>
      <PageHeader 
        title={`Patient Details: ${patient.name}`} 
        subtitle="Manage patient profile and clinical timeline"
        actions={
          <button 
            onClick={() => navigate(`/patient/${id}/new-consultation`)}
            className="bg-primary text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Consultation
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border rounded p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Profile Information</h2>
            <div className="flex flex-col gap-3 text-sm">
              <p><span className="text-gray-500 w-24 inline-block">Phone:</span> <span className="font-medium text-gray-800">{patient.phone}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Email:</span> <span className="font-medium text-gray-800">{patient.email || 'N/A'}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">DOB:</span> <span className="font-medium text-gray-800">{patient.dob}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Gender:</span> <span className="font-medium text-gray-800">{patient.gender}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Address:</span> <span className="font-medium text-gray-800">{patient.address}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Lead Source:</span> <span className="font-medium text-gray-800">{patient.leadSource || 'N/A'}</span></p>
              <div className="mt-2 pt-2 border-t flex items-center justify-between">
                <p className="text-gray-500">Status:</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {patient.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border rounded p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Clinical Timeline</h2>
            
            {timeline.length === 0 ? (
              <div className="bg-gray-50 rounded border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500 mb-2">No consultations, therapies, or invoices yet.</p>
                <p className="text-sm text-gray-400">Start by creating a new consultation above.</p>
              </div>
            ) : (
              <ConsultationHistory 
                consultations={consultations} 
                onAddAddendum={handleAddAddendum} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Addendum Modal */}
      {addendumModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Add Addendum</h3>
            <textarea 
              value={addendumText}
              onChange={(e) => setAddendumText(e.target.value)}
              className="w-full border rounded p-3 text-sm focus:outline-none focus:border-primary"
              rows={4}
              placeholder="Type addendum here..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setAddendumModalOpen(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={submitAddendum}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default PatientDetail;
