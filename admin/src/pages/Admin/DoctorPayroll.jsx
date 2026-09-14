import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { payrollService } from '../../services/payrollService';
import { toast } from 'react-toastify';
import { Search, Filter, ArrowUpDown, Eye, Users, IndianRupee, RotateCw, Plus } from 'lucide-react';
import { useTableFeatures } from '../../hooks/useTableFeatures';
import { getStore } from '../../utils/mockStore';
import { useNavigate } from 'react-router-dom';

const DoctorPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [generating, setGenerating] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const doctors = useMemo(() => getStore('mockUsers').filter(u => u.role === 'Doctor' && u.status === 'Active'), []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getAllPayrolls();
      if (res.success) {
        setPayrolls(res.payrolls);
      } else {
        toast.error("Failed to load statements");
      }

      const sumRes = await payrollService.getPayrollSummary();
      if (sumRes.success) {
        setSummary(sumRes.summary);
      }
    } catch (err) {
      toast.error("Error loading payroll data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedMonth) {
      toast.error("Please select both doctor and month.");
      return;
    }
    setGenerating(true);
    try {
      const res = await payrollService.generateStatement(selectedDoctorId, selectedMonth);
      if (res.success) {
        toast.success("Statement generated successfully");
        setGenerateModalOpen(false);
        fetchData();
      } else {
        toast.error(res.message || "Failed to generate statement");
      }
    } catch (err) {
      toast.error("Error generating statement");
    } finally {
      setGenerating(false);
    }
  };

  const handleRecalculate = async (statementId) => {
    setRecalculating(true);
    try {
      const res = await payrollService.recalculateStatement(statementId);
      if (res.success) {
        toast.success("Statement recalculated successfully");
        fetchData();
      } else {
        toast.error(res.message || "Failed to recalculate statement");
      }
    } catch (err) {
      toast.error("Error recalculating statement");
    } finally {
      setRecalculating(false);
    }
  };

  const {
    searchTerm: searchQuery, 
    setSearchTerm: setSearchQuery,
    sortConfig, 
    handleSort,
    processedData: filteredAndSortedData,
    filters, 
    handleFilterChange
  } = useTableFeatures(
    payrolls, 
    ['doctorName', 'month', 'status'], 
    { key: 'month', direction: 'desc' }
  );

  const uniquePeriods = useMemo(() => [...new Set(payrolls.map(p => p.month))], [payrolls]);
  const uniqueStatuses = useMemo(() => [...new Set(payrolls.map(p => p.status))], [payrolls]);

  return (
    <PageContainer>
      <PageHeader 
        title="Doctor Payroll" 
        subtitle="Manage and calculate monthly salary and incentive earnings."
        action={
          <button 
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Generate Statement
          </button>
        }
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Doctors</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary?.totalDoctors || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Gross Earnings</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{summary?.totalSalary?.toLocaleString('en-IN') || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search doctors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={filters.month || ''}
                onChange={(e) => handleFilterChange('month', e.target.value)}
              >
                <option value="">All Periods</option>
                {uniquePeriods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('baseSalary')}>
                  <div className="flex items-center gap-1">Base Salary <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('totalIncentive')}>
                  <div className="flex items-center gap-1">Incentive <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('grossEarnings')}>
                  <div className="flex items-center gap-1">Gross Earnings <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">No payroll statements found.</td>
                </tr>
              ) : (
                filteredAndSortedData.map(record => (
                  <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{record.doctorName}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{record.month}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">₹{(record.baseSalary || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">₹{(record.totalIncentive || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-emerald-600">₹{(record.grossEarnings || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' 
                        : record.status === 'Approved' ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => navigate(`/admin/payroll/${record._id}`)}
                          className="text-slate-600 hover:text-primary transition-colors text-sm font-medium"
                        >
                          View
                        </button>
                        {record.status === 'Pending Review' && (
                          <>
                            <button 
                              onClick={() => handleRecalculate(record._id)}
                              disabled={recalculating}
                              className="text-amber-600 hover:text-amber-800 transition-colors text-sm font-medium bg-amber-50 px-2.5 py-1 rounded-md"
                            >
                              Recalculate
                            </button>
                            <button 
                              onClick={() => navigate(`/admin/payroll/${record._id}`)}
                              className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium bg-blue-50 px-2.5 py-1 rounded-md"
                            >
                              Review / Approve
                            </button>
                          </>
                        )}
                        {record.status === 'Approved' && (
                          <button 
                            onClick={() => navigate(`/admin/payroll/${record._id}`)}
                            className="text-emerald-600 hover:text-emerald-800 transition-colors text-sm font-medium bg-emerald-50 px-2.5 py-1 rounded-md"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {generateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Generate Statement</h3>
              <button onClick={() => setGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
                  <select
                    required
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">-- Select Doctor --</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Month & Year</label>
                  <input
                    type="month"
                    required
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <p className="text-xs text-slate-500 mt-1">Example: 2026-09 for September 2026</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setGenerateModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={generating} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm">
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Removed inline view modal, routing directly to detail page */}
    </PageContainer>
  );
};

export default DoctorPayroll;
