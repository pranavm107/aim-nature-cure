import React from 'react';
import { X, Calendar, User, Stethoscope, Tag, AlertTriangle, CheckCircle, Clock, XCircle, FileText, Edit3, Trash2, ExternalLink } from 'lucide-react';
import Badge from '../common/Badge';
import { useNavigate } from 'react-router-dom';

const FollowUpViewModal = ({ isOpen, onClose, followUp, onEditStatus, onDelete }) => {
  const navigate = useNavigate();

  if (!isOpen || !followUp) return null;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return <Badge variant="neutral">{status || 'Unknown'}</Badge>;
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio?.toLowerCase()) {
      case 'high':
        return <Badge variant="danger">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>;
      default:
        return <Badge variant="neutral">{prio || 'Normal'}</Badge>;
    }
  };

  const isOverdue = followUp.dueDate && new Date(followUp.dueDate) < new Date() && followUp.status !== 'Completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Follow-Up Details</h3>
              <p className="text-xs text-slate-500">View complete call records & status</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Patient Card Banner */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patient</p>
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                <User className="w-4 h-4 text-primary" />
                {followUp.patientName || 'Unknown Patient'}
              </h4>
            </div>
            {followUp.patientId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/patient/${followUp.patientId}`);
                }}
                className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-primary/20 shadow-xs hover:border-primary/40 transition-colors"
              >
                View Patient <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Key metadata grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </span>
              <div>{getStatusBadge(followUp.status)}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </span>
              <div>{getPriorityBadge(followUp.priority)}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due Date
              </span>
              <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                {followUp.dueDate ? new Date(followUp.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                {isOverdue && <span className="text-[10px] font-bold text-red-500 block">Overdue</span>}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> Assigned Doctor
              </span>
              <p className="text-sm font-semibold text-slate-800 truncate">
                {followUp.doctorName || followUp.doctorId || 'Unassigned'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Follow-Up Type
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {followUp.type || 'Treatment Follow-up'}
              </p>
            </div>
          </div>

          {/* Description / Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Call Description & Notes
              </span>
              {followUp.modifiedAt && (
                <span className="text-[11px] text-slate-400">
                  Last updated: {new Date(followUp.modifiedAt).toLocaleDateString('en-GB')}
                </span>
              )}
            </div>

            {followUp.description ? (
              <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed shadow-xs">
                {followUp.description}
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-2">No description or call notes recorded yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditStatus?.(followUp);
                  }}
                  className="text-xs font-semibold text-primary hover:text-primary-dark underline inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Add call notes now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(followUp);
                }}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Follow-Up
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            {onEditStatus && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditStatus(followUp);
                }}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Update Status / Notes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpViewModal;
