import React, { useState, useEffect } from 'react';
import { revenueService } from '../../services/revenueService';
import { adminService } from '../../services/adminService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { toast } from 'react-toastify';
import { SelectField } from '../../components/common/FormFields';

const DoctorRevenue = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchDocs = async () => {
      const res = await adminService.getAllDoctors();
      if (res.success) {
        setDoctors(res.doctors);
        if (res.doctors.length > 0) {
          setSelectedDoc(res.doctors[0]._id);
        }
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    if (!selectedDoc) return;
    const fetchRev = async () => {
      setLoading(true);
      try {
        const res = await revenueService.getDoctorRevenue(selectedDoc, period);
        if (res.success) setRevenueData(res);
      } catch (err) {
        toast.error("Failed to load revenue");
      } finally {
        setLoading(false);
      }
    };
    fetchRev();
  }, [selectedDoc, period]);

  return (
    <PageContainer>
      <PageHeader title="Doctor Revenue Report" subtitle="View paid revenue by doctor" />
      
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex gap-4 items-end">
        <SelectField 
          label="Select Doctor" 
          value={selectedDoc} 
          onChange={(e) => setSelectedDoc(e.target.value)} 
          options={doctors.map(d => ({label: d.name, value: d._id}))} 
        />
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
        <div className="p-8 text-center text-gray-500">Loading revenue...</div>
      ) : revenueData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Paid Revenue ({period})</h3>
            <p className="text-4xl font-bold text-gray-800">${revenueData.revenue}</p>
            <p className="text-xs text-primary mt-4 italic">{revenueData.attributionNote}</p>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  );
};

export default DoctorRevenue;
