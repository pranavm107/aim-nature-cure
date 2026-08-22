import React, { useState, useEffect } from 'react';
import { patientBillingService } from '../../services/patientBillingService';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';

const PatientBillingSummary = ({ patientId, refreshTrigger }) => {
  const [summary, setSummary] = useState({ totalBilled: 0, totalPaid: 0, pending: 0, refunded: 0 });
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    mode: 'Cash',
    date: new Date().toISOString().split('T')[0],
    transactionId: '',
    notes: ''
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const [summaryRes, invoicesRes, paymentsRes] = await Promise.all([
        patientBillingService.getPatientBillingSummary(patientId),
        patientBillingService.getPatientInvoices(patientId),
        patientBillingService.getPatientPayments(patientId)
      ]);
      
      if (summaryRes.success) setSummary(summaryRes.summary);
      if (invoicesRes.success) setInvoices(invoicesRes.invoices);
      if (paymentsRes.success) setPayments(paymentsRes.payments);
    } catch (err) {
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [patientId, refreshTrigger]);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      ...paymentForm,
      amount: invoice.balance || '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowPaymentModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (parseFloat(paymentForm.amount) <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }
    if (parseFloat(paymentForm.amount) > selectedInvoice.balance) {
      toast.error("Amount cannot exceed outstanding balance");
      return;
    }

    setPaymentSubmitting(true);
    try {
      const res = await patientBillingService.recordPatientPayment({
        patientId,
        invoiceId: selectedInvoice._id,
        amount: paymentForm.amount,
        mode: paymentForm.mode,
        date: new Date(paymentForm.date).getTime(),
        transactionId: paymentForm.transactionId,
        notes: paymentForm.notes
      });

      if (res.success) {
        toast.success("Payment recorded successfully");
        setShowPaymentModal(false);
        fetchBillingData(); // Refresh summary and invoices
      }
    } catch (err) {
      toast.error("Error recording payment");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'neutral';
      case 'overdue': return 'danger';
      case 'refunded': return 'info';
      case 'cancelled': return 'danger';
      default: return 'neutral';
    }
  };

  if (loading) {
    return <div className="bg-white border rounded-xl p-6 shadow-sm text-center py-10 text-gray-500">Loading billing summary...</div>;
  }

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Billing Summary</h2>
        <p className="text-sm text-gray-500 mt-1">Financial overview and outstanding balances.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Billed</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">₹{summary.totalBilled.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Total Paid</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">₹{summary.totalPaid.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
          <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">₹{summary.pending.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Refunded</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">₹{summary.refunded.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y">
            <tr>
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500 bg-gray-50/50">
                  No invoices found for this patient.
                </td>
              </tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{inv._id}</td>
                  <td className="px-4 py-3">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">₹{inv.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600">₹{(inv.paidAmount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-orange-600 font-medium">₹{(inv.balance || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(inv.status)}>{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleViewInvoice(inv)}
                      className="text-primary hover:underline font-medium text-xs mr-3"
                    >
                      View
                    </button>
                    {inv.balance > 0 && (
                      <button 
                        onClick={() => handleOpenPayment(inv)}
                        className="bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded text-xs font-semibold transition-colors"
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Invoice {selectedInvoice._id}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Generated on {new Date(selectedInvoice.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between mb-8">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Due Date</p>
                  <p className="text-sm font-medium text-gray-800">{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden mb-8">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="p-3 font-medium">Item Description</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-gray-700">
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3">{item.description}</td>
                        <td className="p-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{item.type}</span></td>
                        <td className="p-3 text-right">₹{item.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t font-medium text-gray-800">
                    <tr>
                      <td colSpan="2" className="p-3 text-right">Total Amount</td>
                      <td className="p-3 text-right">₹{selectedInvoice.totalAmount?.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="p-3 text-right text-green-600">Amount Paid</td>
                      <td className="p-3 text-right text-green-600">₹{(selectedInvoice.paidAmount || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="p-3 text-right text-orange-600 font-bold">Balance Due</td>
                      <td className="p-3 text-right text-orange-600 font-bold">₹{(selectedInvoice.balance || 0).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment History for this Invoice */}
              <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b pb-2">Payment History</h4>
              {payments.filter(p => p.invoiceId === selectedInvoice._id).length > 0 ? (
                <div className="space-y-3">
                  {payments.filter(p => p.invoiceId === selectedInvoice._id).map(p => (
                    <div key={p._id} className="flex justify-between items-center bg-gray-50 p-3 rounded border text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{new Date(p.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">Method: {p.mode} | TXN: {p.transactionId}</p>
                      </div>
                      <span className="font-bold text-green-600">₹{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No payments recorded for this invoice yet.</p>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => toast.success("Invoice print simulated!")}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-800">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={submitPayment} className="p-6">
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-5">
                <p className="text-sm text-orange-800">Invoice: <span className="font-bold">{selectedInvoice._id}</span></p>
                <p className="text-sm text-orange-800">Outstanding Balance: <span className="font-bold">₹{(selectedInvoice.balance || 0).toLocaleString()}</span></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (₹) *</label>
                  <input 
                    type="number" 
                    required
                    max={selectedInvoice.balance}
                    min="1"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select 
                    required
                    value={paymentForm.mode}
                    onChange={(e) => setPaymentForm({...paymentForm, mode: e.target.value})}
                    className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                  <input 
                    type="date" 
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                    className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference / TXN ID</label>
                  <input 
                    type="text" 
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                    placeholder="Optional"
                    className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                    placeholder="Optional notes..."
                    rows={2}
                    className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={paymentSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {paymentSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientBillingSummary;
