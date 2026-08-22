import React, { useState, useEffect } from 'react';
import { followUpService } from '../../services/followUpService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminFollowUpOverview = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await followUpService.getAllFollowUps();
      if (res.success) setFollowUps(res.followUps);
    } catch (err) {
      toast.error("Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const columns = [
    { label: 'Due Date' },
    { label: 'Doctor ID' },
    { label: 'Patient Name' },
    { label: 'Type' },
    { label: 'Priority' },
    { label: 'Status' }
  ];

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'High': return <Badge variant="danger">High</Badge>;
      case 'Medium': return <Badge variant="warning">Medium</Badge>;
      default: return <Badge variant="neutral">Low</Badge>;
    }
  };

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p className={new Date(item.dueDate) < new Date() && item.status !== 'Completed' ? 'text-red-500 font-medium' : ''}>
        {new Date(item.dueDate).toLocaleDateString()}
      </p>
      <p className="font-medium text-gray-600">{item.docId}</p>
      <p className="font-medium text-gray-800 hover:text-primary cursor-pointer" onClick={() => navigate(`/patient/${item.patientId}`)}>
        {item.patientName}
      </p>
      <p className="text-gray-600">{item.type}</p>
      <div>{getPriorityBadge(item.priority)}</div>
      <div>
        {item.status === 'Completed' ? <Badge variant="success">Completed</Badge> : <Badge variant="warning">Pending</Badge>}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Follow-Up Overview" subtitle="Monitor all patient follow-ups across the facility" />
      <DataTable 
        columns={columns} 
        data={followUps.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No follow-ups found."
        gridColsClass="grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr]" 
      />
    </PageContainer>
  );
};

export default AdminFollowUpOverview;
