import React, { useState, useEffect } from 'react';
import { followUpService } from '../../services/followUpService';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';

const FollowUpSection = ({ patientId, refreshTrigger }) => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await followUpService.getFollowUps('', 0, 1000);
      if (res.success) {
        // Filter locally since there's no specific patient endpoint provided
        const patientFollowUps = res.followUps.filter(f => f.patientId === patientId);
        setFollowUps(patientFollowUps.sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate)));
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await followUpService.updateFollowUpStatus(id, newStatus);
      if (res.success) {
        toast.success(`Follow-up marked as ${newStatus}`);
        fetchFollowUps();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'cancelled': return <Badge variant="neutral">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status || 'Unknown'}</Badge>;
    }
  };

  const renderFollowUpCard = (fu) => (
    <div key={fu.uuid || fu.id || fu._id} className={`border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between ${fu.status === 'Completed' ? 'border-green-200 bg-gray-50' : 'border-gray-200'}`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-800">{fu.type || 'Standard'}</h4>
            {fu.priority === 'Urgent' && <span className="bg-red-100 text-red-700 text-[10px] uppercase font-bold px-1.5 rounded">Urgent</span>}
          </div>
          {getStatusBadge(fu.status)}
        </div>
        
        <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          {fu.dueDate ? new Date(fu.dueDate).toLocaleDateString('en-GB') : 'N/A'}
        </p>
      </div>

      {fu.status !== 'Completed' && fu.status !== 'Cancelled' && (
        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
          <button onClick={() => handleStatusChange(fu.uuid || fu.id || fu._id, 'Cancelled')} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-transparent transition-colors">Cancel</button>
          <button onClick={() => handleStatusChange(fu.uuid || fu.id || fu._id, 'Completed')} className="px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded shadow-sm transition-colors font-medium">Mark Completed</button>
        </div>
      )}
    </div>
  );

  const active = followUps.filter(f => f.status !== 'Completed' && f.status !== 'Cancelled');
  const past = followUps.filter(f => f.status === 'Completed' || f.status === 'Cancelled');

  if (loading) return <div className="text-sm text-gray-500">Loading follow-ups...</div>;

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Patient Follow-ups</h2>

      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Active Follow-ups</h3>
        {active.length === 0 ? (
          <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded border border-dashed border-gray-300">No active follow-ups scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map(renderFollowUpCard)}
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
    </div>
  );
};

export default FollowUpSection;
