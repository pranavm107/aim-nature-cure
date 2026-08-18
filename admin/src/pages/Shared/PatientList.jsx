import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import DataTable from '../../components/common/DataTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const data = query 
        ? await patientService.searchPatients(query) 
        : await patientService.getPatients();
      
      if (data.success) {
        setPatients(data.patients);
      } else {
        toast.error(data.message || 'Failed to fetch patients');
      }
    } catch (error) {
      toast.error('Error fetching patients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const columns = [
    { label: '#' },
    { label: 'Patient Name' },
    { label: 'Contact' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item, index) => (
    <div key={item._id} className="grid grid-cols-[0.5fr_2fr_2fr_1fr_1fr] sm:grid-cols-[0.5fr_2fr_2fr_1fr_1fr] grid-flow-col py-3 px-6 border-b hover:bg-gray-50 items-center">
      <p className="text-gray-500">{index + 1}</p>
      <div className="flex items-center gap-2">
        <p className="font-medium text-gray-800">{item.name}</p>
      </div>
      <div className="text-gray-500 text-sm">
        <p>{item.phone}</p>
        <p className="text-xs">{item.email}</p>
      </div>
      <p className="text-sm">
        <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
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
    <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 mb-1">#{item.patientId || `P${(index+1).toString().padStart(3,'0')}`}</p>
          <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {item.status || 'Active'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <div>
          <p className="text-xs text-gray-400">Contact</p>
          <p className="font-medium">{item.phone}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Doctor</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add New Patient
          </button>
        }
      />

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-gray-50 px-6 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 border border-gray-200 text-sm font-medium transition-colors flex-1 sm:flex-none">
              Search
            </button>
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); fetchPatients(); }}
                className="text-gray-500 px-4 py-2.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </form>
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
    </PageContainer>
  );
};

export default PatientList;
