import React, { useState, useEffect } from 'react';
import { socialService } from '../../services/socialService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TextareaField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';

const SocialReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await socialService.getSubmissions();
      if (res.success) setSubmissions(res.submissions.sort((a,b) => b.date - a.date));
    } catch (err) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async () => {
    if(!selectedSub) return;
    setProcessing(true);
    try {
      const res = await socialService.approveSubmission(selectedSub._id, 'Admin');
      if (res.success) {
        toast.success("Submission Approved");
        setSelectedSub(null);
        fetchSubmissions();
      }
    } catch (err) {
      toast.error("Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if(!selectedSub) return;
    if(!rejectionReason.trim()) {
      toast.warn("A rejection reason is required.");
      return;
    }
    
    setProcessing(true);
    try {
      const res = await socialService.rejectSubmission(selectedSub._id, rejectionReason, 'Admin');
      if (res.success) {
        toast.success("Submission Rejected");
        setSelectedSub(null);
        setIsRejecting(false);
        setRejectionReason('');
        fetchSubmissions();
      }
    } catch (err) {
      toast.error("Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedSub(null);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const openReviewModal = (item) => {
    setSelectedSub(item);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const columns = [
    { label: 'Date' },
    { label: 'Doctor' },
    { label: 'Type' },
    { label: 'Title / Description' },
    { label: 'Link' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Review': return <Badge variant="warning">Pending Review</Badge>;
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
      case 'Resubmission Required': return <Badge variant="warning" className="bg-orange-100 text-orange-700">Resubmit Req</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_1fr_2.5fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50 transition-colors">
      <p>{new Date(item.date).toLocaleDateString()}</p>
      <p className="font-medium text-gray-800">{item.docId}</p>
      <p>{item.type}</p>
      <div className="pr-4">
        <p className="font-medium text-gray-800 truncate" title={item.title}>{item.title}</p>
        <p className="text-xs text-gray-500 truncate" title={item.description}>{item.description}</p>
      </div>
      <div>
        {item.link ? (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            View Link
          </a>
        ) : <span className="text-gray-400 text-xs">-</span>}
      </div>
      <div>{getStatusBadge(item.status)}</div>
      <div className="text-right">
        <button 
          onClick={() => openReviewModal(item)}
          className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-100 transition-colors font-medium"
        >
          View / Review
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Social Media Review" subtitle="Review content submitted by doctors for marketing" />
      
      <DataTable 
        columns={columns} 
        data={submissions} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No submissions found."
        gridColsClass="grid-cols-[1fr_1fr_1fr_2.5fr_1fr_1fr_1fr]" 
      />

      <Modal isOpen={!!selectedSub} onClose={closeModal} title="Review Social Media Submission">
        {selectedSub && (
          <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* If rejecting, show only rejection form overlaid or at top */}
            {isRejecting ? (
              <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-inner">
                <h3 className="text-red-800 font-bold text-lg mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Reject Social Media Submission
                </h3>
                <div className="mb-4">
                  <TextareaField 
                    label="Rejection Reason *" 
                    value={rejectionReason} 
                    onChange={e => setRejectionReason(e.target.value)} 
                    placeholder="Explain why this submission needs changes..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-red-200">
                  <button onClick={() => setIsRejecting(false)} className="px-4 py-2 border border-red-300 text-red-700 bg-white rounded hover:bg-red-50 transition-colors">Cancel</button>
                  <button onClick={handleReject} disabled={processing} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium">
                    {processing ? 'Rejecting...' : 'Reject Submission'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Status Banner */}
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Current Status</p>
                    {getStatusBadge(selectedSub.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Submitted By</p>
                    <p className="text-sm font-medium text-gray-800">{selectedSub.docId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Date</p>
                    <p className="text-sm font-medium text-gray-800">{new Date(selectedSub.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Title</p>
                      <h3 className="text-xl font-bold text-gray-900">{selectedSub.title}</h3>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Type</p>
                      <p className="text-sm font-medium text-gray-800">{selectedSub.type}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Description</p>
                      <div className="bg-gray-50 p-4 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedSub.description || 'No description provided.'}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Content / Caption</p>
                      <div className="bg-gray-50 p-4 rounded border text-sm text-gray-800 whitespace-pre-wrap min-h-24 font-medium">
                        {selectedSub.content || 'No content provided.'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                      <p className="text-xs text-blue-800 uppercase tracking-wide font-bold mb-3 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                        Reference Link
                      </p>
                      {selectedSub.link ? (
                        <div className="space-y-3">
                          <a href={selectedSub.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all font-medium">
                            {selectedSub.link}
                          </a>
                          <div>
                            <p className="text-xs text-blue-700 font-semibold mb-1 mt-2">Link Description:</p>
                            <p className="text-sm text-blue-900 bg-white/50 p-2 rounded">{selectedSub.linkDescription}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-blue-700/70 italic">No link provided.</p>
                      )}
                    </div>

                    {/* Version History */}
                    {selectedSub.history && selectedSub.history.length > 0 && (
                      <div className="border border-gray-200 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-3">Version History</p>
                        <div className="space-y-3">
                          {selectedSub.history.map((h, i) => (
                            <div key={i} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                              <p className="font-medium text-gray-700 flex justify-between">
                                <span>Version {i + 1}</span>
                                <span className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString()}</span>
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs">
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-sm font-semibold">{h.status}</span>
                                <span className="text-gray-500">by {h.rejectedBy}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 italic">"{h.rejectionReason}"</p>
                            </div>
                          ))}
                          <div className="text-sm">
                            <p className="font-medium text-gray-800 flex justify-between">
                              <span>Version {selectedSub.history.length + 1} (Current)</span>
                              <span className="text-xs text-gray-500">{new Date(selectedSub.date).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white">
                  <button onClick={closeModal} className="px-5 py-2 border rounded hover:bg-gray-50 font-medium transition-colors">Close</button>
                  {selectedSub.status === 'Pending Review' && (
                    <>
                      <button onClick={() => setIsRejecting(true)} className="px-5 py-2 border border-red-200 text-red-600 bg-red-50 rounded hover:bg-red-100 font-medium transition-colors">
                        Reject
                      </button>
                      <button onClick={handleApprove} disabled={processing} className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors">
                        {processing ? 'Approving...' : 'Approve Content'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default SocialReview;
