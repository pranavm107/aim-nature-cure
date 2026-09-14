import React, { useState, useEffect, useContext } from 'react';
import { socialService } from '../../services/socialService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { InputField, SelectField, TextareaField } from '../../components/common/FormFields';
import { toast } from 'react-toastify';

const SocialSubmission = () => {
  const { profileData } = useContext(DoctorContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    platform: 'Instagram',
    postDate: new Date().toISOString().split('T')[0],
    postLink: '',
    description: '',
    proofReference: ''
  });

  const fetchActivities = async () => {
    if (!profileData) return;
    setLoading(true);
    try {
      const res = await socialService.getDoctorSocialMediaActivities(profileData._id);
      if (res.success) setActivities(res.activities.sort((a,b) => b.submittedAt - a.submittedAt));
    } catch (err) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [profileData]);

  const validateForm = () => {
    if (!formData.platform || !formData.postDate || !formData.postLink || !formData.description) {
      toast.warn("Please fill all required fields.");
      return false;
    }
    if (!/^https?:\/\//i.test(formData.postLink)) {
      toast.warn("Post Link must be a valid URL starting with http:// or https://");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await socialService.submitSocialMediaActivity({
        ...formData,
        doctorId: profileData._id
      });
      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        resetForm();
        fetchActivities();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: 'Instagram',
      postDate: new Date().toISOString().split('T')[0],
      postLink: '',
      description: '',
      proofReference: ''
    });
  };

  const openNewSubmission = () => {
    resetForm();
    setModalOpen(true);
  };

  const openViewModal = (activity) => {
    setSelectedActivity(activity);
    setViewModalOpen(true);
  };

  const columns = [
    { label: 'Date' },
    { label: 'Platform' },
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
    <div key={item._id} className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-slate-50 transition-colors">
      <p>{new Date(item.postDate).toLocaleDateString('en-GB')}</p>
      <p className="font-medium text-slate-800">{item.platform}</p>
      <p className="truncate pr-4 text-slate-600" title={item.description}>{item.description}</p>
      <div>{getStatusBadge(item.status)}</div>
      <div className="text-right">
        <button 
          onClick={() => openViewModal(item)}
          className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Social Media Submissions" subtitle="Submit your social media activities for incentive review" />
        <button 
          onClick={openNewSubmission}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 font-medium transition-colors"
        >
          New Submission
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={activities} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No social media activities submitted yet."
        gridColsClass="grid-cols-[1fr_1fr_2fr_1fr_1fr]" 
      />
      {/* New Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Submit Social Media Activity</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <SelectField
                  label="Platform *"
                  options={[
                    { value: 'Instagram', label: 'Instagram' },
                    { value: 'Facebook', label: 'Facebook' },
                    { value: 'YouTube', label: 'YouTube' },
                    { value: 'LinkedIn', label: 'LinkedIn' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  required
                />
                
                <InputField
                  label="Post Date *"
                  type="date"
                  value={formData.postDate}
                  onChange={(e) => setFormData({...formData, postDate: e.target.value})}
                  required
                />

                <InputField
                  label="Post Link *"
                  type="url"
                  placeholder="https://..."
                  value={formData.postLink}
                  onChange={(e) => setFormData({...formData, postLink: e.target.value})}
                  required
                />
                
                <TextareaField
                  label="Description *"
                  rows={2}
                  placeholder="Describe the content and purpose"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />

                <InputField
                  label="Proof / Reference (Optional)"
                  placeholder="Additional proof details"
                  value={formData.proofReference}
                  onChange={(e) => setFormData({...formData, proofReference: e.target.value})}
                />
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Submitting...' : 'Submit Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Activity Details</h3>
              <button type="button" onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <span>{getStatusBadge(selectedActivity.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Platform</span>
                  <span className="text-sm font-medium">{selectedActivity.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Post Date</span>
                  <span className="text-sm font-medium">{new Date(selectedActivity.postDate).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Link</span>
                  <a href={selectedActivity.postLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate max-w-[200px]">
                    {selectedActivity.postLink}
                  </a>
                </div>
                <div>
                  <span className="text-sm text-slate-500 block mb-1">Description</span>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedActivity.description}
                  </p>
                </div>
                {selectedActivity.proofReference && (
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Proof/Reference</span>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedActivity.proofReference}
                    </p>
                  </div>
                )}
                {selectedActivity.status !== 'Submitted' && selectedActivity.reviewRemark && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-500 block mb-1">Admin Remark</span>
                    <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                      {selectedActivity.reviewRemark}
                    </p>
                    <div className="text-xs text-slate-400 mt-2 text-right">
                      Reviewed on {new Date(selectedActivity.reviewedAt).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setViewModalOpen(false)} 
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default SocialSubmission;
