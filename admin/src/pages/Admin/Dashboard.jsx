import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { revenueService } from '../../services/revenueService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { toast } from 'react-toastify';
import { IndianRupee, Clock, Users, Activity, TrendingUp, Calendar, RefreshCw, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle, onClick, loading }) => (
  <div 
    onClick={onClick}
    className={`flex items-center p-5 bg-white rounded-xl border border-slate-100 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}`}
  >
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 mr-4 flex-shrink-0`}>
      <Icon className="w-8 h-8 opacity-80" strokeWidth={2} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
      {loading ? (
        <div className="h-7 w-24 bg-slate-200 animate-pulse rounded my-1" />
      ) : (
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      )}
      {subtitle && <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState({
    allTime: 0,
    today: 0,
    week: 0,
    month: 0,
    pendingPayments: 0
  });
  const [revLoading, setRevLoading] = useState(true);
  const [revError, setRevError] = useState(false);
  const navigate = useNavigate();

  const loadRevenueData = useCallback(async () => {
    setRevLoading(true);
    setRevError(false);
    try {
      const summary = await revenueService.getOverallRevenueSummary();
      if (summary.success) {
        setRevenueSummary(summary);
      } else {
        setRevError(true);
      }
    } catch (err) {
      console.error("Dashboard revenue load error:", err);
      setRevError(true);
    } finally {
      setRevLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await analyticsService.getDashboardData();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    loadRevenueData();
  }, [fetchDashboard, loadRevenueData]);

  const handleRefresh = () => {
    fetchDashboard();
    loadRevenueData();
    toast.info("Refreshing revenue data...");
  };

  const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading || !data) {
    return (
      <PageContainer>
        <PageHeader title="Overview" subtitle="AIM Nature Cure Operations Dashboard" />
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <PageHeader title="Overview" subtitle="AIM Nature Cure Operations & Revenue Dashboard" />
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-center"
          title="Refresh dashboard data"
        >
          <RefreshCw className={`w-4 h-4 ${revLoading ? 'animate-spin text-primary' : 'text-slate-500'}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* CLINIC REVENUE COLLECTION METRICS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-800">Clinic Revenue Collection</h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button 
              onClick={() => navigate('/admin/revenue')}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Doctor Revenue Report <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => navigate('/admin/comparison')}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Doctor Comparison <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {revError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
            <p className="text-sm">Unable to load live revenue metrics from backend.</p>
            <button 
              onClick={loadRevenueData}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Today's Revenue" 
              value={formatINR(revenueSummary.today)} 
              icon={IndianRupee} 
              colorClass="bg-emerald-500 text-emerald-600"
              subtitle="GET /revenue/overall (today)"
              onClick={() => navigate('/admin/revenue')}
              loading={revLoading}
            />
            <StatCard 
              title="This Week's Revenue" 
              value={formatINR(revenueSummary.week)} 
              icon={Calendar} 
              colorClass="bg-blue-500 text-blue-600"
              subtitle="GET /revenue/overall (week)"
              onClick={() => navigate('/admin/revenue')}
              loading={revLoading}
            />
            <StatCard 
              title="This Month's Revenue" 
              value={formatINR(revenueSummary.month)} 
              icon={TrendingUp} 
              colorClass="bg-indigo-500 text-indigo-600"
              subtitle="GET /revenue/overall (month)"
              onClick={() => navigate('/admin/revenue')}
              loading={revLoading}
            />
            <StatCard 
              title="Overall Clinic Revenue" 
              value={formatINR(revenueSummary.allTime)} 
              icon={IndianRupee} 
              colorClass="bg-teal-500 text-teal-600"
              subtitle="All-time paid collection"
              onClick={() => navigate('/admin/revenue')}
              loading={revLoading}
            />
          </div>
        )}
      </div>

      {/* OPERATIONAL & CLINICAL KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard 
          title="Pending Payments" 
          value={`₹${(revenueSummary.pendingPayments || data.pendingPayments || 0).toLocaleString('en-IN')}`} 
          icon={Clock} 
          colorClass="bg-amber-500 text-amber-600"
          subtitle="Awaiting collection"
          onClick={() => navigate('/admin/invoices')}
        />
        <StatCard 
          title="Total Patients" 
          value={data.totalPatients} 
          icon={Users} 
          colorClass="bg-blue-500 text-blue-600"
          subtitle={`${data.newPatients || 0} new recently`}
          onClick={() => navigate('/patients')}
        />
        <StatCard 
          title="Pending Follow-Ups" 
          value={data.pendingFollowUps} 
          icon={Activity} 
          colorClass="bg-red-500 text-red-600"
          subtitle="Action required"
          onClick={() => navigate('/admin/follow-ups')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* OPERATIONAL SECTION */}
        <div className="lg:col-span-2">
          <Card title="Today's Operations">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:bg-primary hover:text-white transition-colors group" onClick={() => navigate('/all-appointments')}>
                <p className="text-3xl font-bold mb-1 text-slate-800 group-hover:text-white">{data.todaysConsultations}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 group-hover:text-white/90">Consultations</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:bg-primary hover:text-white transition-colors group" onClick={() => navigate('/admin/therapies')}>
                <p className="text-3xl font-bold mb-1 text-slate-800 group-hover:text-white">{data.todaysTherapies}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 group-hover:text-white/90">Therapies</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:bg-primary hover:text-white transition-colors group" onClick={() => navigate('/admin/leads')}>
                <p className="text-3xl font-bold mb-1 text-slate-800 group-hover:text-white">{data.newLeadsCount}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 group-hover:text-white/90">New Leads</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:bg-primary hover:text-white transition-colors group" onClick={() => navigate('/admin/social-review')}>
                <p className="text-3xl font-bold mb-1 text-slate-800 group-hover:text-white">{data.pendingSocial}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 group-hover:text-white/90">Social Review</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:bg-primary hover:text-white transition-colors group" onClick={() => navigate('/admin/daily-reports')}>
                <p className="text-3xl font-bold mb-1 text-slate-800 group-hover:text-white">{data.pendingDailyReports}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 group-hover:text-white/90">Pending Reports</p>
              </div>
            </div>
          </Card>
        </div>

        {/* TOP DOCTORS */}
        <Card title="Top Doctors">
          <div className="flex flex-col gap-4">
            {data.topDoctors.map((doc, idx) => (
              <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-800">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.patients} Assigned Patients</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{doc.consultationCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Consultations</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </PageContainer>
  );
};

export default Dashboard;