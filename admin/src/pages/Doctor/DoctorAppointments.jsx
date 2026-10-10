import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { DoctorContext } from '../../context/DoctorContext';
import { appointmentService } from '../../services/appointmentService';
import DataTable from '../../components/common/DataTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DoctorAppointments = () => {
  const { currency } = useContext(AppContext);
  const { dToken, profileData } = useContext(DoctorContext);
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelId, setCancelId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeId, setCompleteId] = useState('');
  const [completePatientId, setCompletePatientId] = useState('');
  const [createNewConsultation, setCreateNewConsultation] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Backend automatically filters by doctor based on JWT
      const data = await appointmentService.getAppointments();
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message || 'Failed to load appointments');
        setAppointments([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
      setAppointments([]);
    }
  }, []);

  useEffect(() => {
    if (dToken) {
      loadData();
    }
  }, [dToken, loadData]);

  const handleComplete = async () => {
    try {
      const res = await appointmentService.completeAppointment(completeId);
      if (res.success) {
        toast.success("Appointment completed");
        setCompleteModalOpen(false);
        loadData();
        if (createNewConsultation && completePatientId) {
          navigate(`/patient/${completePatientId}/new-consultation`);
        }
      } else {
        toast.error(res.message || "Failed to complete appointment");
      }
    } catch (err) {
      toast.error("Error completing appointment");
    }
  };

  const openCompleteModal = (item) => {
    setCompleteId(item.uuid || item.id || item._id);
    setCompletePatientId(item.patientId || item.userId || item.userData?._id || item.userData?.id);
    setCreateNewConsultation(false);
    setCompleteModalOpen(true);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return toast.error("Cancellation reason is required");
    
    try {
      const res = await appointmentService.cancelAppointment(cancelId, cancelReason);
      if (res.success) {
        toast.success("Appointment cancelled");
        setCancelModalOpen(false);
        setCancelId('');
        setCancelReason('');
        loadData();
      } else {
        toast.error(res.message || "Failed to cancel appointment");
      }
    } catch (err) {
      toast.error("Error cancelling appointment");
    }
  };

  const openCancelModal = (item) => {
    setCancelId(item.uuid || item.id || item._id);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const columns = [
    { label: '#', className: '' },
    { label: 'Patient', className: '' },
    { label: 'Date & Time', className: '' },
    { label: 'Status', className: '' },
    { label: 'Action', className: '' },
  ];

  const renderRow = (item, index) => {
    const isCancelled = item.status === 'CANCELLED' || item.cancelled;
    const isCompleted = item.status === 'COMPLETED' || item.isCompleted;

    return (
      <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_3fr_1.5fr_2fr] items-center text-slate-500 py-3 px-6 border-b border-slate-100 hover:bg-slate-50 transition-colors' key={index}>
        <p className='max-sm:hidden'>{index+1}</p>
        <div className='flex items-center gap-2'>
          <p className="font-medium text-slate-800">{item.patientName || item.userData?.name || 'Unknown Patient'}</p>
        </div>
        <p>{item.appointmentDate || item.slotDate?.replace(/_/g, '-')}, {item.appointmentTime || item.slotTime}</p>
        <div>
          {isCancelled ? (
            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Cancelled</span>
          ) : isCompleted ? (
            <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Completed</span>
          ) : (
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">{item.status || 'Scheduled'}</span>
          )}
        </div>
        <div className="flex gap-2">
          {!isCancelled && !isCompleted && (
            <>
              <button onClick={() => openCompleteModal(item)} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors">Complete</button>
              <button onClick={() => openCancelModal(item)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors">Cancel</button>
            </>
          )}
        </div>
      </div>
    );
  };
  
  const renderMobileCard = (item, index) => {
    const isCancelled = item.status === 'CANCELLED' || item.cancelled;
    const isCompleted = item.status === 'COMPLETED' || item.isCompleted;

    return (
      <div key={item.uuid || item._id || index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
         <div className="flex justify-between items-start">
           <p className="font-semibold text-slate-800 text-lg">{item.patientName || item.userData?.name || 'Unknown Patient'}</p>
           {isCancelled ? (
            <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Cancelled</span>
          ) : isCompleted ? (
            <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Completed</span>
          ) : (
            <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">{item.status || 'Scheduled'}</span>
          )}
         </div>
         <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>
              <p className="text-xs text-slate-400">Date & Time</p>
              <p className="font-medium">{item.appointmentDate || item.slotDate?.replace(/_/g, '-')}, {item.appointmentTime || item.slotTime}</p>
            </div>
         </div>
         {!isCancelled && !isCompleted && (
            <div className="flex gap-2 justify-end mt-2">
              <button onClick={() => openCompleteModal(item)} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium">Complete</button>
              <button onClick={() => openCancelModal(item)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium">Cancel</button>
            </div>
          )}
      </div>
    );
  };

  return (
    <PageContainer>
      <PageHeader title="Today's Appointments" subtitle="Manage your appointments for the day" />

      <DataTable 
        columns={columns}
        data={appointments}
        renderRow={renderRow}
        renderMobileCard={renderMobileCard}
        loading={appointments === null}
        emptyMessage="No appointments found"
        gridColsClass="grid-cols-[0.5fr_3fr_3fr_1.5fr_2fr]"
      />

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Cancel Appointment</h3>
            </div>
            <form onSubmit={handleCancel} className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason</label>
              <textarea 
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                rows="3"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Doctor unavailable..."
              />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setCancelModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg">Keep Appointment</button>
                <button type="submit" className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Confirm Cancellation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Complete Appointment</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">Are you sure you want to mark this appointment as completed? This action cannot be undone.</p>
              
              <label className="flex items-center gap-2 mb-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20"
                  checked={createNewConsultation}
                  onChange={(e) => setCreateNewConsultation(e.target.checked)}
                />
                <span className="text-sm font-medium text-slate-700">Create a new consultation for this visit</span>
              </label>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setCompleteModalOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="button" onClick={handleComplete} className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Mark Completed</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default DoctorAppointments;