import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { consultationService } from '../../services/consultationService';
import { appointmentService } from '../../services/appointmentService';
import { documentService } from '../../services/documentService';
import { AppContext } from '../../context/AppContext';
import ConsultationHistory from '../Doctor/ConsultationHistory';
import PatientDocuments from '../../components/patient/PatientDocuments';
import FollowUpSection from '../../components/patient/FollowUpSection';
import TherapyHistory from '../../components/patient/TherapyHistory';
import PatientActivityTimeline from '../../components/patient/PatientActivityTimeline';
import PatientBillingSummary from '../../components/patient/PatientBillingSummary';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { slotDateFormat, currency } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);
  
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Addendum state
  const [addendumModalOpen, setAddendumModalOpen] = useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  const [addendumText, setAddendumText] = useState('');

  // Upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);

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
      
      const apptRes = await appointmentService.getPatientAppointments(id);
      if (apptRes.success) {
        setAppointments(apptRes.appointments);
      }
      
      const docRes = await documentService.getPatientDocuments(id);
      if (docRes.success) {
        setDocuments(docRes.documents);
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

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if(!uploadFile || !uploadName.trim()) return toast.warn("Please provide name and file");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadName);
      
      const res = await documentService.uploadDocument(id, formData);
      if(res.success) {
        toast.success("Document uploaded successfully");
        setUploadModalOpen(false);
        setUploadFile(null);
        setUploadName('');
        fetchPatientData();
      } else {
        toast.error("Failed to upload document");
      }
    } catch (err) {
      toast.error("Error uploading document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if(window.confirm("Are you sure you want to delete this document?")) {
      try {
        const res = await documentService.deleteDocument(id, docId);
        if(res.success) {
          toast.success("Document deleted");
          fetchPatientData();
        }
      } catch (err) {
        toast.error("Error deleting document");
      }
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-gray-500 font-medium">Loading patient details...</p></div>;
  if (!patient) return null;

  const timelineItems = timeline;

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
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Profile Information</h2>
            <div className="flex flex-col gap-3 text-sm">
              <p><span className="text-gray-500 w-24 inline-block">Phone:</span> <span className="font-medium text-gray-800">{patient.phone}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Email:</span> <span className="font-medium text-gray-800">{patient.email || 'N/A'}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">DOB:</span> <span className="font-medium text-gray-800">{patient.dob}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Gender:</span> <span className="font-medium text-gray-800">{patient.gender}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Address:</span> <span className="font-medium text-gray-800">{patient.address}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Lead Source:</span> <span className="font-medium text-gray-800">{patient.leadSource || 'N/A'}</span></p>
              <div className="mt-2 pt-2 border-t flex items-center justify-between">
                <p className="text-gray-500">Status:</p>
                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${patient.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {patient.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline, Appointments, Documents */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Clinical Records (Case Sheet) */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Clinical Records</h2>
            <div className="flex flex-col sm:flex-row items-center justify-between bg-teal-50 border border-teal-100 p-4 rounded-lg">
              <div>
                <h3 className="font-bold text-teal-900 mb-1">Complete Case Sheet</h3>
                <p className="text-sm text-teal-800 max-w-md">View and manage the patient's complete case sheet including physical examinations, diagnosis, and treatment protocols.</p>
              </div>
              <button 
                onClick={() => navigate(`/patient/${id}/case-sheet`)}
                className="mt-3 sm:mt-0 bg-teal-600 text-white px-5 py-2 rounded shadow-sm hover:bg-teal-700 transition-colors whitespace-nowrap text-sm font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Open Case Sheet
              </button>
            </div>
          </div>

          {/* Clinical Timeline (Consultation History) */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Clinical Timeline</h2>
            {timelineItems.length === 0 ? (
              <div className="bg-gray-50 rounded border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500 mb-2">No consultations or therapies yet.</p>
                <p className="text-sm text-gray-400">Start by creating a new consultation above.</p>
              </div>
            ) : (
              <ConsultationHistory 
                timelineItems={timelineItems} 
                onAddAddendum={handleAddAddendum} 
              />
            )}
          </div>

          {/* Follow-ups Section */}
          <FollowUpSection patientId={id} refreshTrigger={timeline} />

          {/* Therapy History */}
          <TherapyHistory patientId={id} />

          {/* Master Patient Activity Timeline */}
          <PatientActivityTimeline patientId={id} />

          {/* Appointments */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-gray-50 rounded border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500 mb-2">No appointments scheduled.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {appointments.map(appt => (
                  <div key={appt._id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{slotDateFormat(appt.slotDate)}, {appt.slotTime}</p>
                      <p className="text-xs text-gray-500 mt-1">Doctor: {appt.docData?.name}</p>
                    </div>
                    <div>
                      {appt.cancelled ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-red-100 text-red-700">Cancelled</span>
                      ) : appt.isCompleted ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-green-100 text-green-700">Completed</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-blue-100 text-blue-700">Upcoming</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Documents Management */}
          <PatientDocuments patientId={id} refreshTrigger={timeline} />
          
          {/* Patient Billing Summary (Admin Only) */}
          {aToken && <PatientBillingSummary patientId={id} refreshTrigger={timeline} />}
          
        </div>
      </div>

      {/* Addendum Modal */}
      {addendumModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Addendum</h3>
            <textarea 
              value={addendumText}
              onChange={(e) => setAddendumText(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              rows={4}
              placeholder="Type addendum here..."
            />
            <div className="flex justify-end gap-3 mt-5">
              <button 
                onClick={() => setAddendumModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitAddendum}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
              >
                Save Addendum
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default PatientDetail;
