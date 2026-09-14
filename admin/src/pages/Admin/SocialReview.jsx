import React, { useState, useEffect } from 'react';
import { socialService } from '../../services/socialService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { TextareaField } from '../../components/common/FormFields';
import { toast } from 'react-toastify';

const SocialReview = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [reviewRemark, setReviewRemark] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await socialService.getSocialMediaActivities();
      if (res.success) setActivities(res.activities.sort((a,b) => b.submittedAt - a.submittedAt));
    } catch (err) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleApprove = async () => {
    if(!selectedActivity) return;
    setProcessing(true);
    try {
      const res = await socialService.approveSocialMediaActivity(selectedActivity._id, { remark: reviewRemark });
      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        fetchActivities();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if(!selectedActivity) return;
    if(!reviewRemark.trim()) {
      toast.warn("A review remark is required for rejection.");
      return;
    }
    
    setProcessing(true);
    try {
      const res = await socialService.rejectSocialMediaActivity(selectedActivity._id, { remark: reviewRemark });
      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        fetchActivities();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  const openReviewModal = (activity) => {
    setSelectedActivity(activity);
    setReviewRemark(activity.reviewRemark || '');
    setModalOpen(true);
  };

  const columns = [
    { label: 'Doctor ID' },
    { label: 'Platform' },
    { label: 'Date' },
    { label: 'Description' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted': return <Badge variant="warning">Submitted</Badge>;
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_1fr_2.5fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-slate-50 transition-colors">
      <p className="font-medium text-slate-800">{item.doctorId}</p>
      <p>{item.platform}</p>
      <p>{new Date(item.postDate).toLocaleDateString('en-GB')}</p>
      <p className="text-slate-600 truncate pr-4" title={item.description}>{item.description}</p>
      <div>{getStatusBadge(item.status)}</div>
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
        <PageHeader title="Social Media Review" subtitle="Review social media incentive submissions" />
      </div>
      
      <DataTable 
        columns={columns} 
        data={activities} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No social media activities available for review."
        gridColsClass="grid-cols-[1fr_1fr_1fr_2.5fr_1fr_1fr]" 
      />

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
                  <span className="text-sm text-slate-500 font-medium">Doctor ID:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedActivity.doctorId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Platform:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedActivity.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Post Date:</span>
                  <span className="text-sm font-semibold text-slate-800">{new Date(selectedActivity.postDate).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Status:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedActivity.status}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-500 font-medium block mb-1">Link:</span>
                  <a href={selectedActivity.postLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                    {selectedActivity.postLink}
                  </a>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-500 font-medium block mb-1">Description:</span>
                  <p className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-100">{selectedActivity.description || 'No description provided.'}</p>
                </div>
                {selectedActivity.proofReference && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <span className="text-sm text-slate-500 font-medium block mb-1">Proof/Reference:</span>
                    <p className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-100">{selectedActivity.proofReference}</p>
                  </div>
                )}
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
                      disabled={processing}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
                    >
                      {processing ? '...' : 'Reject'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleApprove}
                      disabled={processing}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {processing ? '...' : 'Approve'}
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

export default SocialReview;
