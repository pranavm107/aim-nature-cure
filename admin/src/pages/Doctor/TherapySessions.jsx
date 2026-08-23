import React, { useState, useEffect } from 'react';
import therapySessionService from '../../services/therapySessionService';
import therapyService from '../../services/therapyService';
import { patientService } from '../../services/patientService';
import { toast } from 'react-toastify';

const TherapySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  const [notes, setNotes] = useState('');
  const [newDate, setNewDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, therRes, patRes] = await Promise.all([
        therapySessionService.getAllSessions(),
        therapyService.getAllTherapies(),
        patientService.getPatients()
      ]);
      setSessions(sessRes);
      setTherapies(therRes);
      setPatients(patRes.patients);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTherapyName = (id) => {
    const th = therapies.find(t => t._id === id);
    return th ? th.name : 'Unknown';
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? p.name : 'Unknown';
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

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate) return toast.error("Select a date");
    try {
      await therapySessionService.rescheduleSession(selectedSession._id, newDate);
      toast.success('Session rescheduled');
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

  const openRescheduleModal = (session) => {
    setSelectedSession(session);
    setNewDate(session.scheduledDate);
    setRescheduleModalOpen(true);
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="m-5">
      <h1 className="text-2xl font-medium mb-5">Therapy Sessions</h1>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-700 text-sm">Date</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Patient</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Therapy</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((item) => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                <td className="p-4">{item.scheduledDate}</td>
                <td className="p-4 font-medium text-slate-800">{getPatientName(item.patientId)}</td>
                <td className="p-4">{getTherapyName(item.therapyId)}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${
                    item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    item.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 flex gap-3">
                  {item.status === 'Pending' && (
                    <>
                      <button onClick={() => openCompleteModal(item)} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm transition-colors">Complete</button>
                      <button onClick={() => openRescheduleModal(item)} className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">Reschedule</button>
                    </>
                  )}
                  {item.status === 'Completed' && (
                    <span className="text-slate-400 text-sm font-medium">Done</span>
                  )}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No sessions found</td>
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
