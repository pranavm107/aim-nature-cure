import React, { useState, useEffect } from 'react';
import { dailyReportService } from '../../services/dailyReportService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const AdminDailyReports = () => {
  const [dateAggregates, setDateAggregates] = useState([]);
  const [rawReports, setRawReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const navigate = useNavigate();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [reportsRes, docsRes] = await Promise.all([
        dailyReportService.getAdminReports(),
        adminService.getAllDoctors()
      ]);
      
      if (docsRes.success) setDoctors(docsRes.doctors);
      if (reportsRes.success) {
        setRawReports(reportsRes.reports);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rawReports, startDate, endDate, selectedDoctor]);

  const applyFilters = () => {
    let filtered = [...rawReports];

    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(r => r.date >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000; // include full end date
      filtered = filtered.filter(r => r.date < end);
    }
    if (selectedDoctor) {
      filtered = filtered.filter(r => r.docId === selectedDoctor);
    }

    const grouped = filtered.reduce((acc, report) => {
          const dateStr = new Date(report.date).toISOString().split('T')[0];
          if (!acc[dateStr]) {
            acc[dateStr] = {
              dateStr,
              dateObj: new Date(report.date),
              totalDoctors: 0,
              totalPatients: 0,
              totalConsultations: 0,
              totalTherapies: 0,
              allReviewed: true
            };
          }
          acc[dateStr].totalDoctors += 1;
          acc[dateStr].totalPatients += (report.patientCount || report.patientsSeen || 0);
          acc[dateStr].totalConsultations += (report.consultations || report.consultationsCompleted || 0);
          acc[dateStr].totalTherapies += (report.therapySessions || 0);
          if (report.status !== 'Reviewed') {
            acc[dateStr].allReviewed = false;
          }
          return acc;
        }, {});

      const aggregatedList = Object.values(grouped).sort((a, b) => b.dateObj - a.dateObj);
      setDateAggregates(aggregatedList);
  };

  const columns = [
    { label: 'Date' },
    { label: 'Doctors Submitted' },
    { label: 'Total Patients' },
    { label: 'Total Consultations' },
    { label: 'Total Therapies' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item) => (
    <div key={item.dateStr} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/admin/daily-reports/${item.dateStr}`)}>
      <p className="font-medium text-slate-800">{item.dateObj.toLocaleDateString()}</p>
      <p>{item.totalDoctors}</p>
      <p>{item.totalPatients}</p>
      <p>{item.totalConsultations}</p>
      <p>{item.totalTherapies}</p>
      <div>
        {item.allReviewed ? <Badge variant="success">Reviewed</Badge> : <Badge variant="warning">Pending Review</Badge>}
      </div>
      <div className="text-right">
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/daily-reports/${item.dateStr}`); }}
          className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Daily Reports" subtitle="Aggregate daily performance and review end-of-day reports" />
      
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">From Date</label>
          <input 
            type="date" 
            className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">To Date</label>
          <input 
            type="date" 
            className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-xs font-medium text-slate-500">Filter by Doctor</label>
          <select 
            className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
            value={selectedDoctor}
            onChange={e => setSelectedDoctor(e.target.value)}
          >
            <option value="">All Doctors</option>
            {doctors.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => { setStartDate(''); setEndDate(''); setSelectedDoctor(''); }}
          className="text-sm text-slate-500 hover:text-slate-800 font-medium px-2 py-2"
        >
          Clear Filters
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={dateAggregates} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No reports found."
        gridColsClass="grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr]" 
      />
    </PageContainer>
  );
};

export default AdminDailyReports;
