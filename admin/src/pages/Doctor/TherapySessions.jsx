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

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700">Date</th>
              <th className="p-4 font-semibold text-gray-700">Patient</th>
              <th className="p-4 font-semibold text-gray-700">Therapy</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4">{item.scheduledDate}</td>
                <td className="p-4 font-medium text-gray-800">{getPatientName(item.patientId)}</td>
                <td className="p-4">{getTherapyName(item.therapyId)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 flex gap-3">
                  {item.status === 'Pending' && (
                    <>
                      <button onClick={() => openCompleteModal(item)} className="text-green-600 hover:text-green-800 font-medium text-sm">Complete</button>
                      <button onClick={() => openRescheduleModal(item)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Reschedule</button>
                    </>
                  )}
                  {item.status === 'Completed' && (
                    <span className="text-gray-400 text-sm">Done</span>
                  )}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">No sessions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Complete Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Complete Session</h2>
            <p className="mb-4 text-sm text-gray-600">Marking <span className="font-bold">{getTherapyName(selectedSession?.therapyId)}</span> for {getPatientName(selectedSession?.patientId)} as completed.</p>
            <form onSubmit={handleComplete}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Completion Notes / Outcome</label>
                <textarea 
                  className="w-full border rounded px-3 py-2 h-24"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional notes about the session..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setCompleteModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Mark Completed</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Reschedule Session</h2>
            <form onSubmit={handleReschedule}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">New Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full border rounded px-3 py-2"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setRescheduleModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapySessions;
