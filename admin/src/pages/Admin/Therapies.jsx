import React, { useState, useEffect, useCallback } from 'react';
import therapyService from '../../services/therapyService';
import { toast } from 'react-toastify';
import { Search } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

const Therapies = () => {
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTherapy, setEditingTherapy] = useState(null);
  const [formData, setFormData] = useState({ name: '', duration: '', price: '', active: true });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [therapyToDelete, setTherapyToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTherapies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await therapyService.getAllTherapies(debouncedSearch, page, size);
      if (data.success) {
        setTherapies(data.therapies);
        setTotalElements(data.totalElements);
      } else {
        toast.error(data.message || 'Failed to load therapies');
      }
    } catch (err) {
      toast.error('Failed to load therapies');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, size]);

  useEffect(() => {
    fetchTherapies();
  }, [fetchTherapies]);

  const openModal = (therapy = null) => {
    if (therapy) {
      setEditingTherapy(therapy);
      setFormData({ 
        name: therapy.name, 
        duration: therapy.duration, 
        price: therapy.price, 
        active: therapy.active !== undefined ? therapy.active : therapy.status 
      });
    } else {
      setEditingTherapy(null);
      setFormData({ name: '', duration: '', price: '', active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTherapy(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTherapy) {
        const payload = {
          uuid: editingTherapy.uuid || editingTherapy.id || editingTherapy._id,
          name: formData.name,
          duration: formData.duration,
          price: formData.price,
          active: formData.active
        };
        const res = await therapyService.updateTherapy(payload);
        if (res.success) {
          toast.success('Therapy updated successfully');
          closeModal();
          fetchTherapies();
        } else {
          toast.error(res.message || 'Failed to update therapy');
        }
      } else {
        const res = await therapyService.createTherapy(formData);
        if (res.success) {
          toast.success('Therapy created successfully');
          closeModal();
          fetchTherapies();
        } else {
          toast.error(res.message || 'Failed to create therapy');
        }
      }
    } catch (err) {
      toast.error('Failed to save therapy');
    }
  };

  const openDeleteModal = (therapy) => {
    setTherapyToDelete(therapy);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!therapyToDelete) return;
    try {
      const therapyId = therapyToDelete.uuid || therapyToDelete.id || therapyToDelete._id;
      const res = await therapyService.deleteTherapy(therapyId);
      if (res.success) {
        toast.success('Therapy deleted successfully');
        setDeleteModalOpen(false);
        setTherapyToDelete(null);
        
        // Handle pagination correctly if deleting the last item on current page
        if (therapies.length === 1 && page > 0) {
          setPage(p => p - 1);
        } else {
          fetchTherapies();
        }
      } else {
        toast.error(res.message || 'Failed to delete therapy');
      }
    } catch (err) {
      toast.error('Failed to delete therapy');
    }
  };

  const toggleStatus = async (therapy) => {
    try {
      const payload = {
        uuid: therapy.uuid || therapy.id || therapy._id,
        name: therapy.name,
        duration: therapy.duration,
        price: therapy.price,
        active: therapy.active !== undefined ? !therapy.active : !therapy.status
      };
      const res = await therapyService.updateTherapy(payload);
      if (res.success) {
        toast.success(`Therapy ${payload.active ? 'activated' : 'deactivated'}`);
        fetchTherapies();
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Therapy Master" subtitle="Manage all therapies" />
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Add New Therapy
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by therapy name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-700 text-sm">Therapy Name</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Duration (mins)</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Price ($)</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && therapies.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td>
              </tr>
            ) : therapies.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No therapies found</td>
              </tr>
            ) : (
              therapies.map((item) => {
                const isActive = item.active !== undefined ? item.active : item.status;
                return (
                  <tr key={item.uuid || item.id || item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                    <td className="p-4 font-medium text-slate-800">{item.name}</td>
                    <td className="p-4">{item.duration}</td>
                    <td className="p-4">${item.price}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(item)}
                        className={`px-3 py-1 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 flex gap-3 justify-end">
                      <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      <button onClick={() => openDeleteModal(item)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                    </td>
                  </tr>
                );
              })
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">{editingTherapy ? 'Edit Therapy' : 'Add New Therapy'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2">Therapy Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block text-slate-700 text-sm font-bold mb-2">Duration (mins)</label>
                  <input 
                    type="number" 
                    required min="1"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-slate-700 text-sm font-bold mb-2">Price</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value.replace(/[^0-9.]/g, '')})}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <span className="text-sm font-bold text-slate-700">Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Delete Therapy</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-800">{therapyToDelete?.name}</span>? This action cannot be undone.
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

export default Therapies;
