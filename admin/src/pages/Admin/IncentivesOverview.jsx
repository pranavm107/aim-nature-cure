import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { incentiveService } from '../../services/incentiveService';
import { toast } from 'react-toastify';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useTableFeatures } from '../../hooks/useTableFeatures';

const IncentivesOverview = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await incentiveService.getAllIncentiveEarnings();
      if (res.success) {
        setEarnings(res.earnings);
      } else {
        toast.error("Failed to load incentive earnings");
      }
    } catch (err) {
      toast.error("Error loading incentive earnings");
    } finally {
      setLoading(false);
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
    earnings, 
    ['doctorName', 'period', 'status'], 
    { key: 'period', direction: 'desc' }
  );

  const uniquePeriods = useMemo(() => [...new Set(earnings.map(e => e.period))], [earnings]);

  return (
    <PageContainer>
      <PageHeader title="Incentives Overview" subtitle="View all doctor incentive earnings" />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search doctors, period..." 
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
                value={filters.period || ''}
                onChange={(e) => handleFilterChange('period', e.target.value)}
              >
                <option value="">All Periods</option>
                {uniquePeriods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('revenue')}>
                  <div className="flex items-center gap-1">Revenue <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Incentive %
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('incentiveAmount')}>
                  <div className="flex items-center gap-1">Incentive Amount <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No incentive earnings found.</td>
                </tr>
              ) : (
                filteredAndSortedData.map(record => (
                  <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{record.doctorName}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{record.period}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">₹{record.revenue.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{record.incentivePercentage}%</td>
                    <td className="py-3 px-4 text-sm font-medium text-primary">₹{record.incentiveAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Calculated' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredAndSortedData.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-500 text-right">
            Showing {filteredAndSortedData.length} records
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default IncentivesOverview;
