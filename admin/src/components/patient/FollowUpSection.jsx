import React, { useState, useEffect } from 'react';
import { followUpService } from '../../services/followUpService';
import Modal from '../common/Modal';
import { InputField, TextareaField, PrimaryButton } from '../common/FormFields';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';

const FollowUpSection = ({ patientId, refreshTrigger }) => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedFu, setSelectedFu] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await followUpService.getPatientFollowUps(patientId);
      if (res.success) {
        setFollowUps(res.followUps.sort((a,b) => b.date - a.date)); // descending date
      }
    } catch (err) {
      toast.error("Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [patientId, refreshTrigger]);

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate) {
      toast.warn("Please select a new date.");
      return;
    }
    setProcessing(true);
    try {
      const res = await followUpService.rescheduleFollowUp(selectedFu._id, rescheduleDate, rescheduleReason);
      if (res.success) {
        toast.success("Follow-up rescheduled");
        setRescheduleModalOpen(false);
        fetchFollowUps();
      }
    } catch (err) {
      toast.error("Failed to reschedule");
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await followUpService.completeFollowUp(selectedFu._id, completionNotes);
      if (res.success) {
        toast.success("Follow-up marked as completed");
        setCompleteModalOpen(false);
        fetchFollowUps();
      }
    } catch (err) {
      toast.error("Failed to complete follow-up");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (fu) => {
    if (window.confirm("Are you sure you want to cancel this follow-up?")) {
      try {
        const res = await followUpService.cancelFollowUp(fu._id, "Cancelled manually");
        if (res.success) {
          toast.success("Follow-up cancelled");
          fetchFollowUps();
        }
      } catch (err) {
        toast.error("Failed to cancel");
      }
    }
  };

  const openReschedule = (fu) => {
    setSelectedFu(fu);
    setRescheduleDate(new Date(fu.date).toISOString().split('T')[0]);
    setRescheduleReason('');
    setRescheduleModalOpen(true);
  };

  const openComplete = (fu) => {
    setSelectedFu(fu);
    setCompletionNotes('');
    setCompleteModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled': return <Badge variant="primary">Scheduled</Badge>;
      case 'Overdue': return <Badge variant="danger">Overdue</Badge>;
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'Cancelled': return <Badge variant="neutral">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderFollowUpCard = (fu) => (
    <div key={fu._id} className={`border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between
      ${fu.status === 'Overdue' ? 'border-red-300' : ''} 
      ${fu.status === 'Completed' ? 'border-green-200 bg-gray-50' : 'border-gray-200'}`}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-800">{fu.type}</h4>
            {fu.priority === 'Urgent' && <span className="bg-red-100 text-red-700 text-[10px] uppercase font-bold px-1.5 rounded">Urgent</span>}
          </div>
          {getStatusBadge(fu.status)}
        </div>
        
        <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          {new Date(fu.date).toLocaleDateString()}
        </p>
        
        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{fu.notes || 'No notes provided.'}</p>
        
        {fu.consultationId && (
          <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded inline-block">
            Created from Consultation
          </p>
        )}

        {fu.status === 'Completed' && fu.completionNotes && (
          <div className="mt-3 p-2 bg-green-50 border border-green-100 rounded text-sm text-green-800">
            <strong>Completion Notes:</strong> {fu.completionNotes}
          </div>
        )}
      </div>

      {(fu.status === 'Scheduled' || fu.status === 'Overdue') && (
        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
          <button onClick={() => handleCancel(fu)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-transparent transition-colors">Cancel</button>
          <button onClick={() => openReschedule(fu)} className="px-3 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors font-medium">Reschedule</button>
          <button onClick={() => openComplete(fu)} className="px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded shadow-sm transition-colors font-medium">Mark Completed</button>
        </div>
      )}
    </div>
  );

  const upcoming = followUps.filter(f => f.status === 'Scheduled');
  const overdue = followUps.filter(f => f.status === 'Overdue');
  const past = followUps.filter(f => f.status === 'Completed' || f.status === 'Cancelled');

  if (loading) return <div className="text-sm text-gray-500">Loading follow-ups...</div>;

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Patient Follow-ups</h2>
      
      {overdue.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3">Overdue Follow-ups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdue.map(renderFollowUpCard)}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Upcoming Follow-ups</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded border border-dashed border-gray-300">No upcoming follow-ups scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map(renderFollowUpCard)}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Past Follow-ups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 hover:opacity-100 transition-opacity">
            {past.map(renderFollowUpCard)}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal isOpen={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} title="Reschedule Follow-up">
        <form onSubmit={handleReschedule} className="flex flex-col gap-4">
          <InputField 
            label="New Date *" 
            type="date"
            value={rescheduleDate} 
            onChange={e => setRescheduleDate(e.target.value)} 
            required 
          />
          <TextareaField 
            label="Reason for Reschedule" 
            value={rescheduleReason} 
            onChange={e => setRescheduleReason(e.target.value)} 
            placeholder="Why is this being rescheduled?"
            rows={2}
          />
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button type="button" onClick={() => setRescheduleModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <PrimaryButton type="submit" disabled={processing}>{processing ? 'Processing...' : 'Reschedule'}</PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Complete Modal */}
      <Modal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} title="Complete Follow-up">
        <form onSubmit={handleComplete} className="flex flex-col gap-4">
          <div className="bg-blue-50 p-3 rounded border text-sm text-blue-900 mb-2">
            <p><strong>Follow-up:</strong> {selectedFu?.type}</p>
            <p><strong>Date:</strong> {selectedFu ? new Date(selectedFu.date).toLocaleDateString() : ''}</p>
          </div>
          <TextareaField 
            label="Completion Notes" 
            value={completionNotes} 
            onChange={e => setCompletionNotes(e.target.value)} 
            placeholder="Outcome of the follow-up, patient status, etc."
            rows={3}
            required
          />
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button type="button" onClick={() => setCompleteModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <PrimaryButton type="submit" disabled={processing}>{processing ? 'Processing...' : 'Mark as Completed'}</PrimaryButton>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default FollowUpSection;
