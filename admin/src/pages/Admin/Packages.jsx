import React, { useState, useEffect, useCallback } from 'react';
import packageService from '../../services/packageService';
import therapyService from '../../services/therapyService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { Search } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [availableTherapies, setAvailableTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

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
      const [pkgsRes, thersRes] = await Promise.all([
        packageService.getAllPackages(debouncedSearch, page, size),
        therapyService.getAllTherapies('', 0, 1000)
      ]);
      
      if (pkgsRes.success) {
        setPackages(pkgsRes.packages);
        setTotalElements(pkgsRes.totalElements);
      } else {
        toast.error(pkgsRes.message || 'Failed to load packages');
      }
      
      setAvailableTherapies(thersRes?.success ? thersRes.therapies : []);
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatus = async (pkg) => {
    try {
      const payload = {
        uuid: pkg.uuid || pkg.id || pkg._id,
        packageName: pkg.packageName || pkg.name,
        price: pkg.price,
        active: pkg.active !== undefined ? !pkg.active : !pkg.status,
        therapies: pkg.therapies
      };
      const res = await packageService.updatePackage(payload);
      if (res.success) {
        toast.success(`Package ${payload.active ? 'activated' : 'deactivated'}`);
        fetchData();
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openDeleteModal = (pkg) => {
    setPackageToDelete(pkg);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    try {
      const pkgId = packageToDelete.uuid || packageToDelete.id || packageToDelete._id;
      const res = await packageService.deletePackage(pkgId);
      if (res.success) {
        toast.success('Package deleted successfully');
        setDeleteModalOpen(false);
        setPackageToDelete(null);
        
        if (packages.length === 1 && page > 0) {
          setPage(p => p - 1);
        } else {
          fetchData();
        }
      } else {
        toast.error(res.message || 'Failed to delete package');
      }
    } catch (err) {
      toast.error('Failed to delete package');
    }
  };

  const getTherapyName = (id) => {
    const th = availableTherapies.find(t => (t.uuid || t.id || t._id) === id);
    return th ? th.name : 'Unknown Therapy';
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Package Master" subtitle="Manage treatment packages" />
        <button onClick={() => navigate('/admin/packages/add')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Add New Package
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by package name..."
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
              <th className="p-4 font-semibold text-slate-700 text-sm">Package Name</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Included Therapies</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Price ($)</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && packages.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td>
              </tr>
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No packages found</td>
              </tr>
            ) : (
              packages.map((item) => {
                const isActive = item.active !== undefined ? item.active : item.status;
                return (
                  <tr key={item.uuid || item.id || item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600 cursor-pointer" onClick={() => navigate(`/admin/packages/${item.uuid || item.id || item._id}`)}>
                    <td className="p-4 font-medium text-slate-800">{item.packageName || item.name}</td>
                    <td className="p-4">
                      <ul className="text-xs text-slate-600 list-disc list-inside">
                        {item.therapies && item.therapies.map((t, idx) => (
                          <li key={idx}>{getTherapyName(t.therapyId)} (x{t.quantity || t.count})</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">${item.price}</td>
                    <td className="p-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStatus(item); }}
                        className={`px-3 py-1 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 flex gap-3 justify-end items-center h-full">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/packages/${item.uuid || item.id || item._id}`); }} 
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }} 
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
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

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Delete Package</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-800">{packageToDelete?.packageName || packageToDelete?.name}</span>? This action cannot be undone.
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

export default Packages;
