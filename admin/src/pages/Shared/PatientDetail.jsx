import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { consultationService } from '../../services/consultationService';
import { appointmentService } from '../../services/appointmentService';
import { documentService } from '../../services/documentService';
import { AppContext } from '../../context/AppContext';
// removed ConsultationHistory import
import PatientDocuments from '../../components/patient/PatientDocuments';
import FollowUpSection from '../../components/patient/FollowUpSection';
import TherapyHistory from '../../components/patient/TherapyHistory';
import PatientActivityTimeline from '../../components/patient/PatientActivityTimeline';
import PatientBillingSummary from '../../components/patient/PatientBillingSummary';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';
import { Plus, FileText, Edit, UserCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';

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

  // Edit Patient State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Reassign Doctor State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [newDocId, setNewDocId] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);

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
      
      if (aToken) {
        const docsRes = await adminService.getAllDoctors();
        if (docsRes.success) setDoctorsList(docsRes.doctors);
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

  const openEditModal = () => {
    setEditFormData({
      name: patient.name,
      phone: patient.phone,
      address: patient.address,
      dob: patient.dob,
      gender: patient.gender,
      status: patient.status
    });
    setEditModalOpen(true);
  };

  const submitEdit = async () => {
    try {
      const res = await patientService.updatePatient(id, editFormData);
      if (res.success) {
        toast.success("Patient updated");
        setEditModalOpen(false);
        fetchPatientData();
      } else {
        toast.error("Failed to update patient");
      }
    } catch (err) {
      toast.error("Error updating patient");
    }
  };

  const submitReassign = async () => {
    if (!newDocId) return toast.warn("Select a doctor");
    try {
      const res = await patientService.assignDoctor(id, newDocId);
      if (res.success) {
        toast.success("Doctor reassigned successfully");
        setReassignModalOpen(false);
        fetchPatientData();
      }
    } catch (err) {
      toast.error("Error reassigning doctor");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-slate-500 font-medium">Loading patient details...</p></div>;
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
            <Plus className="w-5 h-5" />
            New Consultation
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-lg font-semibold text-slate-800">Profile Information</h2>
              <button onClick={openEditModal} className="text-slate-500 hover:text-primary transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <p><span className="text-slate-500 w-24 inline-block">Phone:</span> <span className="font-medium text-slate-800">{patient.phone}</span></p>
              <p><span className="text-slate-500 w-24 inline-block">Email:</span> <span className="font-medium text-slate-800">{patient.email || 'N/A'}</span></p>
              <p><span className="text-slate-500 w-24 inline-block">DOB:</span> <span className="font-medium text-slate-800">{patient.dob}</span></p>
              <p><span className="text-slate-500 w-24 inline-block">Gender:</span> <span className="font-medium text-slate-800">{patient.gender}</span></p>
              <p><span className="text-slate-500 w-24 inline-block">Address:</span> <span className="font-medium text-slate-800">{patient.address}</span></p>
              <p><span className="text-slate-500 w-24 inline-block">Lead Source:</span> <span className="font-medium text-slate-800">{patient.leadSource || 'N/A'}</span></p>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <p className="text-slate-500">Status:</p>
                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${patient.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {patient.status || 'Active'}
                </span>
              </div>
              {aToken && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                   <button 
                     onClick={() => setReassignModalOpen(true)}
                     className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
                   >
                     <UserCheck className="w-4 h-4" />
                     Reassign Doctor
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline, Appointments, Documents */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Clinical Records (Case Sheet) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Clinical Records</h2>
            <div className="flex flex-col sm:flex-row items-center justify-between bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Complete Case Sheet</h3>
                <p className="text-sm text-slate-600 max-w-md">View and manage the patient's complete case sheet including physical examinations, diagnosis, and treatment protocols.</p>
              </div>
              <button 
                onClick={() => navigate(`/patient/${id}/case-sheet`)}
                className="mt-3 sm:mt-0 bg-primary text-white px-5 py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap text-sm font-medium flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Open Case Sheet
              </button>
            </div>
          </div>

          {/* Clinical Timeline (Consultation History) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Clinical Timeline</h2>
            {timelineItems.length === 0 ? (
              <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                <p className="text-slate-500 mb-2">No consultations yet.</p>
                <p className="text-sm text-slate-400">Start by creating a new consultation above.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {timelineItems.map((item, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 ml-2 pb-4 relative">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                    <p className="text-sm text-slate-500 font-medium mb-1">{new Date(item.date).toLocaleString()}</p>
                    <h3 className="text-md font-bold text-slate-800">{item.diagnosis || 'Consultation'}</h3>
                    <p className="text-slate-600 text-sm mt-1">{item.notes || item.chiefComplaint}</p>
                    {item.addendums && item.addendums.length > 0 && (
                      <div className="mt-3 bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                        <p className="font-semibold text-slate-700 mb-2">Addendums:</p>
                        {item.addendums.map((add, i) => (
                          <div key={i} className="mb-2 last:mb-0 border-l-2 border-slate-300 pl-2">
                            <p className="text-xs text-slate-500">{new Date(add.date).toLocaleString()}</p>
                            <p className="text-slate-600">{add.notes}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <button 
                      onClick={() => handleAddAddendum(item._id)}
                      className="mt-3 text-xs bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors font-medium"
                    >
                      + Add Addendum
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-ups Section */}
          <FollowUpSection patientId={id} refreshTrigger={timeline} />

          {/* Therapy History */}
          <TherapyHistory patientId={id} />

          {/* Master Patient Activity Timeline */}
          <PatientActivityTimeline patientId={id} />

          {/* Appointments */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                <p className="text-slate-500 mb-2">No appointments scheduled.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {appointments.map(appt => (
                  <div key={appt._id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{slotDateFormat(appt.slotDate)}, {appt.slotTime}</p>
                      <p className="text-xs text-slate-500 mt-1">Doctor: {appt.docData?.name}</p>
                    </div>
                    <div>
                      {appt.cancelled ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-red-100 text-red-700">Cancelled</span>
                      ) : appt.isCompleted ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-100 text-emerald-700">Completed</span>
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
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Addendum</h3>
            <textarea 
              value={addendumText}
              onChange={(e) => setAddendumText(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              rows={4}
              placeholder="Type addendum here..."
            />
            <div className="flex justify-end gap-3 mt-5">
              <button 
                onClick={() => setAddendumModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
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

      {/* Edit Patient Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit Patient Profile</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" value={editFormData.phone || ''} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input type="date" value={editFormData.dob || ''} onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select value={editFormData.gender || ''} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea value={editFormData.address || ''} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} rows="2" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={editFormData.status || ''} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={submitEdit} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Doctor Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Reassign Doctor</h3>
            <p className="text-sm text-slate-600 mb-4">Select a new doctor to assign this patient to.</p>
            <div className="mb-6">
              <select value={newDocId} onChange={(e) => setNewDocId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                <option value="">Select Doctor</option>
                {doctorsList.map(doc => (
                  <option key={doc._id} value={doc._id}>{doc.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setReassignModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={submitReassign} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">Reassign</button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default PatientDetail;
