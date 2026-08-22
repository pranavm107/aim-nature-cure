import React, { useState, useEffect, useContext } from 'react';
import { followUpService } from '../../services/followUpService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const FollowUpList = () => {
  const { profileData } = useContext(DoctorContext);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFollowUps = async () => {
    if (!profileData) return;
    setLoading(true);
    try {
      const res = await followUpService.getDoctorFollowUps(profileData._id);
      if (res.success) setFollowUps(res.followUps);
    } catch (err) {
      toast.error("Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [profileData]);

  const handleMarkComplete = async (id) => {
    try {
      const res = await followUpService.updateFollowUpStatus(id, "Completed");
      if (res.success) {
        toast.success("Follow-up marked complete");
        fetchFollowUps();
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const columns = [
    { label: 'Due Date' },
    { label: 'Patient Name' },
    { label: 'Type' },
    { label: 'Priority' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'High': return <Badge variant="danger">High</Badge>;
      case 'Medium': return <Badge variant="warning">Medium</Badge>;
      default: return <Badge variant="neutral">Low</Badge>;
    }
  };

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p className={new Date(item.dueDate) < new Date() && item.status !== 'Completed' ? 'text-red-500 font-medium' : ''}>
        {new Date(item.dueDate).toLocaleDateString()}
      </p>
      <p className="font-medium text-gray-800 hover:text-primary cursor-pointer" onClick={() => navigate(`/patient/${item.patientId}`)}>
        {item.patientName}
      </p>
      <p className="text-gray-600">{item.type}</p>
      <div>{getPriorityBadge(item.priority)}</div>
      <div>
        {item.status === 'Completed' ? <Badge variant="success">Completed</Badge> : <Badge variant="warning">Pending</Badge>}
      </div>
      <div className="text-right flex gap-3 justify-end items-center">
        {item.status !== 'Completed' && (
          <button 
            onClick={() => handleMarkComplete(item._id)}
            className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded hover:bg-green-100 transition-colors"
          >
            Mark Done
          </button>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="My Follow-Ups" subtitle="Track and manage patient follow-ups and reminders" />
      <DataTable 
        columns={columns} 
        data={followUps.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No follow-ups scheduled."
        gridColsClass="grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr]" 
      />
    </PageContainer>
  );
};

export default FollowUpList;
