import React, { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import DataTable from '../../components/common/DataTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await invoiceService.getInvoices();
        if (res.success) {
          setInvoices(res.invoices);
        } else {
          toast.error("Failed to load invoices");
        }
      } catch (error) {
        toast.error("Error loading invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const columns = [
    { label: 'Invoice ID' },
    { label: 'Date' },
    { label: 'Patient' },
    { label: 'Amount' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return <Badge variant="success">Paid</Badge>;
      case 'Partial': return <Badge variant="warning">Partial</Badge>;
      case 'Pending': return <Badge variant="danger">Pending</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr] py-3 px-6 border-b hover:bg-gray-50 items-center text-sm text-gray-700">
      <p className="font-medium">{item._id}</p>
      <p>{new Date(item.date).toLocaleDateString()}</p>
      <p>Patient {item.patientId}</p>
      <p>${item.totalAmount}</p>
      <div>{getStatusBadge(item.status)}</div>
      <div className="text-right">
        <button 
          onClick={() => navigate(`/admin/invoices/${item._id}`)}
          className="text-primary hover:underline font-medium"
        >
          View
        </button>
      </div>
    </div>
  );

  const renderMobileCard = (item) => (
    <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800 text-lg">{item._id}</p>
          <p className="text-xs text-gray-400 mb-1">{new Date(item.date).toLocaleDateString()}</p>
        </div>
        {getStatusBadge(item.status)}
      </div>
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex justify-between">
        <span>Patient ID: {item.patientId}</span>
        <span className="font-medium text-gray-800">${item.totalAmount}</span>
      </div>
      <button 
        onClick={() => navigate(`/admin/invoices/${item._id}`)}
        className="w-full mt-1 py-2 text-primary font-medium text-sm border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-colors"
      >
        View Detail
      </button>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Invoices" 
        subtitle="Manage billing and invoices"
      />
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        renderRow={renderRow}
        renderMobileCard={renderMobileCard}
        emptyMessage="No invoices found."
        gridColsClass="grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr]"
      />
    </PageContainer>
  );
};

export default InvoiceList;
