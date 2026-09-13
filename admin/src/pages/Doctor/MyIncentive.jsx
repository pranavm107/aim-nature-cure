import React, { useState, useEffect, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { incentiveService } from '../../services/incentiveService';
import { toast } from 'react-toastify';
import { Percent } from 'lucide-react';

const MyIncentive = () => {
  const { dToken } = useContext(DoctorContext);
  const [currentIncentive, setCurrentIncentive] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  // In the real app, the token would be decoded or the backend would use the token directly.
  // Since this is a frontend mock, we'll use a fixed doctor ID for the logged-in doctor.
  // The mock login currently sets the doctor as doc1.
  const doctorId = dToken ? 'doc1' : null;

  useEffect(() => {
    if (doctorId) {
      fetchIncentiveData();
    }
  }, [doctorId]);

  const fetchIncentiveData = async () => {
    setLoading(true);
    try {
      const configRes = await incentiveService.getCurrentIncentive(doctorId);
      if (configRes.success) setCurrentIncentive(configRes.incentive);

      const earnRes = await incentiveService.getIncentiveEarnings(doctorId);
      if (earnRes.success) setEarnings(earnRes.earnings);
    } catch (err) {
      toast.error("Error loading incentive data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="My Incentive" subtitle="View your incentive details and earnings history" />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 lg:col-span-1">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Current Incentive</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {currentIncentive ? `${currentIncentive.percentage}%` : 'Not Set'}
                </h3>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                  Active
                </div>
                {currentIncentive && (
                  <p className="text-xs text-slate-500 mt-3 border-t border-slate-100 pt-3">
                    Effective From: <span className="font-medium text-slate-700">{new Date(currentIncentive.effectiveFrom).toLocaleDateString('en-GB')}</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2 flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">How your incentive is calculated</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your monthly incentive is calculated as a percentage of your total generated revenue. 
                For example, if your revenue is ₹1,00,000 and your incentive rate is 10%, your earned incentive will be ₹10,000.
              </p>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-sm text-slate-700">
                Formula: Revenue × (Incentive % / 100) = Earned Incentive
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Incentive Earnings History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Incentive %</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Earned Incentive</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {earnings.length > 0 ? (
                    earnings.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-sm text-slate-700">{record.period}</td>
                        <td className="py-4 px-6 text-sm text-slate-700">₹{record.revenue.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-800">{record.incentivePercentage}%</td>
                        <td className="py-4 px-6 text-sm font-medium text-primary">₹{record.incentiveAmount.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'Calculated' 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        No incentive earnings recorded yet.
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

export default MyIncentive;
