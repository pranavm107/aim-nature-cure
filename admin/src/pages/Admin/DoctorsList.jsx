import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const DoctorsList = () => {
  const navigate = useNavigate();
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext);

  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  const [sortKey, setSortKey] = useState('name');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDoctors = useCallback(async () => {
    if (aToken) {
      setLoading(true);
      const data = await getAllDoctors({ search: debouncedSearch, page, size });
      if (data && data.success) {
        setTotalPages(data.pagination.totalPages);
        setTotalElements(data.pagination.totalElements);
      }
      setLoading(false);
    }
  }, [aToken, debouncedSearch, page, size, getAllDoctors]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleAvailabilityChange = async (e, docId) => {
    e.stopPropagation();
    const checked = e.target.checked;
    await changeAvailability(docId, checked);
    fetchDoctors();
  };

  const sortedDoctors = [...(doctors || [])].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-slate-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="name">Sort by Name</option>
            <option value="speciality">Sort by Speciality</option>
            <option value="experience">Sort by Experience</option>
          </select>
        </div>
      </div>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5'>
        {sortedDoctors.map((item, index) => (
          <div 
            onClick={() => navigate(`/admin/doctors/${item._id}`)}
            className='bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow flex flex-col' 
            key={item._id || index}
          >
            <img className='bg-slate-50 group-hover:bg-primary transition-all duration-500 w-full object-cover' style={{height: "200px"}} src={item.image || "https://placehold.co/400x400?text=No+Photo"} alt={item.name} />
            <div className='p-4'>
              <p className='text-slate-800 text-lg font-semibold'>{item.name}</p>
              <p className='text-slate-500 text-sm mb-2'>{item.speciality}</p>
              <div className='flex items-center gap-2 text-sm text-slate-600' onClick={(e) => e.stopPropagation()}>
                <input 
                  onChange={(e) => handleAvailabilityChange(e, item._id)} 
                  type="checkbox" 
                  checked={item.available || false} 
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <p>Available</p>
              </div>
            </div>
          </div>
        ))}
        
        {!loading && sortedDoctors.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No doctors found matching your criteria.
          </div>
        )}
      </div>
      
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center bg-white px-4 py-3 border border-slate-200 rounded-xl mt-6 shadow-sm">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium">{totalElements === 0 ? 0 : page * size + 1}</span> to <span className="font-medium">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-medium">{totalElements}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-slate-700">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default DoctorsList
