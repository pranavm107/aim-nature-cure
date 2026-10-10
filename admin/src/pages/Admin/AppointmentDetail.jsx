import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { appointmentService } from '../../services/appointmentService';
import { AdminContext } from '../../context/AdminContext';
import { patientService } from '../../services/patientService';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { Edit, Trash2 } from 'lucide-react';
import { InputField, TextareaField } from '../../components/common/FormFields';
import Badge from '../../components/common/Badge';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useContext(AppContext);
  const { doctors, getAllDoctors } = useContext(AdminContext);
  
  const [appointment, setAppointment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (doctors.length === 0) getAllDoctors();
      
      const patRes = await patientService.getPatients();
      if (patRes.success) setPatients(patRes.patients || patRes.content || []);

      const res = await appointmentService.getAppointmentById(id);
      if (res.success) {
        setAppointment(res.appointment);
      } else {
        toast.error(res.message || "Appointment not found");
        navigate('/admin/appointments');
      }
    } catch (err) {
      toast.error("Error loading appointment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const openEditModal = () => {
    setEditFormData({
      patientId: appointment.patientId || appointment.userData?.id || '',
      doctorId: appointment.doctorId || appointment.docData?.id || '',
      appointmentDate: appointment.appointmentDate || appointment.slotDate?.replace(/_/g, '-') || '',
      appointmentTime: appointment.appointmentTime || appointment.slotTime || '',
      status: appointment.status || 'SCHEDULED'
    });
    setEditModalOpen(true);
  };

  const formatTimeForAPI = (timeStr) => {
    if (!timeStr) return "00:00:00";
    if (timeStr.length === 5) return `${timeStr}:00`;
    return timeStr;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        uuid: id,
        patientId: editFormData.patientId,
        doctorId: editFormData.doctorId,
        appointmentDate: editFormData.appointmentDate,
        appointmentTime: formatTimeForAPI(editFormData.appointmentTime),
        status: editFormData.status
      };

      const res = await appointmentService.updateAppointment(updateData);
      if (res.success) {
        toast.success("Appointment updated successfully");
        setEditModalOpen(false);
        fetchData();
      } else {
        toast.error(res.message || "Failed to update appointment");
      }
    } catch (err) {
      toast.error("Error updating appointment");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) return toast.error("Delete reason is required");
    
    try {
      const res = await appointmentService.deleteAppointment(id, deleteReason);
      if (res.success) {
        toast.success("Appointment deleted successfully");
        navigate('/admin/appointments');
      } else {
        toast.error(res.message || "Failed to delete appointment");
      }
    } catch (err) {
      toast.error("Error deleting appointment");
    }
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!appointment) return null;

  const isCompleted = appointment.status === 'COMPLETED' || appointment.isCompleted;
  const isCancelled = appointment.status === 'CANCELLED' || appointment.cancelled;
  const isLocked = isCompleted || isCancelled;

  return (
    <PageContainer>
      <PageHeader title="Appointment Details" subtitle="View and manage appointment information" />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Appointment #{id.slice(-6).toUpperCase()}</h2>
          <div className="flex gap-4">
            <button onClick={openEditModal} className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => setDeleteModalOpen(true)} className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-medium">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Patient</p>
            <p className="font-medium text-slate-800">{appointment.patientName || appointment.userData?.name || 'Unknown Patient'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Doctor</p>
            <p className="font-medium text-slate-800">{appointment.doctorName || appointment.docData?.name || 'Unknown Doctor'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Date & Time</p>
            <p className="font-medium text-slate-800">{appointment.appointmentDate || appointment.slotDate?.replace(/_/g, '-')} at {appointment.appointmentTime || appointment.slotTime}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Status</p>
            <div>
              {isCancelled ? (
                <Badge variant="error">Cancelled</Badge>
              ) : isCompleted ? (
                <Badge variant="success">Completed</Badge>
              ) : (
                <Badge variant="info">{appointment.status || 'Scheduled'}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Edit Appointment</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto">
              {isLocked && (
                <div className="mb-6 p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-sm">
                  <strong>Notice:</strong> This appointment is marked as {appointment.status}. Editing may be restricted by backend.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Patient</label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    value={editFormData.patientId}
                    onChange={e => setEditFormData({...editFormData, patientId: e.target.value})}
                    disabled={isLocked}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(p => (
                      <option key={p.uuid || p._id} value={p.uuid || p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Doctor</label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    value={editFormData.doctorId}
                    onChange={e => setEditFormData({...editFormData, doctorId: e.target.value})}
                    disabled={isLocked}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d.uuid || d._id} value={d.uuid || d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Date</label>
                  <input 
                    type="date"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    value={editFormData.appointmentDate}
                    onChange={e => setEditFormData({...editFormData, appointmentDate: e.target.value})}
                    disabled={isLocked}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Time</label>
                  <input 
                    type="time"
                    step="1"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    value={editFormData.appointmentTime}
                    onChange={e => setEditFormData({...editFormData, appointmentTime: e.target.value})}
                    disabled={isLocked}
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    value={editFormData.status}
                    onChange={e => setEditFormData({...editFormData, status: e.target.value})}
                    required
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors" disabled={isLocked}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800">Delete Appointment?</h3>
            </div>
            <form onSubmit={handleDelete} className="p-6">
              <p className="text-sm text-slate-600 mb-4">This action cannot be undone.</p>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delete Reason</label>
              <textarea 
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                rows="3"
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder="Duplicate entry..."
              />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default AppointmentDetail;
