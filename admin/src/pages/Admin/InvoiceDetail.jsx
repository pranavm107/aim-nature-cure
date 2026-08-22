import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { paymentService } from '../../services/paymentService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { InputField, SelectField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [processing, setProcessing] = useState(false);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getInvoiceById(id);
      if (res.success) {
        setInvoice(res.invoice);
        setPayments(res.payments);
      } else {
        toast.error("Failed to load invoice");
        navigate('/admin/invoices');
      }
    } catch (error) {
      toast.error("Error loading invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [id]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return toast.warn("Enter a valid amount");
    
    setProcessing(true);
    try {
      const res = await paymentService.recordPayment({
        invoiceId: id,
        patientId: invoice.patientId,
        amount: parseFloat(paymentAmount),
        mode: paymentMode
      });

      if (res.success) {
        toast.success("Payment recorded successfully");
        setPaymentModalOpen(false);
        setPaymentAmount('');
        fetchInvoiceData(); // refresh to show updated status/balance
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Error recording payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><p>Loading invoice...</p></div>;
  if (!invoice) return null;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return <Badge variant="success">Paid</Badge>;
      case 'Partial': return <Badge variant="warning">Partial</Badge>;
      case 'Pending': return <Badge variant="danger">Pending</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title={`Invoice ${invoice._id}`} 
        subtitle="Invoice details and payment history"
        actions={
          invoice.status !== 'Paid' && (
            <PrimaryButton onClick={() => setPaymentModalOpen(true)}>
              Record Payment
            </PrimaryButton>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card title="Line Items">
            <div className="border rounded overflow-hidden">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 font-medium">Description</th>
                    <th className="p-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="p-3">
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded mr-2 uppercase tracking-wider">{item.type}</span>
                        {item.description}
                      </td>
                      <td className="p-3 text-right font-medium">${item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50 p-4 border-t flex justify-end">
                <div className="text-right">
                  <p className="text-gray-500 mb-1">Total Amount: <span className="text-gray-800 font-bold text-lg">${invoice.totalAmount}</span></p>
                  <p className="text-gray-500 mb-1">Paid Amount: <span className="text-green-600 font-medium">${invoice.paidAmount}</span></p>
                  <p className="text-gray-500">Balance Due: <span className="text-red-500 font-medium">${invoice.totalAmount - invoice.paidAmount}</span></p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Payment History">
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No payments recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {payments.map(pay => (
                  <div key={pay._id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">${pay.amount} <span className="text-sm font-normal text-gray-500">via {pay.mode}</span></p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(pay.date).toLocaleString()} • Txn: {pay.transactionId}</p>
                    </div>
                    <Badge variant="success">Successful</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card title="Summary">
            <div className="flex flex-col gap-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                {getStatusBadge(invoice.status)}
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium text-gray-800">{new Date(invoice.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span className="font-medium text-gray-800">{invoice.dueDate}</span>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <span>Patient ID:</span>
                <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate(`/patient/${invoice.patientId}`)}>{invoice.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span>Doctor ID:</span>
                <span className="font-medium text-gray-800">{invoice.docId}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment"
      >
        <form onSubmit={handleRecordPayment} className="flex flex-col gap-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-2">
            Balance Due: <strong>${invoice.totalAmount - invoice.paidAmount}</strong>
          </div>
          <InputField 
            label="Amount ($)"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <SelectField 
            label="Payment Mode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            options={[
              {label: 'Cash', value: 'Cash'},
              {label: 'UPI', value: 'UPI'},
              {label: 'Card', value: 'Card'},
              {label: 'Bank Transfer', value: 'Bank Transfer'},
            ]}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 border rounded text-gray-600"
            >
              Cancel
            </button>
            <PrimaryButton type="submit" disabled={processing} className="px-6 rounded">
              {processing ? 'Processing...' : 'Record'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

    </PageContainer>
  );
};

export default InvoiceDetail;
