import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { AdminContext } from '../../context/AdminContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import DataTable from '../../components/common/DataTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const AllAppointments = () => {
  const { currency } = useContext(AppContext);
  const { doctors, getAllDoctors } = useContext(AdminContext);
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState(null);
  const [patients, setPatients] = useState([]);
  
  // Pagination & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '10:00:00'
  });

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelId, setCancelId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeId, setCompleteId] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset page on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await appointmentService.getAppointments(debouncedSearch, page, size);
      if (data.success) {
        setAppointments(data.appointments);
        setTotalElements(data.totalElements);
      } else {
        toast.error(data.message || 'Failed to load appointments');
        setAppointments([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
      setAppointments([]);
    }
  }, [debouncedSearch, page, size]);

  const loadData = async () => {
    await loadAppointments();
    
    try {
      const patData = await patientService.getPatients();
      if (patData.success) {
        setPatients(patData.patients || patData.content || []);
      }

      if (doctors.length === 0) {
        getAllDoctors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadAppointments]);

  const handleComplete = async () => {
    try {
      const res = await appointmentService.completeAppointment(completeId);
      if (res.success) {
        toast.success("Appointment completed");
        setCompleteModalOpen(false);
        setCompleteId('');
        loadAppointments();
      } else {
        toast.error(res.message || "Failed to complete appointment");
      }
    } catch (err) {
      toast.error("Error completing appointment");
    }
  };

  const openCompleteModal = (item) => {
    setCompleteId(item.uuid || item.id || item._id);
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
        loadAppointments();
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

  const formatTimeForAPI = (timeStr) => {
    // Ensure time is HH:mm:ss
    if (!timeStr) return "00:00:00";
    if (timeStr.length === 5) return `${timeStr}:00`;
    return timeStr;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
      return toast.error("Please fill all required fields");
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        patientId: newAppointment.patientId,
        doctorId: newAppointment.doctorId,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: formatTimeForAPI(newAppointment.appointmentTime)
      };

      const res = await appointmentService.createAppointment(payload);
      if (res.success) {
        toast.success("Appointment created");
        setIsCreating(false);
        setNewAppointment({
          patientId: '',
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '10:00:00'
        });
        loadAppointments();
      } else {
        toast.error(res.message || "Failed to create appointment");
      }
    } catch (err) {
      toast.error('Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { label: '#', className: '' },
    { label: 'Patient', className: '' },
    { label: 'Date & Time', className: '' },
    { label: 'Doctor', className: '' },
    { label: 'Status', className: '' },
    { label: 'Action', className: '' },
  ];

  const renderRow = (item, index) => {
    const isCancelled = item.status === 'CANCELLED' || item.cancelled;
    const isCompleted = item.status === 'COMPLETED' || item.isCompleted;
    
    return (
      <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_3fr_3fr_1.5fr_2fr] items-center text-slate-500 py-3 px-6 border-b border-slate-100 hover:bg-slate-50 transition-colors' key={index}>
        <p className='max-sm:hidden'>{(page * size) + index + 1}</p>
        <div className='flex items-center gap-2'>
          <p className="font-medium text-slate-800">{item.patientName || item.userData?.name || 'Unknown Patient'}</p>
        </div>
        <p>{item.appointmentDate || item.slotDate}, {item.appointmentTime || item.slotTime}</p>
        <div className='flex items-center gap-2'>
          <p>{item.doctorName || item.docData?.name || 'Unknown Doctor'}</p>
        </div>
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
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/appointments/${item.uuid || item.id || item._id}`); }}
            className="px-3 py-1 bg-slate-50 text-slate-600 rounded border border-slate-200 text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            View
          </button>
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
              <p className="font-medium">{item.appointmentDate || item.slotDate}, {item.appointmentTime || item.slotTime}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Doctor</p>
              <p className="font-medium">{item.doctorName || item.docData?.name || 'Unknown Doctor'}</p>
            </div>
         </div>
         <div className="flex gap-2 justify-end mt-2">
            <button onClick={() => navigate(`/admin/appointments/${item.uuid || item._id}`)} className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium mr-auto">View</button>
            {!isCancelled && !isCompleted && (
              <>
                <button onClick={() => openCompleteModal(item)} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium">Complete</button>
                <button onClick={() => openCancelModal(item)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium">Cancel</button>
              </>
            )}
         </div>
      </div>
    );
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Appointments" subtitle="Manage all system appointments" />
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Create Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={appointments}
        renderRow={renderRow}
        renderMobileCard={renderMobileCard}
        loading={appointments === null}
        emptyMessage="No appointments found"
        gridColsClass="grid-cols-[0.5fr_3fr_3fr_3fr_1.5fr_2fr]"
      />
      
      {/* Pagination Controls */}
      {totalElements > size && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 mt-4">
           <span className="text-sm text-slate-500">
             Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements}
           </span>
           <div className="flex gap-2">
             <button 
               disabled={page === 0} 
               onClick={() => setPage(p => p - 1)}
               className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
             >
               Previous
             </button>
             <button 
               disabled={(page + 1) * size >= totalElements} 
               onClick={() => setPage(p => p + 1)}
               className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
             >
               Next
             </button>
           </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Create Appointment</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select 
                    required 
                    className="w-full p-2 border rounded-lg"
                    value={newAppointment.patientId}
                    onChange={e => setNewAppointment({...newAppointment, patientId: e.target.value})}
                  >
                    <option value="">Select Patient</option>
                    {patients.map(p => (
                      <option key={p.uuid || p._id} value={p.uuid || p._id}>{p.name} ({p.phone})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <select 
                    required 
                    className="w-full p-2 border rounded-lg"
                    value={newAppointment.doctorId}
                    onChange={e => setNewAppointment({...newAppointment, doctorId: e.target.value})}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d.uuid || d._id} value={d.uuid || d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      required 
                      className="w-full p-2 border rounded-lg"
                      value={newAppointment.appointmentDate}
                      onChange={e => setNewAppointment({...newAppointment, appointmentDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input 
                      type="time" 
                      required 
                      step="1"
                      className="w-full p-2 border rounded-lg"
                      value={newAppointment.appointmentTime}
                      onChange={e => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                placeholder="Patient changed mind..."
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
              <p className="text-sm text-slate-600 mb-6">Are you sure you want to mark this appointment as completed? This action cannot be undone.</p>
              <div className="flex justify-end gap-3 mt-6">
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

export default AllAppointments;