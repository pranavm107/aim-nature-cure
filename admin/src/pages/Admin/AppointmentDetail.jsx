import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { appointmentService } from '../../services/appointmentService';
import { toast } from 'react-toastify';
import { Edit, Calendar } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useContext(AppContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  const fetchAppointment = async () => {
    setLoading(true);
    try {
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
    fetchAppointment();
  }, [id]);

  const isEditable = appointment && !appointment.isCompleted && !appointment.cancelled;

  const openEditModal = () => {
    if (!isEditable) {
      toast.warn("Completed or cancelled appointments cannot be edited.");
      return;
    }
    setEditDate(appointment.slotDate?.replace(/_/g, '-') || '');
    setEditTime(appointment.slotTime || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        slotDate: editDate, // in UI we might just send date and time
        slotTime: editTime
      };
      const res = await appointmentService.updateAppointment(id, updateData);
      if (res.success) {
        toast.success("Appointment updated successfully");
        setEditModalOpen(false);
        fetchAppointment();
      } else {
        toast.error(res.message || "Failed to update appointment");
      }
    } catch (err) {
      toast.error("Error updating appointment");
    }
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!appointment) return null;

  return (
    <PageContainer>
      <PageHeader title="Appointment Details" subtitle="View and manage appointment information" />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Booking Information</h2>
          {isEditable && (
            <button onClick={openEditModal} className="text-slate-500 hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
              <Edit className="w-4 h-4" />
              Reschedule
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-500 text-sm mb-1">Patient Name</p>
            <p className="font-medium text-slate-800">{appointment.userData?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Doctor Name</p>
            <p className="font-medium text-slate-800">{appointment.docData?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Date & Time</p>
            <p className="font-medium text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {appointment.slotDate?.replace(/_/g, '-')}, {appointment.slotTime}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Consultation Fees</p>
            <p className="font-medium text-slate-800">{currency}{appointment.amount}</p>
          </div>
          <div className="md:col-span-2 pt-4 border-t border-slate-100">
            <p className="text-slate-500 text-sm mb-2">Status</p>
            {appointment.cancelled ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider bg-red-100 text-red-700">Cancelled</span>
            ) : appointment.isCompleted ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider bg-emerald-100 text-emerald-700">Completed</span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider bg-blue-100 text-blue-700">Upcoming / Scheduled</span>
            )}
            
            {(!isEditable && appointment.isCompleted) && (
              <p className="text-xs text-slate-500 mt-3">This appointment has been completed and is now immutable according to medical record rules.</p>
            )}
          </div>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Reschedule Appointment</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" />
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
