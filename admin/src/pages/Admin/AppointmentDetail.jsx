import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { appointmentService } from '../../services/appointmentService';
import { AdminContext } from '../../context/AdminContext';
import { patientService } from '../../services/patientService';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { Edit } from 'lucide-react';
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

  const fetchData = async () => {
    setLoading(true);
    try {
      if (doctors.length === 0) getAllDoctors();
      
      const patRes = await patientService.getPatients();
      if (patRes.success) setPatients(patRes.patients);

      const res = await appointmentService.getAppointmentById(id);
      if (res.success) {
        setAppointment(res.appointment);
      } else {
        toast.error("Appointment not found");
        navigate('/all-appointments');
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
      patientId: appointment.patientId || appointment.userId,
      docId: appointment.docId,
      slotDate: appointment.slotDate?.replace(/_/g, '-') || '',
      slotTime: appointment.slotTime || '',
      amount: appointment.amount || 0,
      notes: appointment.notes || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const p = patients.find(pat => pat._id === editFormData.patientId);
      const d = doctors.find(doc => doc._id === editFormData.docId);
      
      const updateData = {
        ...editFormData,
        amount: Number(editFormData.amount),
        userData: p ? { name: p.name, image: '', dob: p.dob } : appointment.userData,
        docData: d || appointment.docData
      };

      const res = await appointmentService.updateAppointment(id, updateData);
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

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!appointment) return null;

  const isLocked = appointment.isCompleted;

  return (
    <PageContainer>
      <PageHeader title="Appointment Details" subtitle="View and manage appointment information" />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Appointment #{id.slice(-6).toUpperCase()}</h2>
          <button onClick={openEditModal} className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
            <Edit className="w-4 h-4" /> Edit
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Patient</p>
            <p className="font-medium text-slate-800">{appointment.userData?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Doctor</p>
            <p className="font-medium text-slate-800">{appointment.docData?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Date & Time</p>
            <p className="font-medium text-slate-800">{appointment.slotDate?.replace(/_/g, '-')} at {appointment.slotTime}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Amount</p>
            <p className="font-medium text-slate-800">{currency}{appointment.amount}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Status</p>
            <div>
              {appointment.cancelled ? (
                <Badge variant="error">Cancelled</Badge>
              ) : appointment.isCompleted ? (
                <Badge variant="success">Completed</Badge>
              ) : (
                <Badge variant="info">Upcoming</Badge>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500 mb-1">Notes / Addendum</p>
            <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded border border-slate-100 whitespace-pre-wrap">
              {appointment.notes || 'No notes added.'}
            </p>
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
                  <strong>Notice:</strong> This appointment is marked as Completed. Only notes/addendum can be edited.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`flex flex-col gap-1 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
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
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className={`flex flex-col gap-1 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                  <label className="text-sm font-medium text-slate-700">Doctor</label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    value={editFormData.docId}
                    onChange={e => setEditFormData({...editFormData, docId: e.target.value})}
                    disabled={isLocked}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className={`flex flex-col gap-1 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                  <label className="text-sm font-medium text-slate-700">Date</label>
                  <input 
                    type="date"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    value={editFormData.slotDate}
                    onChange={e => setEditFormData({...editFormData, slotDate: e.target.value})}
                    disabled={isLocked}
                    required
                  />
                </div>

                <div className={`flex flex-col gap-1 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                  <label className="text-sm font-medium text-slate-700">Time</label>
                  <input 
                    type="time"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    value={editFormData.slotTime}
                    onChange={e => setEditFormData({...editFormData, slotTime: e.target.value})}
                    disabled={isLocked}
                    required
                  />
                </div>

                <div className={`flex flex-col gap-1 sm:col-span-2 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                  <InputField 
                    label="Fees" 
                    type="number"
                    value={editFormData.amount} 
                    onChange={e => setEditFormData({...editFormData, amount: e.target.value})} 
                    disabled={isLocked}
                    required 
                  />
                </div>

                <div className="sm:col-span-2">
                  <TextareaField 
                    label="Notes / Addendum" 
                    value={editFormData.notes} 
                    onChange={e => setEditFormData({...editFormData, notes: e.target.value})} 
                    placeholder="Add appointment notes here..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default AppointmentDetail;
