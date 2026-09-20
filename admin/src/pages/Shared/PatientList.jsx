import React, { useState, useEffect, useCallback } from 'react';
import { patientService } from '../../services/patientService';
import DataTable from '../../components/common/DataTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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
        let fetchedPatients = data.patients;
        
        // Apply frontend filter if backend doesn't support status filtering out of the box
        // (Since the instruction only mentioned search, page, size query parameters)
        if (statusFilter !== 'All') {
          fetchedPatients = fetchedPatients.filter(p => p.status === statusFilter);
        }

        setPatients(fetchedPatients);
        setTotalPages(data.pagination.totalPages);
        setTotalElements(data.pagination.totalElements);
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

  const columns = [
    { label: '#' },
    { label: 'Patient Name' },
    { label: 'Contact' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item, index) => (
    <div key={item._id} className="grid grid-cols-[0.5fr_2fr_2fr_1fr_1fr] sm:grid-cols-[0.5fr_2fr_2fr_1fr_1fr] grid-flow-col py-3 px-6 border-b border-slate-100 hover:bg-slate-50 items-center transition-colors">
      <p className="text-slate-500">{page * size + index + 1}</p>
      <div className="flex items-center gap-2">
        <p className="font-medium text-slate-800">{item.name}</p>
      </div>
      <div className="text-slate-500 text-sm">
        <p>{item.phone}</p>
        <p className="text-xs">{item.email}</p>
      </div>
      <p className="text-sm">
        <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
          {item.status || 'Active'}
        </span>
      </p>
      <div className="text-right">
        <button 
          onClick={() => navigate(`/patient/${item._id}`)}
          className="text-primary hover:underline text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );

  const renderMobileCard = (item, index) => (
    <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-400 mb-1">#{item.patientId || `P${(page * size + index + 1).toString().padStart(3,'0')}`}</p>
          <p className="font-semibold text-slate-800 text-lg">{item.name}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
          {item.status || 'Active'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
        <div>
          <p className="text-xs text-slate-400">Contact</p>
          <p className="font-medium">{item.phone}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Doctor</p>
          <p className="font-medium">{item.assignedDoctor?.name || 'Unassigned'}</p>
        </div>
      </div>
      
      <button 
        onClick={() => navigate(`/patient/${item._id}`)}
        className="w-full mt-1 py-2 text-primary font-medium text-sm border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-colors"
      >
        View Patient Profile
      </button>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Patient List" 
        subtitle="Manage registered patients"
        actions={
          <button 
            onClick={() => navigate('/add-patient')} 
            className="bg-primary text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add New Patient
          </button>
        }
      />

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed Treatment">Completed Treatment</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        loading={loading}
        renderRow={renderRow}
        renderMobileCard={renderMobileCard}
        emptyMessage="No patients found."
        gridColsClass="grid-cols-[0.5fr_2fr_2fr_1fr_1fr]"
      />
      
      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center bg-white px-4 py-3 border border-slate-200 rounded-xl mt-4 shadow-sm">
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
  );
};

export default PatientList;
