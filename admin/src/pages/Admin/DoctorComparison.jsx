import React, { useState, useEffect, useCallback } from 'react';
import { revenueService } from '../../services/revenueService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { toast } from 'react-toastify';
import { Trophy, Medal, RefreshCw, Calendar, IndianRupee, AlertCircle } from 'lucide-react';

const DoctorComparison = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await revenueService.getDoctorRevenueComparison(period);
      if (res.success) {
        setData(res.comparison || []);
      } else {
        toast.error(res.message || "Failed to load comparison data");
      }
    } catch (err) {
      console.error("Comparison load error:", err);
      toast.error("Failed to load comparison data");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' }
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Trophy className="w-3 h-3 text-amber-600" /> #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <Medal className="w-3 h-3 text-slate-500" /> #2
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-medium text-slate-500">
        #{rank}
      </span>
    );
  };

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <PageHeader 
          title="Doctor Revenue Comparison" 
          subtitle="Ranked performance based on actual collected revenue from paid invoices" 
        />
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* PERIOD TABS */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Period Filter:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {periodOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                period === opt.value
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* COMPARISON DATA */}
      <Card title="Ranked Revenue Collection">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading comparison data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No Doctor Revenue Found</p>
            <p className="text-xs mt-1 text-slate-400">There are no revenue records to compare for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold border-b">
                <tr>
                  <th className="py-3 px-6 w-20">Rank</th>
                  <th className="py-3 px-6">Doctor Name</th>
                  <th className="py-3 px-6 text-center">Completed Appointments</th>
                  <th className="py-3 px-6 text-right">Generated Revenue (Paid)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr 
                    key={item.doctorId || item.rank} 
                    className={`hover:bg-slate-50/70 transition-colors ${item.rank === 1 ? 'bg-amber-50/30' : ''}`}
                  >
                    <td className="py-4 px-6">
                      {getRankBadge(item.rank)}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {item.doctorName || 'Doctor'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {item.completedAppointments || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-600">
                      {formatINR(item.generatedRevenue || item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default DoctorComparison;
