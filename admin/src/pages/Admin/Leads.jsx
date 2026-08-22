import React, { useState, useEffect } from 'react';
import { leadService } from '../../services/leadService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await leadService.getLeads();
      if (res.success) setLeads(res.leads);
    } catch (err) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await leadService.updateLeadStatus(id, status);
      if (res.success) {
        toast.success("Lead status updated");
        fetchLeads();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const columns = [
    { label: 'Date' },
    { label: 'Name' },
    { label: 'Phone' },
    { label: 'Source' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1.5fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p>{new Date(item.date).toLocaleDateString()}</p>
      <p className="font-medium text-gray-800">{item.name}</p>
      <p>{item.phone}</p>
      <p>{item.source}</p>
      <div>
        {item.status === 'New' && <Badge variant="neutral">New</Badge>}
        {item.status === 'Contacted' && <Badge variant="warning">Contacted</Badge>}
        {item.status === 'Converted' && <Badge variant="success">Converted</Badge>}
        {item.status === 'Lost' && <Badge variant="danger">Lost</Badge>}
      </div>
      <div className="text-right flex gap-2 justify-end">
        {item.status !== 'Converted' && item.status !== 'Lost' && (
          <select 
            onChange={(e) => handleUpdateStatus(item._id, e.target.value)} 
            value={item.status}
            className="text-xs border rounded p-1 outline-none"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Lead Management" subtitle="Track and manage prospective patients from marketing channels" />
      <DataTable 
        columns={columns} 
        data={leads} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No leads found."
        gridColsClass="grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1.5fr]" 
      />
    </PageContainer>
  );
};

export default Leads;
