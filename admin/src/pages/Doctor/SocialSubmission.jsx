import React, { useState, useEffect, useContext } from 'react';
import { socialService } from '../../services/socialService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { InputField, SelectField, TextareaField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';

const SocialSubmission = () => {
  const { profileData } = useContext(DoctorContext);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [formData, setFormData] = useState({
    type: 'Article',
    title: '',
    description: '',
    content: '',
    link: '',
    linkDescription: ''
  });

  const fetchSubmissions = async () => {
    if (!profileData) return;
    setLoading(true);
    try {
      const res = await socialService.getDoctorSubmissions(profileData._id);
      if (res.success) setSubmissions(res.submissions.sort((a,b) => b.date - a.date));
    } catch (err) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [profileData]);

  const validateForm = () => {
    if (formData.link && !formData.linkDescription) {
      toast.warn("Please provide a description for the submitted link.");
      return false;
    }
    // Basic URL validation if link exists
    if (formData.link && !/^https?:\/\//i.test(formData.link)) {
      toast.warn("Link must be a valid URL starting with http:// or https://");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (isResubmitting && editingId) {
        const res = await socialService.resubmitSubmission(editingId, formData);
        if (res.success) toast.success("Content resubmitted for review");
      } else {
        const res = await socialService.createSubmission({
          ...formData,
          docId: profileData._id
        });
        if (res.success) toast.success("Content submitted for review");
      }
      
      setModalOpen(false);
      resetForm();
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ type: 'Article', title: '', description: '', content: '', link: '', linkDescription: '' });
    setIsResubmitting(false);
    setEditingId(null);
    setRejectionReason('');
  };

  const openNewSubmission = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleResubmit = (item) => {
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      link: item.link || '',
      linkDescription: item.linkDescription || ''
    });
    setEditingId(item._id);
    setRejectionReason(item.rejectionReason || '');
    setIsResubmitting(true);
    setModalOpen(true);
  };

  const columns = [
    { label: 'Date' },
    { label: 'Type' },
    { label: 'Title' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Review': return <Badge variant="warning">Pending Review</Badge>;
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
      case 'Resubmission Required': return <Badge variant="warning" className="bg-orange-100 text-orange-700">Resubmit Req</Badge>;
      case 'Draft': return <Badge variant="neutral">Draft</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50 transition-colors">
      <p>{new Date(item.date).toLocaleDateString()}</p>
      <p>{item.type}</p>
      <p className="truncate pr-4 font-medium text-gray-800" title={item.title}>{item.title}</p>
      <div>{getStatusBadge(item.status)}</div>
      <div className="text-right">
        {(item.status === 'Rejected' || item.status === 'Resubmission Required') && (
          <button 
            onClick={() => handleResubmit(item)}
            className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded hover:bg-orange-100 transition-colors"
          >
            View / Resubmit
          </button>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Social Submissions" 
        subtitle="Submit articles, videos, or posts for marketing approval" 
        actions={<PrimaryButton onClick={openNewSubmission}>+ New Submission</PrimaryButton>}
      />
      
      <DataTable 
        columns={columns} 
        data={submissions} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No submissions found."
        gridColsClass="grid-cols-[1fr_1fr_2fr_1fr_1fr]" 
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={isResubmitting ? "Resubmit Content" : "Submit Social Content"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {isResubmitting && rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
              <h4 className="text-red-800 font-bold text-sm mb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Admin Feedback (Rejection Reason)
              </h4>
              <p className="text-red-700 text-sm whitespace-pre-wrap">{rejectionReason}</p>
            </div>
          )}

          <SelectField 
            label="Content Type" 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})} 
            options={[
              {label: 'Article', value: 'Article'},
              {label: 'Instagram Post', value: 'Instagram Post'},
              {label: 'Facebook Post', value: 'Facebook Post'},
              {label: 'LinkedIn Post', value: 'LinkedIn Post'},
              {label: 'YouTube', value: 'YouTube'},
              {label: 'Other', value: 'Other'}
            ]} 
          />

          <InputField 
            label="Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
            placeholder="e.g. Benefits of Ayurveda"
          />

          <TextareaField 
            label="Description" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            required 
            placeholder="Explain what this content is about..."
            rows={3}
          />

          <TextareaField 
            label="Content / Caption" 
            value={formData.content} 
            onChange={e => setFormData({...formData, content: e.target.value})} 
            required 
            placeholder="Enter the actual proposed social-media content or caption..."
            rows={5}
          />

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">External Link (Optional)</h4>
            <div className="flex flex-col gap-4">
              <InputField 
                label="URL Link" 
                value={formData.link} 
                onChange={e => setFormData({...formData, link: e.target.value})} 
                placeholder="https://example.com/article"
              />
              <TextareaField 
                label={`Link Description ${formData.link ? '*' : ''}`} 
                value={formData.linkDescription} 
                onChange={e => setFormData({...formData, linkDescription: e.target.value})} 
                required={!!formData.link} 
                placeholder="Explain what the submitted URL contains and why it is relevant..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors">Cancel</button>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Submitting...' : (isResubmitting ? 'Resubmit for Review' : 'Submit Content')}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default SocialSubmission;
