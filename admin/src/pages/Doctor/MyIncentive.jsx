import React, { useState, useEffect, useContext } from 'react';
import { incentiveService } from '../../services/incentiveService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';

const MyIncentive = () => {
  const { profileData } = useContext(DoctorContext);
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileData) return;
    const fetchInc = async () => {
      try {
        const res = await incentiveService.getDoctorIncentives(profileData._id);
        if (res.success) setIncentives(res.incentives);
      } catch (err) {
        toast.error("Failed to load incentives");
      } finally {
        setLoading(false);
      }
    };
    fetchInc();
  }, [profileData]);

  const columns = [
    { label: 'Period' },
    { label: 'Target' },
    { label: 'Achieved Revenue' },
    { label: 'Incentive (%)' },
    { label: 'Calculated Amount' },
    { label: 'Status' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm">
      <p>{item.period}</p>
      <p>${item.target}</p>
      <p>${item.totalRevenue}</p>
      <p>{item.percentage}%</p>
      <p className="font-semibold text-gray-800">${item.calculatedAmount}</p>
      <div>
        {item.status === 'Approved' ? <Badge variant="success">Approved</Badge> : <Badge variant="warning">{item.status}</Badge>}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="My Incentives" subtitle="Track your targets and incentive history" />
      <DataTable 
        columns={columns} 
        data={incentives} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No incentive records found."
        gridColsClass="grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr]" 
      />
    </PageContainer>
  );
};

export default MyIncentive;
