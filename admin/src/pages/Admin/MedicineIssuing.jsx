import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  Send, Search, Plus, Calendar, RefreshCw, Eye, 
  Trash2, FileText, CheckCircle2, User, CreditCard, 
  Printer, ArrowRight, Pill, Layers, Receipt
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/common/Modal';
import medicineIssueService from '../../services/medicineIssueService';
import medicineService from '../../services/medicineService';
import medicineInventoryService from '../../services/medicineInventoryService';
import { patientService } from '../../services/patientService';

const MedicineIssuing = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Patient and Medicine Options
  const [patients, setPatients] = useState([]);
  const [activeMedicines, setActiveMedicines] = useState([]);

  // New Issue Modal
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [savingIssue, setSavingIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({
    patientId: '',
    consultationId: '',
    issueDate: new Date().toISOString().split('T')[0],
    notes: '',
    createInvoice: true,
    discount: '',
    paidAmount: '',
    paymentMethod: 'UPI',
    transactionId: '',
    items: [
      {
        medicineId: '',
        batchId: '', // null = Auto FIFO
        quantity: 1,
        unitPrice: ''
      }
    ]
  });

  // Medicine Batches Map: { [medicineId]: batches[] }
  const [medicineBatchesMap, setMedicineBatchesMap] = useState({});

  // Receipt / Detail Modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Load Patients and Active Medicines on Mount
  useEffect(() => {
    const initData = async () => {
      try {
        const [patRes, medRes] = await Promise.all([
          patientService.getPatients({ size: 1000 }),
          medicineService.getActiveMedicines()
        ]);
        if (patRes.success) {
          setPatients(patRes.patients || []);
        }
        if (medRes.success) {
          setActiveMedicines(medRes.medicines || []);
        }
      } catch (err) {
        console.error('Error initializing issue dropdowns:', err);
      }
    };
    initData();
  }, []);

  // Fetch Issues
  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await medicineIssueService.getAllIssues({
        startDate,
        endDate,
        page,
        size
      });
      if (res.success) {
        setIssues(res.issues);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      } else {
        toast.error(res.message || 'Failed to load medicine issues');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching medicine issues');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, page, size]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  // Load batches dynamically when a medicine is chosen in an item
  const handleMedicineSelect = async (index, medicineId) => {
    const updated = [...issueForm.items];
    updated[index].medicineId = medicineId;
    updated[index].batchId = ''; // default auto FIFO

    const matchedMed = activeMedicines.find(m => (m.uuid || m._id) === medicineId);
    if (matchedMed && matchedMed.sellingPrice) {
      updated[index].unitPrice = matchedMed.sellingPrice;
    }

    setIssueForm({ ...issueForm, items: updated });

    if (medicineId && !medicineBatchesMap[medicineId]) {
      try {
        const bRes = await medicineInventoryService.getBatchesByMedicine(medicineId);
        if (bRes.success) {
          setMedicineBatchesMap(prev => ({
            ...prev,
            [medicineId]: bRes.batches || []
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleItemFieldChange = (index, field, value) => {
    const updated = [...issueForm.items];
    updated[index][field] = value;
    setIssueForm({ ...issueForm, items: updated });
  };

  const handleAddItem = () => {
    setIssueForm({
      ...issueForm,
      items: [
        ...issueForm.items,
        {
          medicineId: '',
          batchId: '',
          quantity: 1,
          unitPrice: ''
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (issueForm.items.length === 1) {
      toast.warn('At least one medicine is required');
      return;
    }
    const updated = issueForm.items.filter((_, i) => i !== index);
    setIssueForm({ ...issueForm, items: updated });
  };

  // Calculations for billing
  const grossSubtotal = issueForm.items.reduce((sum, it) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unitPrice) || 0;
    return sum + (q * p);
  }, 0);

  const discountAmount = Number(issueForm.discount) || 0;
  const netPayable = Math.max(0, grossSubtotal - discountAmount);

  // Auto-fill paid amount when gross changes if user wants full payment
  const handleSetFullPayment = () => {
    setIssueForm(prev => ({ ...prev, paidAmount: netPayable.toFixed(2) }));
  };

  // Submit Issue
  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.patientId) {
      toast.warn('Please select a patient');
      return;
    }

    for (let i = 0; i < issueForm.items.length; i++) {
      const it = issueForm.items[i];
      if (!it.medicineId) {
        toast.warn(`Please select a medicine for item #${i + 1}`);
        return;
      }
      if (!it.quantity || Number(it.quantity) <= 0) {
        toast.warn(`Quantity must be greater than zero for item #${i + 1}`);
        return;
      }
    }

    setSavingIssue(true);
    try {
      const payload = {
        patientId: issueForm.patientId,
        consultationId: issueForm.consultationId ? issueForm.consultationId : null,
        issueDate: issueForm.issueDate,
        notes: issueForm.notes.trim() || null,
        createInvoice: issueForm.createInvoice,
        discount: discountAmount,
        paidAmount: issueForm.paidAmount ? Number(issueForm.paidAmount) : 0,
        paymentMethod: issueForm.paymentMethod,
        transactionId: issueForm.transactionId.trim() || null,
        items: issueForm.items.map(it => ({
          medicineId: it.medicineId,
          batchId: it.batchId ? it.batchId : null, // null triggers auto FIFO!
          quantity: Number(it.quantity),
          unitPrice: it.unitPrice !== '' ? Number(it.unitPrice) : null
        }))
      };

      const res = await medicineIssueService.issueMedicine(payload);
      if (res.success) {
        toast.success(res.message || 'Medicines issued successfully');
        setIsNewIssueOpen(false);
        // Reset form
        setIssueForm({
          patientId: '',
          consultationId: '',
          issueDate: new Date().toISOString().split('T')[0],
          notes: '',
          createInvoice: true,
          discount: '',
          paidAmount: '',
          paymentMethod: 'UPI',
          transactionId: '',
          items: [
            {
              medicineId: '',
              batchId: '',
              quantity: 1,
              unitPrice: ''
            }
          ]
        });
        loadIssues();
      } else {
        toast.error(res.message || 'Failed to issue medicine');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setSavingIssue(false);
    }
  };

  // View Issue Details / Receipt
  const handleViewReceipt = async (id) => {
    setIsReceiptOpen(true);
    setLoadingReceipt(true);
    try {
      const res = await medicineIssueService.getIssueById(id);
      if (res.success) {
        setSelectedIssue(res.issue);
      } else {
        toast.error(res.message || 'Failed to load issue receipt');
      }
    } catch (err) {
      toast.error('Error fetching issue receipt');
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Medicine Dispensing & Patient Issuing"
        subtitle="Prescription fulfillment, automatic FIFO batch deduction, invoice generation, and dispensing receipts"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadIssues}
              className="px-3.5 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsNewIssueOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <Send className="w-4 h-4" />
              Dispense Medicines
            </button>
          </div>
        }
      />

      {/* Date Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
          <Receipt className="w-4 h-4 text-primary" />
          <span>Patient Dispensing Log</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setPage(0); }}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Dispensing History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm">Loading dispensing records...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Send className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-slate-600 text-base">No medicine dispensing records found.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Dispense Medicines" above to issue prescriptions to patients.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Issue #</th>
                  <th className="px-4 py-3.5">Patient Name</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Invoice #</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Cost (COGS)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((iss) => (
                  <tr key={iss.uuid || iss._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {iss.issueNumber || `ISS-${iss.uuid?.slice(0, 8)}`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {iss.patientName || 'Registered Patient'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {iss.issueDate}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {iss.invoiceNumber || 'No Invoice'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 text-base">
                      ₹{Number(iss.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      ₹{Number(iss.totalCogs || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {iss.status || 'ISSUED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewReceipt(iss.uuid || iss._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            Showing {totalElements === 0 ? 0 : page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} dispensing logs
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-xs font-medium"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-xs font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Dispense New Medicine Modal */}
      <Modal
        isOpen={isNewIssueOpen}
        onClose={() => setIsNewIssueOpen(false)}
        title="Dispense Medicines & Bill Patient"
      >
        <form onSubmit={handleSubmitIssue} className="flex flex-col gap-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
          {/* Patient Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={issueForm.patientId}
                onChange={(e) => setIssueForm({ ...issueForm, patientId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p._id || p.uuid} value={p._id || p.uuid}>
                    {p.name} ({p.idNumber || p.patientId || 'ID'}) - {p.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dispensing Date *</label>
              <input
                type="date"
                required
                value={issueForm.issueDate}
                onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Medicines Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Prescribed Medicines ({issueForm.items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {issueForm.items.map((item, index) => {
                const availableBatches = medicineBatchesMap[item.medicineId] || [];
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

                return (
                  <div key={index} className="p-3 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-xs font-bold text-slate-700">Medicine #{index + 1}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-700">Line: ₹{lineTotal.toFixed(2)}</span>
                        {issueForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Medicine *</label>
                        <select
                          required
                          value={item.medicineId}
                          onChange={(e) => handleMedicineSelect(index, e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="">-- Choose Medicine --</option>
                          {activeMedicines.map(m => (
                            <option key={m.uuid || m._id} value={m.uuid || m._id}>
                              {m.medicineName} (Stock: {m.availableStock ?? 'N/A'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Batch Allocation
                        </label>
                        <select
                          value={item.batchId}
                          onChange={(e) => handleItemFieldChange(index, 'batchId', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50"
                        >
                          <option value="">Auto FIFO (Earliest Expiry First)</option>
                          {availableBatches.map(b => (
                            <option key={b.uuid || b.batchId} value={b.uuid || b.batchId}>
                              {b.batchNumber} (Avail: {b.availableQuantity}, Exp: {b.expiryDate})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemFieldChange(index, 'quantity', e.target.value)}
                          placeholder="1"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Selling Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemFieldChange(index, 'unitPrice', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoicing and Payment Options */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={issueForm.createInvoice}
                  onChange={(e) => setIssueForm({ ...issueForm, createInvoice: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-xs font-bold text-slate-700">Generate Official Bill / Invoice</span>
              </label>
              <button
                type="button"
                onClick={handleSetFullPayment}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Mark Full Payment (₹{netPayable.toFixed(2)})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage / Usage Notes</label>
                <textarea
                  rows="2"
                  value={issueForm.notes}
                  onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                  placeholder="e.g. 1 tablet twice daily after meals with warm water"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Gross Total:</span>
                  <span className="font-semibold text-slate-800">₹{grossSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Discount (₹):</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={issueForm.discount}
                    onChange={(e) => setIssueForm({ ...issueForm, discount: e.target.value })}
                    placeholder="0.00"
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-right text-xs"
                  />
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-1">
                  <span>Net Payable:</span>
                  <span className="text-primary">₹{netPayable.toFixed(2)}</span>
                </div>

                {issueForm.createInvoice && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Paid Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={issueForm.paidAmount}
                        onChange={(e) => setIssueForm({ ...issueForm, paidAmount: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Payment Method</label>
                      <select
                        value={issueForm.paymentMethod}
                        onChange={(e) => setIssueForm({ ...issueForm, paymentMethod: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      >
                        <option value="UPI">UPI</option>
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewIssueOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingIssue}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {savingIssue ? 'Dispensing...' : 'Confirm Dispensing & Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title={selectedIssue ? `Dispensing Receipt: ${selectedIssue.issueNumber || 'Medicine Issue'}` : "Receipt"}
      >
        {loadingReceipt ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
            Loading receipt...
          </div>
        ) : selectedIssue ? (
          <div className="flex flex-col gap-4 text-xs text-slate-700">
            {/* Hospital Branding Header */}
            <div className="text-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide">
                AIM Nature Cure Hospital
              </h3>
              <p className="text-slate-500 text-[11px]">
                Hospital Pharmacy & Medicine Dispensing Receipt
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Patient Name:</span>
                <strong className="text-slate-800 text-sm">{selectedIssue.patientName}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Issue Date:</span>
                <strong className="text-slate-800">{selectedIssue.issueDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Issue #:</span>
                <strong className="text-slate-800 font-mono">{selectedIssue.issueNumber || selectedIssue.uuid}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Invoice #:</span>
                <strong className="text-slate-800 font-mono">{selectedIssue.invoiceNumber || 'N/A'}</strong>
              </div>
            </div>

            {/* Dispensed Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Medicine</th>
                    <th className="px-3 py-2">Batch #</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedIssue.items?.map((it, idx) => (
                    <tr key={it.uuid || idx}>
                      <td className="px-3 py-2 font-medium text-slate-800">{it.medicineName}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{it.batchNumber || 'FIFO'}</td>
                      <td className="px-3 py-2 font-bold text-slate-800">{it.quantity}</td>
                      <td className="px-3 py-2 text-slate-600">₹{Number(it.unitPrice || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-800">
                        ₹{Number(it.totalPrice || (it.quantity * it.unitPrice) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total summary */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700">Total Billed:</span>
              <span className="font-bold text-base text-primary">₹{Number(selectedIssue.totalAmount || 0).toFixed(2)}</span>
            </div>

            {selectedIssue.notes && (
              <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-200 text-xs">
                <strong>Dosage Instructions:</strong> {selectedIssue.notes}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-semibold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
};

export default MedicineIssuing;

