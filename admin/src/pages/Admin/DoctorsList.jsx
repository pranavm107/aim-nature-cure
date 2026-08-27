import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

const DoctorsList = () => {
  const navigate = useNavigate();
  const { doctors, changeAvailability , aToken , getAllDoctors} = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
        getAllDoctors()
    }
}, [aToken])

  return (
    <PageContainer>
      <PageHeader title="All Doctors" subtitle="Manage hospital doctors" />
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5'>
        {doctors.map((item, index) => (
          <div 
            onClick={() => navigate(`/admin/doctors/${item._id}`)}
            className='bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow flex flex-col' 
            key={index}
          >
            <img className='bg-slate-50 group-hover:bg-primary transition-all duration-500' src={item.image} alt="" />
            <div className='p-4'>
              <p className='text-slate-800 text-lg font-semibold'>{item.name}</p>
              <p className='text-slate-500 text-sm mb-2'>{item.speciality}</p>
              <div className='flex items-center gap-2 text-sm text-slate-600' onClick={(e) => e.stopPropagation()}>
                <input 
                  onChange={(e)=> { changeAvailability(item._id); }} 
                  type="checkbox" 
                  checked={item.available} 
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <p>Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}

export default DoctorsList