import React, { useState, useEffect, useCallback, useContext } from 'react';
import { followUpService } from '../../services/followUpService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const FollowUpList = () => {
  const { profileData } = useContext(DoctorContext);
  
  // Data
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await followUpService.getFollowUps(debouncedSearch, page, size);
      if (res.success) {
        setFollowUps(res.followUps);
        setTotalElements(res.totalElements);
      } else {
        toast.error(res.message || "Failed to load follow-ups");
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await followUpService.updateFollowUpStatus(id, newStatus);
      if (res.success) {
        toast.success(res.message);
        fetchData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const openDeleteModal = (followUp) => {
    setFollowUpToDelete(followUp);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!followUpToDelete) return;
    try {
      const followUpId = followUpToDelete.uuid || followUpToDelete.id || followUpToDelete._id;
      const res = await followUpService.deleteFollowUp(followUpId);
      if (res.success) {
        toast.success(res.message || 'Follow-up deleted successfully');
        setDeleteModalOpen(false);
        setFollowUpToDelete(null);
        
        if (followUps.length === 1 && page > 0) {
          setPage(p => p - 1);
        } else {
          fetchData();
        }
      } else {
        toast.error(res.message || 'Failed to delete follow-up');
      }
    } catch (err) {
      toast.error('Failed to delete follow-up');
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio?.toLowerCase()) {
      case 'high': return <Badge variant="danger">High</Badge>;
      case 'medium': return <Badge variant="warning">Medium</Badge>;
      default: return <Badge variant="neutral">{prio || 'Low'}</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Follow-Ups" subtitle="Manage and monitor patient follow-up tasks" />
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by patient name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-700 text-sm">Due Date</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Patient Name</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Doctor</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Type</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Priority</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && followUps.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">Loading...</td>
              </tr>
            ) : followUps.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">No follow-ups found</td>
              </tr>
            ) : (
              followUps.map((item) => (
                <tr key={item.uuid || item.id || item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                  <td className="p-4">
                    <p className={new Date(item.dueDate) < new Date() && item.status !== 'Completed' ? 'text-red-500 font-medium' : ''}>
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800 hover:text-primary cursor-pointer" onClick={() => navigate(`/patient/${item.patientId}`)}>
                      {item.patientName || 'Unknown'}
                    </p>
                  </td>
                  <td className="p-4">{item.doctorName || item.doctorId || 'Unassigned'}</td>
                  <td className="p-4 text-slate-600">{item.type || 'Standard'}</td>
                  <td className="p-4">{getPriorityBadge(item.priority)}</td>
                  <td className="p-4">
                    <select
                      value={item.status || 'Pending'}
                      onChange={(e) => handleStatusChange(item.uuid || item.id || item._id, e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary bg-white text-slate-700"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 flex gap-3 justify-end items-center">
                    <button 
                      onClick={() => openDeleteModal(item)} 
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalElements > size && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 mt-4">
           <span className="text-sm text-slate-500">
             Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements}
           </span>
           <div className="flex gap-2">
             <button 
               disabled={page === 0} 
               onClick={() => setPage(p => p - 1)}
               className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
             >
               Previous
             </button>
             <button 
               disabled={(page + 1) * size >= totalElements} 
               onClick={() => setPage(p => p + 1)}
               className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
             >
               Next
             </button>
           </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Delete Follow-Up</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete the follow-up for <span className="font-semibold text-slate-800">{followUpToDelete?.patientName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Confirm Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default FollowUpList;
