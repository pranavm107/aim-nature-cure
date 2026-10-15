import React, { useState, useEffect } from 'react';
import therapySessionService from '../../services/therapySessionService';
import therapyService from '../../services/therapyService';
import { patientService } from '../../services/patientService';
import { toast } from 'react-toastify';
import { Clock, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const TherapySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [missedModalOpen, setMissedModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  const [notes, setNotes] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const cleanTime = timeStr.split('.')[0];
      const parts = cleanTime.split(':');
      if (parts.length < 2) return timeStr;
      const hour = parseInt(parts[0], 10);
      const min = parts[1];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12}:${min} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentUserId = localStorage.getItem('userId') || localStorage.getItem('doctorId');
      const role = (localStorage.getItem('userRole') || '').toLowerCase();
      const isAdmin = role === 'admin';

      const [sessRes, therRes, patRes] = await Promise.all([
        therapySessionService.getAllSessions(null, currentUserId),
        therapyService.getAllTherapies('', 0, 1000),
        patientService.getPatients()
      ]);

      let sessionList = Array.isArray(sessRes) ? sessRes : [];
      // Client-side user filtering safeguard: each userId only sees their own assigned sessions
      if (!isAdmin && currentUserId) {
        sessionList = sessionList.filter(s => 
          !s.userId || s.userId === currentUserId || s.docId === currentUserId
        );
      }

      setSessions(sessionList);
      setTherapies(therRes?.success ? therRes.therapies : []);
      setPatients(patRes?.patients || []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTherapyName = (id, item = {}) => {
    if (item.therapyName) return item.therapyName;
    const th = therapies.find(t => (t.uuid || t.id || t._id) === id);
    return th ? th.name : 'Therapy';
  };

  const getPatientName = (id, item = {}) => {
    if (item.patientName) return item.patientName;
    const p = patients.find(p => (p._id === id || p.uuid === id));
    return p ? p.name : 'Patient';
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      await therapySessionService.completeSession(selectedSession._id, notes);
      toast.success('Session marked as completed');
      setCompleteModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to complete session');
    }
  };

  const handleMissed = async (e) => {
    e.preventDefault();
    try {
      await therapySessionService.markSessionMissed(selectedSession._id, notes);
      toast.success('Session marked as missed');
      setMissedModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to mark session as missed');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await therapySessionService.rescheduleSession(selectedSession._id, newDate);
      toast.success('Session rescheduled successfully');
      setRescheduleModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to reschedule session');
    }
  };

  const openCompleteModal = (session) => {
    setSelectedSession(session);
    setNotes('');
    setCompleteModalOpen(true);
  };

  const openMissedModal = (session) => {
    setSelectedSession(session);
    setNotes('');
    setMissedModalOpen(true);
  };

  const openRescheduleModal = (session) => {
    setSelectedSession(session);
    setNewDate(session.scheduledDate || session.sessionDate || '');
    setNewTime(session.scheduledTime || session.sessionTime || '');
    setRescheduleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p>Loading therapy sessions...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Therapy Sessions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage scheduled therapy sessions with complete date & time tracking.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75">
              <th className="p-4 font-semibold text-slate-700 text-sm">Date & Time</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Patient</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Therapy</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((item) => {
              const displayDate = item.scheduledDate || item.sessionDate || '—';
              const displayTime = formatTime(item.scheduledTime || item.sessionTime);

              return (
                <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                  <td className="p-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{displayDate}</span>
                    </div>
                    {displayTime && (
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{displayTime}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-slate-800">{getPatientName(item.patientId, item)}</td>
                  <td className="p-4">
                    <span className="font-medium text-slate-700">{getTherapyName(item.therapyId, item)}</span>
                    {item.sessionNumber && (
                      <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        #{item.sessionNumber}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${
                      item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      item.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      item.status === 'Missed' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-3">
                    {item.status === 'Pending' && (
                      <>
                        <button onClick={() => openCompleteModal(item)} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm transition-colors">Complete</button>
                        <button onClick={() => openMissedModal(item)} className="text-rose-600 hover:text-rose-800 font-medium text-sm transition-colors">Mark Missed</button>
                        <button onClick={() => openRescheduleModal(item)} className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">Reschedule</button>
                      </>
                    )}
                    {item.status === 'Completed' && (
                      <span className="text-slate-400 text-sm font-medium">Done</span>
                    )}
                    {item.status === 'Missed' && (
                      <span className="text-slate-400 text-sm font-medium">Missed</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {sessions.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No sessions found for this user</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Complete Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Complete Session</h2>
            <p className="mb-4 text-sm text-slate-600">Marking <span className="font-bold text-slate-800">{getTherapyName(selectedSession?.therapyId)}</span> for {getPatientName(selectedSession?.patientId)} as completed.</p>
            <form onSubmit={handleComplete}>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2">Completion Notes / Outcome</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional notes about the session..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setCompleteModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Mark Completed</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Missed Modal */}
      {missedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Mark Session Missed</h2>
            <p className="mb-4 text-sm text-slate-600">Marking <span className="font-bold text-slate-800">{getTherapyName(selectedSession?.therapyId)}</span> for {getPatientName(selectedSession?.patientId)} as missed.</p>
            <form onSubmit={handleMissed}>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2">Reason / Notes</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Reason for missing the session..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setCompleteModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors">Mark Missed</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Reschedule Session</h2>
            <form onSubmit={handleReschedule}>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2">New Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setRescheduleModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapySessions;
