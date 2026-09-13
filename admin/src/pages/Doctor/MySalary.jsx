import React, { useState, useEffect, useContext } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { salaryService } from '../../services/salaryService';
import { DoctorContext } from '../../context/DoctorContext';
import { toast } from 'react-toastify';
import { IndianRupee, Clock, History } from 'lucide-react';

const MySalary = () => {
  const { dToken } = useContext(DoctorContext);
  // Using a mock way to extract doctorId since we rely on the context.
  // Real implementation would get it from the token payload or context profile.
  // We'll fetch it from localStorage for this mock if not available, but let's assume we can get it.
  const [doctorId, setDoctorId] = useState(null);

  const [currentSalary, setCurrentSalary] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic mock logic to extract doctorId
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const user = users.find(u => u.role === 'doctor' && u.doctorId);
    // In our pure mock setup without proper token decoding, we just get the first logged-in doctor
    // In a real app we would use dToken to get the doctor profile.
    
    // For now let's just pull 'doc1' or whoever is logged in.
    // Let's use the profile from localstorage if possible, or fallback to 'doc1'.
    const activeDocId = user?.doctorId || 'doc1';
    setDoctorId(activeDocId);
  }, []);

  useEffect(() => {
    if (doctorId) {
      fetchSalaryData();
    }
  }, [doctorId]);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const res = await salaryService.getCurrentSalary(doctorId);
      if (res.success) {
        setCurrentSalary(res.salary);
      }
      
      const histRes = await salaryService.getSalaryHistory(doctorId);
      if (histRes.success) {
        setSalaryHistory(histRes.history);
      }
    } catch (err) {
      toast.error('Failed to load salary data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;

  return (
    <PageContainer>
      <PageHeader title="My Salary" subtitle="View your current and historical salary details" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 lg:col-span-1">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Current Monthly Salary</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {currentSalary ? `₹${currentSalary.salaryAmount.toLocaleString('en-IN')}` : 'Not Set'}
            </h3>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
              Active
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 lg:col-span-1">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Effective From</p>
            <h3 className="text-lg font-semibold text-slate-800 mt-1">
              {currentSalary ? new Date(currentSalary.effectiveFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Salary History</h2>
        </div>
        
        <div className="p-0">
          {salaryHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Effective From</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Salary</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salaryHistory.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-slate-700">
                        {new Date(record.effectiveFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-800">
                        ₹{record.salaryAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'Current' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>No salary records found.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default MySalary;
