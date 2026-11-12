import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { followUpService } from '../../services/followUpService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

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
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const tableTopRef = useRef(null);
  const tableContainerRef = useRef(null);

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
        const fetchedList = res.followUps || [];
        setFollowUps(fetchedList);
        const total = typeof res.totalElements === 'number' && res.totalElements > 0
          ? res.totalElements
          : fetchedList.length;
        setTotalElements(total);
        setTotalPages(
          typeof res.totalPages === 'number' && res.totalPages > 0
            ? res.totalPages
            : (total > 0 ? Math.ceil(total / size) : 1)
        );
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

  // Handle page change and scroll smoothly to top of table
  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    <PageContainer className="pb-16">
      <div ref={tableTopRef}>
        <PageHeader 
          title="Follow-Ups" 
          subtitle="Manage and monitor patient follow-up tasks"
          actions={
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-60"
              title="Refresh follow-ups"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'text-slate-500'}`} />
              <span>Refresh</span>
            </button>
          }
        />
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

        {/* Page size dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Show:</span>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
              if (tableContainerRef.current) {
                tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-700 bg-white"
            title="Items per page"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-4">
        <div 
          ref={tableContainerRef}
          className="overflow-x-auto overflow-y-auto max-h-[62vh] custom-scrollbar"
        >
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Doctor</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span className="font-medium">Loading follow-ups...</span>
                    </div>
                  </td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    No follow-ups found
                  </td>
                </tr>
              ) : (
                followUps.map((item, index) => (
                  <tr key={item.uuid || item.id || item._id || index} className="hover:bg-slate-50 transition-colors text-slate-600">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                      {page * size + index + 1}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className={new Date(item.dueDate) < new Date() && item.status !== 'Completed' ? 'text-red-500 font-medium' : ''}>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800 hover:text-primary cursor-pointer" onClick={() => navigate(`/patient/${item.patientId}`)}>
                        {item.patientName || 'Unknown'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{item.doctorName || item.doctorId || 'Unassigned'}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">{item.type || 'Standard'}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{getPriorityBadge(item.priority)}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={item.status || 'Pending'}
                        onChange={(e) => handleStatusChange(item.uuid || item.id || item._id, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:border-primary bg-white text-slate-700"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => openDeleteModal(item)} 
                        className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
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
      </div>

      {/* Pagination Controls */}
      {!loading && totalElements > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-5 py-3.5 border border-slate-200 rounded-xl shadow-sm gap-3">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{totalElements === 0 ? 0 : page * size + 1}</span> to <span className="font-semibold text-slate-700">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-semibold text-slate-700">{totalElements}</span> follow-ups
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium inline-flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-700">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium inline-flex items-center gap-1 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
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
