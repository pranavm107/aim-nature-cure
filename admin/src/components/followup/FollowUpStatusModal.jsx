import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, XCircle, PhoneCall, AlertCircle, FileText, User, Calendar, Stethoscope } from 'lucide-react';
import { followUpService } from '../../services/followUpService';
import { toast } from 'react-toastify';

const QUICK_SUGGESTIONS = [
  "Patient confirmed complete relief",
  "Patient feeling better, continue treatment",
  "Symptoms persisting, advised clinic consultation",
  "Patient requested rescheduling",
  "Call unanswered, will retry tomorrow",
  "Routine check-up completed successfully"
];

const FollowUpStatusModal = ({ isOpen, onClose, followUp, initialStatus, onSuccess }) => {
  const [status, setStatus] = useState('Completed');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && followUp) {
      setStatus(initialStatus || followUp.status || 'Completed');
      setDescription(followUp.description || '');
    }
  }, [isOpen, followUp, initialStatus]);

  if (!isOpen || !followUp) return null;

  const followUpId = followUp.uuid || followUp.id || followUp._id;

  const handleApplySuggestion = (text) => {
    if (!description.trim()) {
      setDescription(text);
    } else {
      setDescription((prev) => `${prev.trim()}\n• ${text}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await followUpService.updateFollowUpStatus(followUpId, status, description.trim());
      if (res.success) {
        toast.success(res.message || 'Follow-up status and description updated');
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || 'Failed to update follow-up');
      }
    } catch (err) {
      toast.error('Failed to update follow-up status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusOptionStyle = (val) => {
    const isSelected = status === val;
    if (val === 'Completed') {
      return isSelected
        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
        : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-700';
    }
    if (val === 'Pending') {
      return isSelected
        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
        : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-slate-700';
    }
    if (val === 'Cancelled') {
      return isSelected
        ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
        : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 text-slate-700';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Update Follow-Up Status</h3>
              <p className="text-xs text-slate-500">Record call description & update outcome</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Follow-up Context Pill */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                {followUp.patientName || 'Patient'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Due: {followUp.dueDate ? new Date(followUp.dueDate).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                Doctor: <strong className="text-slate-700 font-medium">{followUp.doctorName || 'Unassigned'}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                {followUp.type || 'Treatment Follow-up'}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('Pending')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${getStatusOptionStyle('Pending')}`}
              >
                <Clock className="w-4 h-4" />
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatus('Completed')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${getStatusOptionStyle('Completed')}`}
              >
                <CheckCircle className="w-4 h-4" />
                Completed
              </button>
              <button
                type="button"
                onClick={() => setStatus('Cancelled')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${getStatusOptionStyle('Cancelled')}`}
              >
                <XCircle className="w-4 h-4" />
                Cancelled
              </button>
            </div>
          </div>

          {/* Description / Notes Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Call Description & Notes
              </label>
              <span className="text-[11px] text-slate-400">
                {description.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred during the follow-up call, patient response, prescribed adjustments, or reasons for this status..."
              className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 placeholder:text-slate-400 bg-white"
            />

            {/* Quick Suggestions Chips */}
            <div className="mt-2.5">
              <p className="text-[11px] font-medium text-slate-400 mb-1.5">Quick suggestion templates:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplySuggestion(sug)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-colors text-left"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save & Update</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUpStatusModal;
