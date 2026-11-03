import { useState, useEffect, useCallback, useRef } from 'react';
import { patientService } from '../../services/patientService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search and Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const tableTopRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle filter change
  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(0); // Reset page on filter change
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientService.getPatients({
        search: debouncedSearch,
        page,
        size
      });
      if (data.success) {
        let fetchedPatients = data.patients || [];
        
        // Apply frontend filter if backend doesn't support status filtering out of the box
        if (statusFilter !== 'All') {
          fetchedPatients = fetchedPatients.filter(p => p.status === statusFilter);
        }

        setPatients(fetchedPatients);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalElements(data.pagination?.totalElements || fetchedPatients.length);
      } else {
        toast.error(data.message || 'Failed to fetch patients');
      }
    } catch (error) {
      toast.error('Error fetching patients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, size, statusFilter]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle page change and scroll smoothly to top
  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageContainer className="pb-16">
      <div ref={tableTopRef}>
        <PageHeader 
          title="Patient List" 
          subtitle="Manage registered patients"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={fetchPatients}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-60"
                title="Refresh patient list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button 
                onClick={() => navigate('/add-patient')} 
                className="bg-primary text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                Add New Patient
              </button>
            </div>
          }
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-slate-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-700 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed Treatment">Completed Treatment</option>
          </select>
        </div>

        {/* Page size dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Show:</span>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
              if (tableContainerRef.current) {
                tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-700 bg-white"
            title="Items per page"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-4">
        {/* Desktop & Tablet Table View with Scroll and Sticky Header */}
        <div 
          ref={tableContainerRef}
          className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[62vh] custom-scrollbar"
        >
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[120px]">Patient ID</th>
                <th className="py-3 px-4 min-w-[180px]">Patient Name</th>
                <th className="py-3 px-4 min-w-[160px]">Assigned Doctor</th>
                <th className="py-3 px-4 min-w-[160px]">Contact</th>
                <th className="py-3 px-4 min-w-[110px]">Status</th>
                <th className="py-3 px-4 text-right min-w-[110px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span className="font-medium">Loading patients...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    No patients found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                patients.map((item, index) => (
                  <tr 
                    key={item._id || item.patientId || index} 
                    className="hover:bg-slate-50/80 transition-colors text-slate-600"
                  >
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                      {page * size + index + 1}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md inline-block">
                        {item.patientId || item.idNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {item.doctorName || item.assignedDoctorName || item.assignedDoctor?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{item.phone || '—'}</div>
                      {item.email && <div className="text-xs text-slate-400">{item.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block ${
                        item.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => navigate(`/patient/${item.patientId || item.idNumber || item._id}`)}
                        className="text-primary hover:text-primary-dark font-medium hover:underline text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (sm:hidden) */}
        <div className="sm:hidden flex flex-col divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No patients found matching the selected criteria.
            </div>
          ) : (
            patients.map((item, index) => (
              <div key={item._id || item.patientId || index} className="p-4 bg-white flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-primary font-semibold">
                      #{item.patientId || item.idNumber || `P${(page * size + index + 1).toString().padStart(3,'0')}`}
                    </span>
                    <h4 className="font-semibold text-slate-800 text-base mt-0.5">{item.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {item.status || 'Active'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact</span>
                    <span className="font-medium text-slate-700">{item.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Doctor</span>
                    <span className="font-medium text-slate-700 truncate block">{item.doctorName || item.assignedDoctorName || item.assignedDoctor?.name || 'Unassigned'}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/patient/${item.patientId || item.idNumber || item._id}`)}
                  className="w-full mt-1 py-2 text-primary font-medium text-xs border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-colors text-center"
                >
                  View Patient Profile
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Pagination Controls */}
      {!loading && totalElements > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-5 py-3.5 border border-slate-200 rounded-xl shadow-sm gap-3">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{totalElements === 0 ? 0 : page * size + 1}</span> to <span className="font-semibold text-slate-700">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-semibold text-slate-700">{totalElements}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium inline-flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-700">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium inline-flex items-center gap-1 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default PatientList;
