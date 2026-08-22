import React, { useState, useEffect } from 'react';
import { revenueService } from '../../services/revenueService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import { toast } from 'react-toastify';

const DoctorComparison = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await revenueService.getDoctorComparison();
        if (res.success) setData(res.comparison);
      } catch (err) {
        toast.error("Failed to load comparison data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { label: 'Rank' },
    { label: 'Doctor Name' },
    { label: 'Generated Revenue (Paid)' }
  ];

  const renderRow = (item, idx) => (
    <div key={item.doctorId} className="grid grid-cols-[0.5fr_2fr_1fr] py-3 px-6 border-b hover:bg-gray-50 items-center">
      <p className="text-gray-500 font-medium">#{idx + 1}</p>
      <p className="font-semibold text-gray-800">{item.doctorName}</p>
      <p className="text-green-600 font-bold">${item.revenue}</p>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Revenue Comparison" subtitle="Compare doctors based on paid revenue generation" />
      <DataTable 
        columns={columns} 
        data={data} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        gridColsClass="grid-cols-[0.5fr_2fr_1fr]"
      />
    </PageContainer>
  );
};

export default DoctorComparison;
