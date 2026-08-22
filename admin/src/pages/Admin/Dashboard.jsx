import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, colorClass, subtitle, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}`}
  >
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 mr-4 flex-shrink-0`}>
      <img src={icon} alt="" className="w-8 h-8 opacity-80" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
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
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <PageContainer>
        <PageHeader title="Overview" subtitle="AIM Nature Cure Operations Dashboard" />
        <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Overview" subtitle="AIM Nature Cure Operations Dashboard" />

      {/* TOP KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`₹${data.totalRevenue.toLocaleString()}`} 
          icon={assets.earning_icon} 
          colorClass="bg-teal-500 text-teal-600"
          subtitle="Paid revenue to date"
          onClick={() => navigate('/admin/revenue')}
        />
        <StatCard 
          title="Pending Payments" 
          value={`₹${data.pendingPayments.toLocaleString()}`} 
          icon={assets.appointment_icon} 
          colorClass="bg-orange-500 text-orange-600"
          subtitle="Awaiting collection"
          onClick={() => navigate('/admin/invoices')}
        />
        <StatCard 
          title="Total Patients" 
          value={data.totalPatients} 
          icon={assets.patients_icon} 
          colorClass="bg-blue-500 text-blue-600"
          subtitle={`${data.newPatients} new in 30 days`}
          onClick={() => navigate('/patients')}
        />
        <StatCard 
          title="Pending Follow-Ups" 
          value={data.pendingFollowUps} 
          icon={assets.list_icon} 
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
              <div className="p-4 bg-gray-50 rounded-lg border text-center cursor-pointer hover:bg-primary hover:text-white transition-colors" onClick={() => navigate('/all-appointments')}>
                <p className="text-3xl font-bold mb-1">{data.todaysConsultations}</p>
                <p className="text-xs uppercase tracking-wide">Consultations</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border text-center cursor-pointer hover:bg-primary hover:text-white transition-colors" onClick={() => navigate('/admin/therapies')}>
                <p className="text-3xl font-bold mb-1">{data.todaysTherapies}</p>
                <p className="text-xs uppercase tracking-wide">Therapies</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border text-center cursor-pointer hover:bg-primary hover:text-white transition-colors" onClick={() => navigate('/admin/leads')}>
                <p className="text-3xl font-bold mb-1">{data.newLeadsCount}</p>
                <p className="text-xs uppercase tracking-wide">New Leads</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border text-center cursor-pointer hover:bg-primary hover:text-white transition-colors" onClick={() => navigate('/admin/social-review')}>
                <p className="text-3xl font-bold mb-1">{data.pendingSocial}</p>
                <p className="text-xs uppercase tracking-wide">Social Review</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border text-center cursor-pointer hover:bg-primary hover:text-white transition-colors" onClick={() => navigate('/admin/daily-reports')}>
                <p className="text-3xl font-bold mb-1">{data.pendingDailyReports}</p>
                <p className="text-xs uppercase tracking-wide">Pending Reports</p>
              </div>
            </div>
          </Card>
        </div>

        {/* TOP DOCTORS */}
        <Card title="Top Doctors">
          <div className="flex flex-col gap-4">
            {data.topDoctors.map((doc, idx) => (
              <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.patients} Assigned Patients</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-600">{doc.consultationCount}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Consultations</p>
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