import React, { useState, useEffect, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { payrollService } from '../../services/payrollService';
import { toast } from 'react-toastify';
import { CreditCard, Eye } from 'lucide-react';

const MyPayroll = () => {
  const { dToken } = useContext(DoctorContext);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // In the real app, the token would be decoded or the backend would use the token directly.
  // Since this is a frontend mock, we'll use a fixed doctor ID for the logged-in doctor.
  const doctorId = dToken ? 'doc1' : null;

  useEffect(() => {
    if (doctorId) {
      fetchPayrollData();
    }
  }, [doctorId]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getDoctorPayroll(doctorId);
      if (res.success) {
        // Sort descending by month
        const sorted = res.payrolls.sort((a, b) => b.month.localeCompare(a.month));
        setPayrolls(sorted);
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

  const currentMonth = payrolls.length > 0 ? payrolls[0] : null;

  return (
    <PageContainer>
      <PageHeader title="My Payroll" subtitle="View your monthly salary and incentive earnings." />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {currentMonth && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 max-w-xl flex gap-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Current Gross <span className="text-sm font-normal text-slate-500 ml-1">({currentMonth.month})</span></h3>
                </div>
                <p className="text-3xl font-bold text-emerald-600 pl-14">₹{(currentMonth.grossEarnings || 0).toLocaleString('en-IN')}</p>
                <div className="pl-14 mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    currentMonth.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : currentMonth.status === 'Approved' ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {currentMonth.status}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-slate-500">Base Salary: ₹{(currentMonth.baseSalary || 0).toLocaleString('en-IN')}</p>
                <p className="text-sm text-slate-500 mt-1">Total Incentive: ₹{(currentMonth.totalIncentive || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Monthly Statements</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Salary</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Incentive</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Earnings</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.length > 0 ? (
                    payrolls.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-sm text-slate-700 font-medium">{record.month}</td>
                        <td className="py-4 px-6 text-sm text-slate-700">₹{(record.baseSalary || 0).toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-sm text-slate-700">₹{(record.totalIncentive || 0).toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-sm text-emerald-600 font-semibold">₹{(record.grossEarnings || 0).toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' 
                            : record.status === 'Approved' ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-right">
                          <button 
                            onClick={() => handleView(record)}
                            className="text-slate-400 hover:text-primary transition-colors p-1"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        No monthly statements found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
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

export default MyPayroll;
