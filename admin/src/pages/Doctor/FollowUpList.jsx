import React, { useState, useEffect, useContext } from 'react';
import { followUpService } from '../../services/followUpService';
import { patientService } from '../../services/patientService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { SelectField, InputField, TextareaField } from '../../components/common/FormFields';

const FollowUpList = () => {
  const { profileData } = useContext(DoctorContext);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'submissions'
  
  // Data
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [myPatients, setMyPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // Submission Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    completedCount: '',
    requiredCount: '',
    followUpDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchData = async () => {
    if (!profileData) return;
    setLoading(true);
    try {
      const [resTasks, resActs, resPats] = await Promise.all([
        followUpService.getDoctorFollowUps(profileData._id),
        followUpService.getDoctorFollowUpActivities(profileData._id),
        patientService.getPatients() // Note: patientService.getPatients handles role-based filtering, will return only doc's patients
      ]);
      
      if (resTasks.success) setFollowUps(resTasks.followUps);
      if (resActs.success) setActivities(resActs.activities);
      if (resPats.success) setMyPatients(resPats.patients);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profileData]);

  const handleMarkComplete = async (id) => {
    try {
      const res = await followUpService.completeFollowUp(id, "Completed via list view");
      if (res.success) {
        toast.success("Follow-up marked complete");
        fetchData();
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const handleSubmitActivity = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.completedCount || !formData.requiredCount || !formData.followUpDate) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      const res = await followUpService.submitFollowUpActivity({
        doctorId: profileData._id,
        patientId: formData.patientId,
        completedCount: formData.completedCount,
        requiredCount: formData.requiredCount,
        followUpDate: formData.followUpDate,
        description: formData.description
      });
      
      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        fetchData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error submitting activity");
    }
  };

  const openSubmissionModal = () => {
    setFormData({
      patientId: '',
      completedCount: '',
      requiredCount: '',
      followUpDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setModalOpen(true);
  };

  // --- Task Overview Columns ---
  const taskColumns = [
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

  const renderTaskRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-slate-50">
      <p className={new Date(item.dueDate) < new Date() && item.status !== 'Completed' ? 'text-red-500 font-medium' : ''}>
        {new Date(item.dueDate).toLocaleDateString('en-GB')}
      </p>
      <p className="font-medium text-slate-800 hover:text-primary cursor-pointer" onClick={() => navigate(`/patient/${item.patientId}`)}>
        {item.patientName}
      </p>
      <p className="text-slate-600">{item.type}</p>
      <div>{getPriorityBadge(item.priority)}</div>
      <div>
        {item.status === 'Completed' ? <Badge variant="success">Completed</Badge> : <Badge variant="warning">Pending</Badge>}
      </div>
      <div className="text-right flex gap-3 justify-end items-center">
        {item.status !== 'Completed' && (
          <button 
            onClick={() => handleMarkComplete(item._id)}
            className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
          >
            Mark Done
          </button>
        )}
      </div>
    </div>
  );

  // --- Incentive Submission Columns ---
  const submissionColumns = [
    { label: 'Date' },
    { label: 'Patient Name' },
    { label: 'Completed / Required' },
    { label: 'Submitted At' },
    { label: 'Status' },
    { label: 'Remark' }
  ];

  const renderSubmissionRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1.5fr] py-3 px-6 border-b items-center text-sm hover:bg-slate-50">
      <p className="text-slate-700">{new Date(item.followUpDate).toLocaleDateString('en-GB')}</p>
      <p className="font-medium text-slate-800">{item.patientName}</p>
      <p className="text-slate-600">{item.completedCount} / {item.requiredCount}</p>
      <p className="text-slate-500 text-xs">{new Date(item.submittedAt).toLocaleDateString('en-GB')}</p>
      <div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
          item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {item.status}
        </span>
      </div>
      <p className="text-slate-500 text-xs truncate" title={item.reviewRemark || item.description}>
        {item.reviewRemark ? `Admin: ${item.reviewRemark}` : item.description}
      </p>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="My Follow-Ups" subtitle="Manage tasks and submit incentive activities" />
        {activeTab === 'submissions' && (
          <button 
            onClick={openSubmissionModal}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 font-medium transition-colors"
          >
            Submit Activity
          </button>
        )}
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
            Incentive Submissions
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
          emptyMessage="No follow-up tasks scheduled."
          gridColsClass="grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr]" 
        />
      ) : (
        <DataTable 
          columns={submissionColumns} 
          data={activities.sort((a,b) => b.submittedAt - a.submittedAt)} 
          loading={loading} 
          renderRow={renderSubmissionRow} 
          renderMobileCard={() => <div />} 
          emptyMessage="No follow-up activities submitted."
          gridColsClass="grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1.5fr]" 
        />
      )}

      {/* Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Submit Follow-up Activity</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmitActivity} className="p-6">
              <div className="space-y-4">
                <SelectField
                  label="Patient"
                  options={myPatients.map(p => ({ value: p._id, label: p.name }))}
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Completed Sessions"
                    type="number"
                    min="1"
                    value={formData.completedCount}
                    onChange={(e) => setFormData({...formData, completedCount: e.target.value})}
                    required
                  />
                  <InputField
                    label="Required Sessions"
                    type="number"
                    min="1"
                    value={formData.requiredCount}
                    onChange={(e) => setFormData({...formData, requiredCount: e.target.value})}
                    required
                  />
                </div>
                
                <InputField
                  label="Follow-up Date"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                  required
                />
                
                <TextareaField
                  label="Description / Notes"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
                >
                  Submit Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default FollowUpList;
