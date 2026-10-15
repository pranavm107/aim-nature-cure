import React, { useState, useEffect, useContext, useCallback } from 'react';
import { revenueService } from '../../services/revenueService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { SelectField } from '../../components/common/FormFields';
import { toast } from 'react-toastify';
import { IndianRupee, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

const MyRevenue = () => {
  const { profileData } = useContext(DoctorContext);
  const [revenue, setRevenue] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [period, setPeriod] = useState('this_month');
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [resolvedDoctorId, setResolvedDoctorId] = useState(null);

  // Resolve Doctor UUID from mapping
  useEffect(() => {
    const resolve = async () => {
      const docId = await revenueService.resolveDoctorId();
      setResolvedDoctorId(docId);
    };
    resolve();
  }, [profileData]);

  const fetchRev = useCallback(async () => {
    setLoading(true);
    try {
      const docId = resolvedDoctorId || (await revenueService.resolveDoctorId());
      const res = await revenueService.getDoctorRevenue(docId, period);
      if (res.success) {
        setRevenue(res.revenue || 0);
        setCompletedAppointments(res.completedAppointments || 0);
        setNote(res.attributionNote || '');
      } else {
        toast.error(res.message || "Failed to load your revenue");
      }
    } catch (err) {
      console.error("Failed to load doctor revenue:", err);
      toast.error("Failed to load your revenue");
    } finally {
      setLoading(false);
    }
  }, [resolvedDoctorId, period]);

  useEffect(() => {
    fetchRev();
  }, [fetchRev]);

  const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const periodLabel = {
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month'
  }[period] || period;

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <PageHeader title="My Revenue" subtitle="View your individual generated revenue from paid invoices" />
        <button
          onClick={fetchRev}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 sm:items-center w-full md:w-1/2">
        <SelectField 
          label="Reporting Period" 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)} 
          options={[
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'this_week' },
            { label: 'This Month', value: 'this_month' }
          ]} 
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading your revenue...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                {periodLabel}
              </span>
              <span className="text-xs text-slate-400">
                {resolvedDoctorId ? `Doctor ID: ${resolvedDoctorId.slice(0, 8)}...` : ''}
              </span>
            </div>
            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wide mt-2">My Paid Revenue</h3>
            <p className="text-4xl font-extrabold text-slate-800 my-2">{formatINR(revenue)}</p>
            {note && (
              <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200/60 italic">
                ℹ️ {note}
              </p>
            )}
          </Card>

          <Card title="Clinical Activity">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Completed Consultations / Appointments</span>
                <span className="text-lg font-bold text-slate-800">{completedAppointments}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Reporting Window</span>
                <span className="text-sm font-semibold text-slate-800">{periodLabel}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Average Revenue / Completed Consultation</span>
                <span className="text-sm font-bold text-emerald-600">
                  {completedAppointments > 0 ? formatINR(revenue / completedAppointments) : '₹0.00'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default MyRevenue;
