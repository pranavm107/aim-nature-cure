import React, { useState, useEffect, useCallback } from 'react';
import { revenueService } from '../../services/revenueService';
import { adminService } from '../../services/adminService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { toast } from 'react-toastify';
import { SelectField } from '../../components/common/FormFields';
import { IndianRupee, Users, CheckCircle2, AlertCircle, RefreshCw, Filter, Calendar } from 'lucide-react';

const DoctorRevenue = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('ALL');
  const [revenueData, setRevenueData] = useState(null);
  const [allDocsData, setAllDocsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');

  // Load doctors for dropdown
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await adminService.getAllDoctors();
        if (res.success && Array.isArray(res.doctors)) {
          setDoctors(res.doctors);
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };
    fetchDocs();
  }, []);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedDoc === 'ALL') {
        const res = await revenueService.getAllDoctorsRevenue(period);
        if (res.success) {
          setAllDocsData(res);
          setRevenueData(null);
        } else {
          toast.error(res.message || "Failed to load all doctors revenue");
        }
      } else {
        const res = await revenueService.getDoctorRevenue(selectedDoc, period);
        if (res.success) {
          setRevenueData(res);
          setAllDocsData(null);
        } else {
          toast.error(res.message || "Failed to load doctor revenue");
        }
      }
    } catch (err) {
      console.error("Error fetching doctor revenue:", err);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, [selectedDoc, period]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const periodLabel = {
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month'
  }[period] || period;

  const selectedDoctorObj = doctors.find(d => (d.uuid === selectedDoc || d._id === selectedDoc));

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <PageHeader 
          title="Doctor Revenue Report" 
          subtitle="Real-time collection reports generated from paid invoices and completed appointments" 
        />
        <button
          onClick={fetchRevenue}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
        <SelectField 
          label="Doctor Selection" 
          value={selectedDoc} 
          onChange={(e) => setSelectedDoc(e.target.value)} 
          options={[
            { label: 'All Doctors (Combined Report)', value: 'ALL' },
            ...doctors.map(d => ({ label: d.name, value: d.uuid || d._id }))
          ]} 
        />
        <SelectField 
          label="Time Period" 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)} 
          options={[
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'this_week' },
            { label: 'This Month', value: 'this_month' }
          ]} 
        />
        <div className="text-xs text-slate-500 pb-2">
          <span>Active Filter: </span>
          <span className="font-semibold text-slate-700">
            {selectedDoc === 'ALL' ? 'All Doctors' : (selectedDoctorObj?.name || 'Selected Doctor')} • {periodLabel}
          </span>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading revenue data...</p>
        </div>
      ) : selectedDoc === 'ALL' && allDocsData ? (
        <div className="space-y-6">
          {/* ALL DOCTORS SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 text-white rounded-lg">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Combined Revenue ({periodLabel})</p>
                  <p className="text-2xl font-bold text-slate-800">{formatINR(allDocsData.totalRevenue)}</p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Doctors Reporting</p>
                  <p className="text-2xl font-bold text-slate-800">{allDocsData.doctors.length}</p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed Appointments</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {allDocsData.doctors.reduce((sum, d) => sum + (d.completedAppointments || 0), 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* DOCTOR BREAKDOWN TABLE */}
          <Card title={`Doctor Breakdown (${periodLabel})`}>
            {allDocsData.doctors.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No doctor revenue records available for this period.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold border-b">
                    <tr>
                      <th className="py-3 px-4">Doctor Name</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4 text-center">Completed Appointments</th>
                      <th className="py-3 px-4 text-right">Revenue (Paid)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allDocsData.doctors.map((doc, idx) => (
                      <tr key={doc.doctorId || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {doc.doctorName || 'Doctor'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 capitalize">{doc.period || period}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                            {doc.completedAppointments || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          {formatINR(doc.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : revenueData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                  {periodLabel}
                </span>
                <span className="text-xs text-slate-400">
                  Doctor ID: {revenueData.doctorId ? `${revenueData.doctorId.slice(0, 8)}...` : 'N/A'}
                </span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Doctor Name</h3>
              <p className="text-xl font-bold text-slate-800 mb-4">{revenueData.doctorName || selectedDoctorObj?.name || 'Doctor'}</p>
              
              <h3 className="text-slate-500 text-xs uppercase font-medium tracking-wide">Paid Revenue Collection</h3>
              <p className="text-4xl font-extrabold text-slate-800 my-1">{formatINR(revenueData.revenue)}</p>

              {revenueData.attributionNote && (
                <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200/60 italic">
                  ℹ️ {revenueData.attributionNote}
                </p>
              )}
            </Card>

            <Card title="Activity Summary">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Completed Consultations / Appointments</span>
                  <span className="text-lg font-bold text-slate-800">{revenueData.completedAppointments}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Selected Period</span>
                  <span className="text-sm font-semibold text-slate-800 capitalize">{revenueData.period}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Average Revenue / Completed Visit</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {revenueData.completedAppointments > 0 
                      ? formatINR(revenueData.revenue / revenueData.completedAppointments) 
                      : '₹0.00'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No Revenue Data</p>
          <p className="text-sm mt-1 text-slate-400">No revenue records found for this doctor in {periodLabel}.</p>
        </div>
      )}
    </PageContainer>
  );
};

export default DoctorRevenue;
