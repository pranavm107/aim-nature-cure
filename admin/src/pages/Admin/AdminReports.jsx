import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { toast } from 'react-toastify';

// Simple CSS-based bar chart
const BarChart = ({ data, dataKey, labelKey, valuePrefix = '' }) => {
  if (!data || data.length === 0) return <div>No data available</div>;
  
  const maxVal = Math.max(...data.map(d => d[dataKey]));
  
  return (
    <div className="flex h-64 items-end gap-2 sm:gap-4 mt-6">
      {data.map((item, idx) => {
        const heightPct = maxVal > 0 ? (item[dataKey] / maxVal) * 100 : 0;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
            {/* Tooltip equivalent */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-gray-800 text-white px-2 py-1 rounded mb-2 whitespace-nowrap">
              {valuePrefix}{item[dataKey].toLocaleString()}
            </div>
            {/* Bar */}
            <div 
              className="w-full bg-teal-500 rounded-t-md hover:bg-teal-400 transition-colors" 
              style={{ height: `${Math.max(heightPct, 2)}%` }}
            ></div>
            {/* Label */}
            <div className="text-xs text-gray-500 mt-2 font-medium">{item[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
};

// Simple CSS-based horizontal progress bar for lead sources
const HorizontalBar = ({ label, value, maxVal }) => {
  const widthPct = maxVal > 0 ? (value / maxVal) * 100 : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 font-medium">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${widthPct}%` }}></div>
      </div>
    </div>
  );
};

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getDashboardData();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <PageContainer>
        <PageHeader title="Monthly Analytics" subtitle="Financial and operational analytics" />
        <div className="flex items-center justify-center h-64 text-gray-500">Loading analytics...</div>
      </PageContainer>
    );
  }

  const maxLeadValue = Math.max(...data.leadSources.map(l => l.value));

  return (
    <PageContainer>
      <PageHeader title="Monthly Analytics" subtitle="Financial and operational analytics" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Revenue Trend (Last 5 Months)">
          <BarChart data={data.revenueTrend} dataKey="revenue" labelKey="month" valuePrefix="₹" />
        </Card>
        
        <Card title="Lead Sources">
          <div className="pt-4">
            {data.leadSources.map((lead, idx) => (
              <HorizontalBar key={idx} label={lead.name} value={lead.value} maxVal={maxLeadValue} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <h3 className="text-gray-500 font-medium mb-2">Total Patients</h3>
          <p className="text-4xl font-bold text-gray-800">{data.totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <h3 className="text-gray-500 font-medium mb-2">Total Paid Revenue</h3>
          <p className="text-4xl font-bold text-teal-600">₹{data.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <h3 className="text-gray-500 font-medium mb-2">Pending Unpaid Balance</h3>
          <p className="text-4xl font-bold text-orange-500">₹{data.pendingPayments.toLocaleString()}</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminReports;
