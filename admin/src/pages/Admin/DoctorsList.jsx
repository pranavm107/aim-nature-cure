import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

import { useTableFeatures } from '../../hooks/useTableFeatures';
import { Search } from 'lucide-react';

const DoctorsList = () => {
  const navigate = useNavigate();
  const { doctors, changeAvailability , aToken , getAllDoctors} = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
        getAllDoctors()
    }
}, [aToken])

  const {
    searchTerm, setSearchTerm,
    filters, handleFilterChange,
    sortConfig, handleSort,
    processedData
  } = useTableFeatures(doctors, ['name', 'speciality'], { key: 'name', direction: 'asc' });

  return (
    <PageContainer>
      <PageHeader title="All Doctors" subtitle="Manage hospital doctors" />
      
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search doctors by name or speciality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <select
            value={sortConfig?.key || 'name'}
            onChange={(e) => handleSort(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="name">Sort by Name</option>
            <option value="speciality">Sort by Speciality</option>
            <option value="experience">Sort by Experience</option>
          </select>
        </div>
      </div>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5'>
        {processedData.map((item, index) => (
          <div 
            onClick={() => navigate(`/admin/doctors/${item._id}`)}
            className='bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow flex flex-col' 
            key={item._id || index}
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
        
        {processedData.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No doctors found matching your criteria.
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default DoctorsList