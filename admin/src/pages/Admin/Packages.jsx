import React, { useState, useEffect } from 'react';
import packageService from '../../services/packageService';
import therapyService from '../../services/therapyService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [availableTherapies, setAvailableTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgs, thers] = await Promise.all([
        packageService.getAllPackages(),
        therapyService.getAllTherapies()
      ]);
      setPackages(pkgs);
      setAvailableTherapies(thers);
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (pkg) => {
    try {
      await packageService.updateStatus(pkg._id, !pkg.status);
      toast.success(`Package ${!pkg.status ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getTherapyName = (id) => {
    const th = availableTherapies.find(t => t._id === id);
    return th ? th.name : 'Unknown Therapy';
  };

  const columns = [
    { label: 'Name' },
    { label: 'Included Therapies' },
    { label: 'Price ($)' },
    { label: 'Status' },
    { label: 'Actions' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[2fr_3fr_1fr_1fr_1fr] py-3 px-6 border-b border-slate-100 items-center text-sm hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/packages/${item._id}`)}>
      <p className="font-medium text-slate-800">{item.name}</p>
      <div>
        <ul className="text-xs text-slate-600 list-disc list-inside">
          {item.therapies.map((t, idx) => (
            <li key={idx}>{getTherapyName(t.therapyId)} (x{t.count})</li>
          ))}
        </ul>
      </div>
      <p className="text-slate-700">${item.price}</p>
      <div>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleStatus(item); }}
          className={`px-3 py-1 rounded text-xs font-medium ${item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {item.status ? 'Active' : 'Inactive'}
        </button>
      </div>
      <div>
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/packages/${item._id}`); }} 
          className="text-primary hover:text-primary/80 font-medium"
        >
          View
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Package Master" subtitle="Manage treatment packages" />
        <button onClick={() => navigate('/admin/packages/add')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Add New Package
        </button>
      </div>

      <DataTable 
        columns={columns}
        data={packages}
        renderRow={renderRow}
        renderMobileCard={() => <div/>}
        loading={loading}
        emptyMessage="No packages found."
        gridColsClass="grid-cols-[2fr_3fr_1fr_1fr_1fr]"
      />
    </PageContainer>
  );
};

export default Packages;
