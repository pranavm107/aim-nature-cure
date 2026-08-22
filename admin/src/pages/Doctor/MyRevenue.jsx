import React, { useState, useEffect, useContext } from 'react';
import { revenueService } from '../../services/revenueService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { SelectField } from '../../components/common/FormFields';
import { toast } from 'react-toastify';

const MyRevenue = () => {
  const { profileData } = useContext(DoctorContext);
  const [revenue, setRevenue] = useState(0);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!profileData) return;
    const fetchRev = async () => {
      setLoading(true);
      try {
        const res = await revenueService.getDoctorRevenue(profileData._id, period);
        if (res.success) {
          setRevenue(res.revenue);
          setNote(res.attributionNote);
        }
      } catch (err) {
        toast.error("Failed to load your revenue");
      } finally {
        setLoading(false);
      }
    };
    fetchRev();
  }, [profileData, period]);

  return (
    <PageContainer>
      <PageHeader title="My Revenue" subtitle="View your generated revenue from paid invoices" />
      
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex gap-4 w-full md:w-1/3">
        <SelectField 
          label="Period" 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)} 
          options={[
            {label: 'Today', value: 'today'},
            {label: 'This Week', value: 'week'},
            {label: 'This Month', value: 'month'}
          ]} 
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h3 className="text-gray-600 text-sm font-medium mb-2">My Paid Revenue ({period})</h3>
            <p className="text-4xl font-bold text-gray-800">${revenue}</p>
            <p className="text-xs text-primary mt-4 italic">{note}</p>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default MyRevenue;
