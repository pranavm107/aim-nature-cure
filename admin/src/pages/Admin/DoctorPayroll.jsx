import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { payrollService } from '../../services/payrollService';
import { toast } from 'react-toastify';
import { Search, Filter, ArrowUpDown, Eye, Users, IndianRupee, RotateCw, Plus } from 'lucide-react';
import { useTableFeatures } from '../../hooks/useTableFeatures';
import { getStore } from '../../utils/mockStore';

const DoctorPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [generating, setGenerating] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const doctors = useMemo(() => getStore('mockUsers').filter(u => u.role === 'Doctor'), []);

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

  const handleView = (payroll) => {
    setSelectedPayroll(payroll);
    setViewModalOpen(true);
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
                      <div className="flex justify-end gap-2">
                        {record.status === 'Pending Review' && (
                          <button 
                            onClick={() => handleRecalculate(record._id)}
                            disabled={recalculating}
                            className="text-amber-500 hover:text-amber-700 transition-colors p-1"
                            title="Recalculate Statement"
                          >
                            <RotateCw className={`w-5 h-5 ${recalculating ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleView(record)}
                          className="text-slate-400 hover:text-primary transition-colors p-1"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
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

      {/* View Modal */}
      {viewModalOpen && selectedPayroll && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-semibold text-slate-800">Monthly Statement Breakdown</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Doctor Name</p>
                  <p className="text-base text-slate-800 font-semibold">{selectedPayroll.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Payroll Period</p>
                  <p className="text-base text-slate-800 font-semibold">{selectedPayroll.month}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedPayroll.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' 
                    : selectedPayroll.status === 'Approved' ? 'bg-blue-50 text-blue-700'
                    : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedPayroll.status}
                  </span>
                </div>
              </div>

              {/* Base Salary */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-3">Base Salary</h4>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <span className="text-slate-600 font-medium">Monthly Salary</span>
                  <span className="text-slate-800 font-semibold">₹{(selectedPayroll.baseSalary || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Revenue Incentive */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-3">Revenue Incentive</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Consultation (₹{(selectedPayroll.revenueIncentive?.consultationRevenue || 0).toLocaleString('en-IN')} @ {selectedPayroll.revenueIncentive?.consultationPercentage || 0}%)</span>
                    <span className="text-slate-800 font-medium">₹{(selectedPayroll.revenueIncentive?.consultationIncentive || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Treatment (₹{(selectedPayroll.revenueIncentive?.treatmentRevenue || 0).toLocaleString('en-IN')} @ {selectedPayroll.revenueIncentive?.treatmentPercentage || 0}%)</span>
                    <span className="text-slate-800 font-medium">₹{(selectedPayroll.revenueIncentive?.treatmentIncentive || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Package (₹{(selectedPayroll.revenueIncentive?.packageRevenue || 0).toLocaleString('en-IN')} @ {selectedPayroll.revenueIncentive?.packagePercentage || 0}%)</span>
                    <span className="text-slate-800 font-medium">₹{(selectedPayroll.revenueIncentive?.packageIncentive || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg mt-2">
                    <span className="text-blue-800 font-semibold">Total Revenue Incentive</span>
                    <span className="text-blue-800 font-bold">₹{(selectedPayroll.revenueIncentive?.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Activity Incentive */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-3">Activity Incentive</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Follow-ups ({selectedPayroll.activityIncentive?.approvedFollowUps || 0} @ ₹{selectedPayroll.activityIncentive?.followUpAmount || 0})</span>
                    <span className="text-slate-800 font-medium">₹{(selectedPayroll.activityIncentive?.followUpIncentive || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Social Media ({selectedPayroll.activityIncentive?.approvedSocialMedia || 0} @ ₹{selectedPayroll.activityIncentive?.socialMediaAmount || 0})</span>
                    <span className="text-slate-800 font-medium">₹{(selectedPayroll.activityIncentive?.socialMediaIncentive || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg mt-2">
                    <span className="text-purple-800 font-semibold">Total Activity Incentive</span>
                    <span className="text-purple-800 font-bold">₹{(selectedPayroll.activityIncentive?.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Gross Earnings */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-3">Gross Earnings</h4>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-600">Base Salary</span>
                  <span className="text-slate-800 font-medium">₹{(selectedPayroll.baseSalary || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-600">Total Incentive</span>
                  <span className="text-slate-800 font-medium">₹{(selectedPayroll.totalIncentive || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-lg mt-3 border border-emerald-100">
                  <span className="text-emerald-800 font-bold text-lg">Gross Earnings</span>
                  <span className="text-emerald-800 font-bold text-xl">₹{(selectedPayroll.grossEarnings || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setViewModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default DoctorPayroll;
