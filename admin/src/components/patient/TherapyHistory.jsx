import React, { useState, useEffect } from 'react';
import therapySessionService from '../../services/therapySessionService';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';

const TherapyHistory = ({ patientId }) => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, upcoming: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Unique therapy types for filter dropdown
  const [therapyTypes, setTherapyTypes] = useState([]);

  // Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTherapyHistory();
  }, [patientId]);

  const fetchTherapyHistory = async () => {
    setLoading(true);
    try {
      const res = await therapySessionService.getPatientTherapyHistory(patientId);
      if (res.success) {
        setSessions(res.sessions);
        setStats(res.stats);
        
        // Extract unique therapy names
        const types = [...new Set(res.sessions.map(s => s.therapyName))];
        setTherapyTypes(types);

        applyFilters(res.sessions, 'All', 'All', '');
      }
    } catch (err) {
      toast.error("Failed to load therapy history");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data, status, type, query) => {
    let result = [...data];

    if (status !== 'All') {
      result = result.filter(s => s.status === status);
    }

    if (type !== 'All') {
      result = result.filter(s => s.therapyName === type);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(s => 
        s.therapyName.toLowerCase().includes(q) || 
        s.doctorName.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    setFilteredSessions(result);
  };

  useEffect(() => {
    applyFilters(sessions, filterStatus, filterType, searchQuery);
  }, [filterStatus, filterType, searchQuery]);

  const getStatusBadgeVariant = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'in progress': return 'info';
      case 'cancelled': 
      case 'no show': return 'danger';
      default: return 'neutral';
    }
  };

  const openSessionDetails = (session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  if (loading) {
    return <div className="bg-white border rounded-xl p-6 shadow-sm text-center py-10 text-gray-500">Loading therapy history...</div>;
  }

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b pb-4 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Therapy History</h2>
          <p className="text-sm text-gray-500 mt-1">Complete historical record of all prescribed therapies.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.upcoming}</p>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Upcoming</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input 
          type="text" 
          placeholder="Search therapy or notes..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
        />
        <select 
          value={filterType} 
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
        >
          <option value="All">All Therapies</option>
          {therapyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Upcoming/Pending</option>
          <option value="Cancelled">Cancelled</option>
          <option value="No Show">No Show</option>
        </select>
      </div>

      {/* Therapy Timeline View */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed">
          <p>No therapy sessions found matching the criteria.</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 ml-3 mt-4">
          {filteredSessions.map((session) => (
            <div key={session._id} className="relative group">
              <div className="absolute -left-[35px] bg-teal-50 text-teal-600 p-1.5 rounded-full border border-teal-100 shadow-sm z-10 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              
              <div 
                onClick={() => openSessionDetails(session)}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : new Date(session.date).toLocaleDateString()}
                      </span>
                      <Badge variant={getStatusBadgeVariant(session.status)}>{session.status === 'Pending' ? 'Scheduled' : session.status}</Badge>
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg">{session.therapyName}</h4>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {session.duration} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {session.doctorName}
                      </span>
                    </p>
                  </div>
                  {session.notes && (
                    <div className="sm:w-1/3 bg-gray-50 p-3 rounded text-sm text-gray-700 italic border-l-4 border-gray-200">
                      "{session.notes.length > 80 ? session.notes.substring(0, 80) + '...' : session.notes}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Therapy Details Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-teal-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-teal-900">Therapy Details</h3>
              <button onClick={() => setShowModal(false)} className="text-teal-600 hover:text-teal-800 transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-gray-800">{selectedSession.therapyName}</h4>
                  <p className="text-sm text-gray-500 mt-1">ID: {selectedSession._id}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedSession.status)}>{selectedSession.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6 bg-gray-50 p-4 rounded-lg border">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Scheduled Date</p>
                  <p className="font-medium text-gray-800">{selectedSession.scheduledDate ? new Date(selectedSession.scheduledDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Duration</p>
                  <p className="font-medium text-gray-800">{selectedSession.duration} Minutes</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Assigned Doctor / Therapist</p>
                  <p className="font-medium text-gray-800">{selectedSession.doctorName}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Session Notes & Outcome</p>
                {selectedSession.notes ? (
                  <div className="bg-white border rounded-lg p-3 text-gray-700 text-sm whitespace-pre-wrap">
                    {selectedSession.notes}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded border border-dashed">No notes recorded for this session.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyHistory;
