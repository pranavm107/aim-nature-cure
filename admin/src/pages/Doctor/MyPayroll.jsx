import React, { useState, useEffect, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { payrollService } from '../../services/payrollService';
import { toast } from 'react-toastify';
import { CreditCard } from 'lucide-react';

const MyPayroll = () => {
  const { dToken } = useContext(DoctorContext);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // Sort descending by period (roughly string sorting is fine for mocks)
        const sorted = res.payrolls.sort((a, b) => b.period.localeCompare(a.period));
        setPayrolls(sorted);
      }
    } catch (err) {
      toast.error("Error loading payroll data");
    } finally {
      setLoading(false);
    }
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 max-w-4xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Current Month Earnings <span className="text-sm font-normal text-slate-500 ml-2">({currentMonth.period})</span></h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Base Salary</p>
                  <p className="text-xl font-bold text-slate-800">₹{currentMonth.salaryAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Incentive</p>
                  <p className="text-xl font-bold text-slate-800">₹{currentMonth.incentiveAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-primary mb-1">Gross Earnings</p>
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-primary">₹{currentMonth.grossEarnings.toLocaleString('en-IN')}</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      currentMonth.status === 'Paid' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {currentMonth.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Payroll History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Incentive</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Earnings</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.length > 0 ? (
                    payrolls.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-sm text-slate-700 font-medium">{record.period}</td>
                        <td className="py-4 px-6 text-sm text-slate-700">₹{record.salaryAmount.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-sm text-slate-700">₹{record.incentiveAmount.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-sm font-medium text-primary">₹{record.grossEarnings.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        No payroll records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default MyPayroll;
