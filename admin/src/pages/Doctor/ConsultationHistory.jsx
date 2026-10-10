import React, { useState, useEffect, useCallback, useContext } from 'react';
import { consultationService } from '../../services/consultationService';
import { patientService } from '../../services/patientService';
import { adminService } from '../../services/adminService';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const ConsultationHistory = () => {
  const { profileData } = useContext(DoctorContext);
  const { token } = useContext(AppContext);
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const pRes = await patientService.getPatients({ size: 1000 });
        if (pRes.success) setPatients(pRes.patients);

        const dRes = await adminService.getDoctorsDropdown();
        if (dRes.success) setDoctors(dRes.doctors);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };
    fetchDropdowns();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        size: pageSize
      };
      if (search) filters.search = search;
      if (selectedPatientId) filters.patientId = selectedPatientId;
      if (selectedDoctorId) filters.doctorId = selectedDoctorId;

      const data = await consultationService.getConsultations(filters);
      
      let items = [];
      let total = 0;
      
      if (data.content) {
        items = data.content;
        total = data.totalElements;
      } else if (data.consultations) {
        items = data.consultations;
        total = data.totalElements || data.consultations.length;
      } else if (data.result) {
        items = data.result.content || data.result;
        total = data.result.totalElements || data.result.length || 0;
      } else if (Array.isArray(data)) {
        items = data;
        total = data.length;
      }

      setHistory(items);
      setTotalElements(total);
    } catch (err) {
      toast.error("Failed to load consultation history");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedPatientId, selectedDoctorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };
  const handlePatientChange = (e) => {
    setSelectedPatientId(e.target.value);
    setPage(0);
  };
  const handleDoctorChange = (e) => {
    setSelectedDoctorId(e.target.value);
    setPage(0);
  };
  
  const handleView = async (id) => {
    setViewModalOpen(true);
    setViewLoading(true);
    try {
        const res = await consultationService.getConsultationById(id);
        const data = res.result || res.consultation || res;
        setViewData(data);
    } catch(err) {
        toast.error("Failed to fetch consultation details");
        setViewModalOpen(false);
    } finally {
        setViewLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this consultation?")) return;
    try {
      const res = await consultationService.deleteConsultation(id);
      if (res && res.success !== false) {
        toast.success("Consultation deleted successfully");
        loadData();
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting consultation");
    }
  };

  const columns = [
    { label: 'Date' },
    { label: 'Patient Name' },
    { label: 'Doctor' },
    { label: 'Chief Complaint' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item, index) => (
    <div key={item.uuid || item.id || item._id || index} className="grid grid-cols-[1fr_1.5fr_1.5fr_2fr_1fr_1.5fr] py-3 px-6 border-b border-slate-100 items-center text-sm hover:bg-slate-50 transition-colors">
      <p className="text-slate-600">{new Date(item.createdDate || item.date || new Date()).toLocaleDateString()}</p>
      <p className="font-semibold text-slate-800 truncate">{item.patient?.name || item.patientName || 'Unknown'}</p>
      <p className="text-slate-600 truncate">{item.doctor?.name || item.doctorName || 'Unknown'}</p>
      <p className="text-slate-600 truncate pr-4">{item.chiefComplaint}</p>
      <p className="text-slate-600 truncate">
          <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${item.status === 'Locked' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {item.status || 'Active'}
          </span>
      </p>
      <div className="flex justify-end gap-2 text-right">
        <button 
          onClick={() => handleView(item.uuid || item.id || item._id)}
          className="text-xs font-medium bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 hover:text-primary transition-colors"
        >
          View
        </button>
        <button 
          onClick={() => handleDelete(item.uuid || item.id || item._id)}
          className="text-xs font-medium bg-white text-red-700 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Consultation History" subtitle="Review all past consultations">
         <button 
           onClick={() => navigate('/doctor/consultation')}
           className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
         >
           + New Consultation
         </button>
      </PageHeader>
      
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-wrap gap-4 items-center">
         <input 
            type="text" 
            placeholder="Search complaints, diagnosis..." 
            value={search}
            onChange={handleSearchChange}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
         />
         <select 
            value={selectedPatientId} 
            onChange={handlePatientChange}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
         >
            <option value="">All Patients</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
         </select>
         <select 
            value={selectedDoctorId} 
            onChange={handleDoctorChange}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
         >
            <option value="">All Doctors</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
         </select>
      </div>

      <DataTable 
        columns={columns} 
        data={history} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No consultations found."
        gridColsClass="grid-cols-[1fr_1.5fr_1.5fr_2fr_1fr_1.5fr]" 
      />

      <div className="flex justify-between items-center mt-4 text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-medium">Rows per page:</span>
          <div className="relative">
            <select 
              className="appearance-none border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium cursor-pointer transition-all hover:border-slate-400"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-slate-500 font-medium">
            {totalElements === 0 ? '0-0 of 0' : `${page * pageSize + 1}-${Math.min((page + 1) * pageSize, totalElements)} of ${totalElements}`}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={(page + 1) * pageSize >= totalElements} 
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Consultation Details</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {viewLoading ? (
                  <p className="text-center text-slate-500 py-10">Loading details...</p>
              ) : viewData ? (
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div>
                              <p className="text-xs text-slate-500 font-medium">Patient</p>
                              <p className="font-semibold text-slate-800">{viewData.patient?.name || viewData.patientName || 'N/A'}</p>
                          </div>
                          <div>
                              <p className="text-xs text-slate-500 font-medium">Doctor</p>
                              <p className="font-semibold text-slate-800">{viewData.doctor?.name || viewData.doctorName || 'N/A'}</p>
                          </div>
                          <div>
                              <p className="text-xs text-slate-500 font-medium">Status</p>
                              <p className="font-semibold text-slate-800">{viewData.status || 'Active'}</p>
                          </div>
                          <div>
                              <p className="text-xs text-slate-500 font-medium">Priority</p>
                              <p className="font-semibold text-slate-800">{viewData.priority || 'Normal'}</p>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-sm font-semibold text-slate-800 mb-2 border-b pb-1">Clinical Information</h4>
                          <div className="space-y-3">
                              <div>
                                  <p className="text-xs text-slate-500 font-medium">Chief Complaint</p>
                                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 min-h-[40px]">{viewData.chiefComplaint || 'N/A'}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 font-medium">History of Present Illness (HPI)</p>
                                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 min-h-[40px]">{viewData.hpi || 'N/A'}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 font-medium">Observations</p>
                                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 min-h-[40px]">{viewData.observations || 'N/A'}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 font-medium">Diagnosis</p>
                                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 min-h-[40px]">{viewData.diagnosis || 'N/A'}</p>
                              </div>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-sm font-semibold text-slate-800 mb-2 border-b pb-1">Treatment</h4>
                          <div>
                              <p className="text-xs text-slate-500 font-medium">Treatment Plan</p>
                              <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 min-h-[40px] whitespace-pre-line">{viewData.treatmentPlan || 'N/A'}</p>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-sm font-semibold text-slate-800 mb-2 border-b pb-1">Follow-Up</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <p className="text-xs text-slate-500 font-medium">Follow-Up Needed</p>
                                  <p className="text-sm text-slate-700">{viewData.followUpNeeded ? 'Yes' : 'No'}</p>
                              </div>
                              {viewData.followUpNeeded && (
                                  <>
                                      <div>
                                          <p className="text-xs text-slate-500 font-medium">Follow-Up Date</p>
                                          <p className="text-sm text-slate-700">{viewData.followUpDate ? new Date(viewData.followUpDate).toLocaleDateString() : 'N/A'}</p>
                                      </div>
                                      <div>
                                          <p className="text-xs text-slate-500 font-medium">Follow-Up Type</p>
                                          <p className="text-sm text-slate-700">{viewData.followUpType || 'N/A'}</p>
                                      </div>
                                      <div className="col-span-2">
                                          <p className="text-xs text-slate-500 font-medium">Follow-Up Notes</p>
                                          <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 min-h-[40px]">{viewData.followUpNotes || 'N/A'}</p>
                                      </div>
                                  </>
                              )}
                          </div>
                      </div>
                  </div>
              ) : (
                  <p className="text-center text-slate-500 py-10">Failed to load consultation details.</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                <button type="button" onClick={() => setViewModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  );
};

export default ConsultationHistory;
