import React, { useState, useEffect } from 'react';
import { followUpService } from '../../services/followUpService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { TextareaField } from '../../components/common/FormFields';

const AdminFollowUpOverview = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Review Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [reviewRemark, setReviewRemark] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTasks, resActs] = await Promise.all([
        followUpService.getAllFollowUps(),
        followUpService.getFollowUpActivities()
      ]);
      if (resTasks.success) setFollowUps(resTasks.followUps);
      if (resActs.success) setActivities(resActs.activities);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReviewModal = (activity) => {
    setSelectedActivity(activity);
    setReviewRemark(activity.reviewRemark || '');
    setModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      const res = await followUpService.approveFollowUpActivity(selectedActivity._id, { remark: reviewRemark });
      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        fetchData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error approving activity");
    }
  };

  const handleReject = async () => {
    if (!reviewRemark.trim()) {
      toast.error("Review remark is required for rejection");
      return;
    }
    try {
      const res = await followUpService.rejectFollowUpActivity(selectedActivity._id, { remark: reviewRemark });
      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        fetchData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error rejecting activity");
    }
  };

  // --- Task Columns ---
  const taskColumns = [
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

  const renderTaskRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p className={new Date(item.dueDate) < new Date() && item.status !== 'Completed' ? 'text-red-500 font-medium' : ''}>
        {new Date(item.dueDate).toLocaleDateString('en-GB')}
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

  // --- Incentive Submission Columns ---
  const submissionColumns = [
    { label: 'Patient' },
    { label: 'Doctor' },
    { label: 'Completed / Required' },
    { label: 'Date' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderSubmissionRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p className="font-medium text-gray-800">{item.patientName}</p>
      <p className="text-gray-600 font-medium">{item.doctorId}</p>
      <p className="text-gray-600">{item.completedCount} / {item.requiredCount}</p>
      <p className="text-gray-600">{new Date(item.followUpDate).toLocaleDateString('en-GB')}</p>
      <div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
          item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {item.status}
        </span>
      </div>
      <div className="text-right">
        <button 
          onClick={() => openReviewModal(item)}
          className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors font-medium"
        >
          {item.status === 'Submitted' ? 'Review' : 'View Details'}
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Follow-Up Overview" subtitle="Monitor tasks and review incentive submissions" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="flex border-b border-slate-200">
          <button 
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('tasks')}
          >
            Task Overview
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'submissions' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('submissions')}
          >
            Incentive Review
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <DataTable 
          columns={taskColumns} 
          data={followUps.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))} 
          loading={loading} 
          renderRow={renderTaskRow} 
          renderMobileCard={() => <div />} 
          emptyMessage="No follow-ups found."
          gridColsClass="grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr]" 
        />
      ) : (
        <DataTable 
          columns={submissionColumns} 
          data={activities.sort((a,b) => b.submittedAt - a.submittedAt)} 
          loading={loading} 
          renderRow={renderSubmissionRow} 
          renderMobileCard={() => <div />} 
          emptyMessage="No submissions found."
          gridColsClass="grid-cols-[1.5fr_1fr_1.5fr_1fr_1fr_1fr]" 
        />
      )}

      {/* Review Modal */}
      {modalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {selectedActivity.status === 'Submitted' ? 'Review Submission' : 'Submission Details'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Patient:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedActivity.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Doctor ID:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedActivity.doctorId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Date:</span>
                  <span className="text-sm font-semibold text-slate-800">{new Date(selectedActivity.followUpDate).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Sessions:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedActivity.completedCount} / {selectedActivity.requiredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Status:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedActivity.status}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-500 font-medium block mb-1">Description:</span>
                  <p className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-100">{selectedActivity.description || 'No description provided.'}</p>
                </div>
                {selectedActivity.status !== 'Submitted' && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <span className="text-sm text-slate-500 font-medium block mb-1">Admin Remark:</span>
                    <p className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-100">{selectedActivity.reviewRemark || 'None'}</p>
                    <div className="text-xs text-slate-400 mt-2 text-right">
                      Reviewed on {new Date(selectedActivity.reviewedAt).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                )}
              </div>

              {selectedActivity.status === 'Submitted' && (
                <div className="mb-4">
                  <TextareaField
                    label="Review Remark (Required for rejection)"
                    rows={2}
                    value={reviewRemark}
                    onChange={(e) => setReviewRemark(e.target.value)}
                    placeholder="Enter notes..."
                  />
                </div>
              )}
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                
                {selectedActivity.status === 'Submitted' && (
                  <>
                    <button 
                      type="button" 
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      type="button" 
                      onClick={handleApprove}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default AdminFollowUpOverview;
