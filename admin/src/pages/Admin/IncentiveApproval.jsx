import React, { useState, useEffect } from 'react';
import { incentiveService } from '../../services/incentiveService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';

const IncentiveApproval = () => {
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await incentiveService.getPendingIncentives();
      if (res.success) setIncentives(res.pending);
    } catch (err) {
      toast.error("Error loading pending incentives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await incentiveService.approveIncentive(id);
      if (res.success) {
        toast.success("Incentive approved");
        fetchPending();
      }
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const columns = [
    { label: 'Doctor ID' },
    { label: 'Period' },
    { label: 'Total Revenue' },
    { label: 'Target' },
    { label: 'Calculated Incentive' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p>{item.docId}</p>
      <p>{item.period}</p>
      <p>${item.totalRevenue}</p>
      <p>${item.target}</p>
      <p className="font-semibold text-primary">${item.calculatedAmount}</p>
      <div className="text-right flex items-center justify-end gap-2">
        <Badge variant="danger">Pending</Badge>
        <button onClick={() => handleApprove(item._id)} className="text-green-600 hover:underline font-medium ml-2 border border-green-200 bg-green-50 px-2 py-1 rounded">Approve</button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Incentive Approval" subtitle="Review and approve pending incentives for doctors" />
      <DataTable 
        columns={columns} 
        data={incentives} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No pending incentives."
        gridColsClass="grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr]" 
      />
    </PageContainer>
  );
};

export default IncentiveApproval;
