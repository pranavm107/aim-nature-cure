import React, { useState, useEffect } from 'react';
import packageService from '../../services/packageService';
import therapyService from '../../services/therapyService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';

import { useTableFeatures } from '../../hooks/useTableFeatures';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

  const {
    searchTerm, setSearchTerm,
    filters, handleFilterChange,
    sortConfig, handleSort,
    processedData
  } = useTableFeatures(packages, ['name'], { key: 'name', direction: 'asc' });

  const renderSortIcon = (key) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 inline" /> : <ArrowDown className="w-3 h-3 ml-1 inline" />;
    }
    return <ArrowUpDown className="w-3 h-3 ml-1 inline text-slate-300" />;
  };

  const columns = [
    { label: <div className="cursor-pointer" onClick={() => handleSort('name')}>Name {renderSortIcon('name')}</div> },
    { label: 'Included Therapies' },
    { label: <div className="cursor-pointer" onClick={() => handleSort('price')}>Price ($) {renderSortIcon('price')}</div> },
    { label: <div className="cursor-pointer" onClick={() => handleSort('status')}>Status {renderSortIcon('status')}</div> },
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
          <select
            value={filters.status !== undefined ? filters.status : 'All'}
            onChange={(e) => handleFilterChange('status', e.target.value === 'All' ? 'All' : e.target.value === 'true')}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={processedData}
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
