import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { AdminContext } from '../../context/AdminContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import DataTable from '../../components/common/DataTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AllAppointments = () => {
  const { slotDateFormat, currency, calculateAge } = useContext(AppContext);
  const { doctors, getAllDoctors } = useContext(AdminContext);
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    docId: '',
    slotDate: '',
    slotTime: '10:00 am',
    amount: 50
  });

  const loadData = async () => {
    try {
      const data = await appointmentService.getAllAppointments();
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
      
      const patData = await patientService.getPatients();
      if (patData.success) {
        setPatients(patData.patients);
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
  }, []);

  const handleStatusChange = async (item, status) => {
    try {
      await appointmentService.updateAppointmentStatus(item._id, status);
      toast.success(`Appointment marked as ${status}`);
      loadData();
      if (status === 'Completed') {
        if (window.confirm("Do you want to create a new consultation for this visit now?")) {
          navigate(`/patient/${item.userId}/new-consultation`);
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Find patient and doc data for the mock payload to render correctly
      const p = patients.find(pat => pat._id === newAppointment.patientId);
      const d = doctors.find(doc => doc._id === newAppointment.docId);
      
      const payload = {
        ...newAppointment,
        userData: {
          name: p?.name || 'Unknown',
          image: '',
          dob: p?.dob || '1990-01-01'
        },
        docData: d || { name: 'Unknown Doctor', image: '' }
      };

      await appointmentService.createAppointment(payload);
      toast.success("Appointment created");
      setIsCreating(false);
      loadData();
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
    { label: 'Fees', className: '' },
    { label: 'Action', className: '' },
  ];

  const renderRow = (item, index) => (
    <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_3fr_3fr_1fr_2fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
      <p className='max-sm:hidden'>{index+1}</p>
      <div className='flex items-center gap-2'>
        <p className="font-medium text-gray-800">{item.userData?.name}</p>
      </div>
      <p>{item.slotDate?.replace(/_/g, '-')}, {item.slotTime}</p>
      <div className='flex items-center gap-2'>
        <p>{item.docData?.name}</p>
      </div>
      <p>{currency}{item.amount}</p>
      <div className="flex gap-2">
        {item.cancelled ? (
          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Cancelled</span>
        ) : item.isCompleted ? (
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Completed</span>
        ) : (
          <>
            <button onClick={() => handleStatusChange(item, 'Completed')} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors">Complete</button>
            <button onClick={() => handleStatusChange(item, 'Cancelled')} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors">Cancel</button>
          </>
        )}
      </div>
    </div>
  );
  
  const renderMobileCard = (item, index) => (
    <div key={item._id || index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
       <div className="flex justify-between items-start">
         <p className="font-semibold text-gray-800 text-lg">{item.userData?.name}</p>
         {item.cancelled ? (
          <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-red-100 text-red-700">Cancelled</span>
        ) : item.isCompleted ? (
          <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-green-100 text-green-700">Completed</span>
        ) : (
          <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-blue-100 text-blue-700">Upcoming</span>
        )}
       </div>
       <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div>
            <p className="text-xs text-gray-400">Date & Time</p>
            <p className="font-medium">{item.slotDate?.replace(/_/g, '-')}, {item.slotTime}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Doctor</p>
            <p className="font-medium">{item.docData?.name}</p>
          </div>
       </div>
       {!item.cancelled && !item.isCompleted && (
          <div className="flex gap-2 justify-end mt-2">
            <button onClick={() => handleStatusChange(item, 'Completed')} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium">Complete</button>
            <button onClick={() => handleStatusChange(item, 'Cancelled')} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium">Cancel</button>
          </div>
        )}
    </div>
  );

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

      <DataTable 
        columns={columns}
        data={appointments}
        renderRow={renderRow}
        renderMobileCard={renderMobileCard}
        loading={appointments === null}
        emptyMessage="No appointments found"
        gridColsClass="grid-cols-[0.5fr_3fr_3fr_3fr_1fr_2fr]"
      />

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Create Appointment</h3>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
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
                      <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <select 
                    required 
                    className="w-full p-2 border rounded-lg"
                    value={newAppointment.docId}
                    onChange={e => setNewAppointment({...newAppointment, docId: e.target.value})}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
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
                      value={newAppointment.slotDate}
                      onChange={e => setNewAppointment({...newAppointment, slotDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input 
                      type="time" 
                      required 
                      className="w-full p-2 border rounded-lg"
                      value={newAppointment.slotTime}
                      onChange={e => setNewAppointment({...newAppointment, slotTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
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
    </PageContainer>
  );
};

export default AllAppointments;