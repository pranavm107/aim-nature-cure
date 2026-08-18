import React, { useEffect } from 'react';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  const columns = [
    { label: '#', className: '' },
    { label: 'Patient', className: '' },
    { label: 'Age', className: '' },
    { label: 'Date & Time', className: '' },
    { label: 'Doctor', className: '' },
    { label: 'Fees', className: '' },
    { label: 'Action', className: '' },
  ];

  const renderRow = (item, index) => (
    <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
      <p className='max-sm:hidden'>{index+1}</p>
      <div className='flex items-center gap-2'>
        <img src={item.userData.image} className='w-8 h-8 rounded-full object-cover' alt="" /> <p>{item.userData.name}</p>
      </div>
      <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
      <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
      <div className='flex items-center gap-2'>
        <img src={item.docData.image} className='w-8 h-8 rounded-full bg-gray-200 object-cover' alt="" /> <p>{item.docData.name}</p>
      </div>
      <p>{currency}{item.amount}</p>
      {item.cancelled ? (
        <p className='text-red-400 text-xs font-medium'>Cancelled</p>
      ) : item.isCompleted ? (
        <p className='text-green-500 text-xs font-medium'>Completed</p>
      ) : (
        <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="Cancel" />
      )}
    </div>
  );
  const renderMobileCard = (item, index) => (
    <div key={item._id || index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <img src={item.userData.image} className="w-10 h-10 rounded-full object-cover" alt="" />
          <div>
            <p className="font-semibold text-gray-800 text-lg">{item.userData.name}</p>
            <p className="text-xs text-gray-400">Age: {calculateAge(item.userData.dob)}</p>
          </div>
        </div>
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
          <p className="font-medium">{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Doctor</p>
          <div className="flex items-center gap-1 mt-0.5">
            <img src={item.docData.image} className="w-5 h-5 rounded-full object-cover bg-gray-200" alt="" />
            <p className="font-medium truncate">{item.docData.name}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-1 pt-3 border-t border-gray-100">
        <p className="font-medium text-gray-800">Fees: {currency}{item.amount}</p>
        {!item.cancelled && !item.isCompleted && (
          <button 
            onClick={() => cancelAppointment(item._id)}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            <img src={assets.cancel_icon} className="w-4 h-4" alt="" /> Cancel
          </button>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Legacy Appointments" subtitle="View all appointments across the system" />
      <DataTable 
        columns={columns}
        data={appointments}
        renderRow={renderRow}
        renderMobileCard={renderMobileCard}
        loading={!appointments}
        emptyMessage="No appointments found"
        gridColsClass="grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr]"
      />
    </PageContainer>
  )
}

export default AllAppointments