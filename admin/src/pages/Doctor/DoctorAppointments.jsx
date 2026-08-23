import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { DoctorContext } from '../../context/DoctorContext';
import { appointmentService } from '../../services/appointmentService';
import DataTable from '../../components/common/DataTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DoctorAppointments = () => {
  const { slotDateFormat, currency, calculateAge } = useContext(AppContext);
  const { dToken } = useContext(DoctorContext);
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState(null);

  const loadData = async () => {
    try {
      const data = await appointmentService.getDoctorAppointments();
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (dToken) {
      loadData();
    }
  }, [dToken]);

  const handleStatusChange = async (item, status) => {
    try {
      await appointmentService.updateAppointmentStatus(item._id, status);
      toast.success(`Appointment marked as ${status}`);
      loadData();
      if (status === 'Completed') {
        if (window.confirm("Do you want to create a new consultation for this visit now?")) {
          // the mock uses userId to refer to patient
          navigate(`/patient/${item.userId}/new-consultation`);
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { label: '#', className: '' },
    { label: 'Patient', className: '' },
    { label: 'Date & Time', className: '' },
    { label: 'Fees', className: '' },
    { label: 'Action', className: '' },
  ];

  const renderRow = (item, index) => (
    <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_3fr_1fr_2fr] items-center text-slate-500 py-3 px-6 border-b border-slate-100 hover:bg-slate-50 transition-colors' key={index}>
      <p className='max-sm:hidden'>{index+1}</p>
      <div className='flex items-center gap-2'>
        <p className="font-medium text-slate-800">{item.userData?.name}</p>
      </div>
      <p>{item.slotDate?.replace(/_/g, '-')}, {item.slotTime}</p>
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
    <div key={item._id || index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
       <div className="flex justify-between items-start">
         <p className="font-semibold text-slate-800 text-lg">{item.userData?.name}</p>
         {item.cancelled ? (
          <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Cancelled</span>
        ) : item.isCompleted ? (
          <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Completed</span>
        ) : (
          <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">Upcoming</span>
        )}
       </div>
       <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Date & Time</p>
            <p className="font-medium">{item.slotDate?.replace(/_/g, '-')}, {item.slotTime}</p>
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
      <PageHeader title="Today's Appointments" subtitle="Manage your appointments for the day" />

      <DataTable 
        columns={columns}
        data={appointments}
        renderRow={renderRow}
        renderMobileCard={renderMobileCard}
        loading={appointments === null}
        emptyMessage="No appointments found today"
        gridColsClass="grid-cols-[0.5fr_3fr_3fr_1fr_2fr]"
      />
    </PageContainer>
  );
};

export default DoctorAppointments;