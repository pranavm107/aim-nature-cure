import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { payrollService } from '../../services/payrollService';
import { toast } from 'react-toastify';
import { ArrowLeft, CheckCircle, CreditCard, Clock, Check, History, Receipt } from 'lucide-react';

const PayrollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewRemark, setReviewRemark] = useState('');
  
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStatement();
  }, [id]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getPayrollById(id);
      if (res.success) {
        setStatement(res.payroll);
      } else {
        toast.error("Statement not found");
        navigate('/admin/payroll');
      }
    } catch (err) {
      toast.error("Error loading statement");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await payrollService.approvePayroll(id, { reviewRemark });
      if (res.success) {
        toast.success("Statement Approved successfully");
        setApproveModalOpen(false);
        fetchStatement();
      } else {
        toast.error(res.message || "Approval failed");
      }
    } catch (err) {
      toast.error("Error approving statement");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAsPaid = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await payrollService.markPayrollAsPaid(id, { paidAt: paymentDate });
      if (res.success) {
        toast.success("Statement marked as Paid");
        setPaymentModalOpen(false);
        fetchStatement();
      } else {
        toast.error(res.message || "Failed to mark as paid");
      }
    } catch (err) {
      toast.error("Error marking as paid");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  if (!statement) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Paid</span>;
      case 'Approved': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5"><Check className="w-4 h-4" /> Approved</span>;
      default: return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5"><Clock className="w-4 h-4" /> Pending Review</span>;
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    if (typeof ts === 'string' && ts.includes('-')) {
      // YYYY-MM-DD
      const d = new Date(ts);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/payroll')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payroll
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Statement: {statement.month}</h1>
          <p className="text-slate-500 mt-1">{statement.doctorName}</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(statement.status)}
          
          {statement.status === 'Pending Review' && (
            <button 
              onClick={() => setApproveModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Approve Payroll
            </button>
          )}

          {statement.status === 'Approved' && (
            <button 
              onClick={() => setPaymentModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" /> Mark as Paid
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Base Salary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-slate-800">Base Salary</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-600 font-medium">Monthly Salary</span>
                <span className="text-slate-800 font-bold">₹{(statement.baseSalary || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Revenue Incentive */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Revenue Incentive Breakdown</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Consultation (₹{(statement.revenueIncentive?.consultationRevenue || 0).toLocaleString('en-IN')} @ {statement.revenueIncentive?.consultationPercentage || 0}%)</span>
                <span className="text-slate-800 font-medium">₹{(statement.revenueIncentive?.consultationIncentive || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Treatment (₹{(statement.revenueIncentive?.treatmentRevenue || 0).toLocaleString('en-IN')} @ {statement.revenueIncentive?.treatmentPercentage || 0}%)</span>
                <span className="text-slate-800 font-medium">₹{(statement.revenueIncentive?.treatmentIncentive || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Package (₹{(statement.revenueIncentive?.packageRevenue || 0).toLocaleString('en-IN')} @ {statement.revenueIncentive?.packagePercentage || 0}%)</span>
                <span className="text-slate-800 font-medium">₹{(statement.revenueIncentive?.packageIncentive || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-blue-50/50 -mx-6 px-6 pb-2 pt-4">
                <span className="text-blue-800 font-semibold">Total Revenue Incentive</span>
                <span className="text-blue-800 font-bold">₹{(statement.revenueIncentive?.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Activity Incentive */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Activity Incentive Breakdown</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Approved Follow-ups ({statement.activityIncentive?.approvedFollowUps || 0} @ ₹{statement.activityIncentive?.followUpAmount || 0})</span>
                <span className="text-slate-800 font-medium">₹{(statement.activityIncentive?.followUpIncentive || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Approved Social Media ({statement.activityIncentive?.approvedSocialMedia || 0} @ ₹{statement.activityIncentive?.socialMediaAmount || 0})</span>
                <span className="text-slate-800 font-medium">₹{(statement.activityIncentive?.socialMediaIncentive || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-purple-50/50 -mx-6 px-6 pb-2 pt-4">
                <span className="text-purple-800 font-semibold">Total Activity Incentive</span>
                <span className="text-purple-800 font-bold">₹{(statement.activityIncentive?.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Earnings Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Base Salary</span>
                <span className="text-slate-800 font-medium">₹{(statement.baseSalary || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Total Incentive</span>
                <span className="text-slate-800 font-medium">₹{(statement.totalIncentive || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-emerald-50 p-4 rounded-lg mt-2 border border-emerald-100">
                <span className="text-emerald-800 font-bold text-lg">Gross Earnings</span>
                <span className="text-emerald-800 font-bold text-xl">₹{(statement.grossEarnings || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Audit History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Audit History</h3>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <p className="text-slate-500 font-medium mb-1">Generated</p>
                <p className="text-slate-800">{formatDate(statement.generatedAt)} by {statement.generatedBy || 'System'}</p>
              </div>
              
              {statement.approvedAt && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-slate-500 font-medium mb-1">Approved</p>
                  <p className="text-slate-800">{formatDate(statement.approvedAt)} by {statement.approvedBy}</p>
                  {statement.reviewRemark && (
                    <p className="text-slate-600 italic mt-1 text-xs">"{statement.reviewRemark}"</p>
                  )}
                </div>
              )}

              {statement.paidAt && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-slate-500 font-medium mb-1">Paid Date</p>
                  <p className="text-slate-800 font-medium">{formatDate(statement.paidAt)}</p>
                  <p className="text-slate-600 text-xs mt-1">Recorded by {statement.paidBy}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Approve Payroll</h3>
              <button onClick={() => setApproveModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleApprove} className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-800 text-sm">Doctor</span>
                  <span className="text-blue-900 font-semibold">{statement.doctorName}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-800 text-sm">Month</span>
                  <span className="text-blue-900 font-semibold">{statement.month}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-blue-200">
                  <span className="text-blue-800 font-medium">Gross Earnings</span>
                  <span className="text-blue-900 font-bold text-lg">₹{(statement.grossEarnings || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Review Remarks (Optional)</label>
                <textarea 
                  value={reviewRemark}
                  onChange={(e) => setReviewRemark(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows="3"
                  placeholder="Any notes about this approval..."
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setApproveModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                  {processing ? 'Processing...' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Mark as Paid</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleMarkAsPaid} className="p-6 space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-800 text-sm">Doctor</span>
                  <span className="text-emerald-900 font-semibold">{statement.doctorName}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-800 text-sm">Month</span>
                  <span className="text-emerald-900 font-semibold">{statement.month}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-emerald-200">
                  <span className="text-emerald-800 font-medium">Final Gross Earnings</span>
                  <span className="text-emerald-900 font-bold text-lg">₹{(statement.grossEarnings || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                <input 
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm">
                  {processing ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageContainer>
  );
};

export default PayrollDetail;
