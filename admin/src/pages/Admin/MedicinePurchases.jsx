import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  ShoppingBag, Search, Plus, Calendar, RefreshCw, Eye, 
  Trash2, FileText, CheckCircle2, Clock, AlertCircle, ArrowLeft, Download
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/common/Modal';
import medicinePurchaseService from '../../services/medicinePurchaseService';
import medicineService from '../../services/medicineService';

const MedicinePurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active medicines for dropdown
  const [activeMedicines, setActiveMedicines] = useState([]);

  // New Purchase Modal
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    supplierName: '',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    discount: '',
    tax: '',
    paymentStatus: 'PAID',
    notes: '',
    items: [
      {
        medicineId: '',
        batchNumber: '',
        expiryDate: '',
        manufacturingDate: '',
        quantity: 1,
        purchasePrice: '',
        sellingPrice: ''
      }
    ]
  });

  // Purchase Details Modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Active Medicines for selection
  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const res = await medicineService.getActiveMedicines();
        if (res.success) {
          setActiveMedicines(res.medicines);
        }
      } catch (err) {
        console.error('Failed to load active medicines:', err);
      }
    };
    fetchMeds();
  }, []);

  // Fetch Purchases
  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await medicinePurchaseService.getAllPurchases({
        search: debouncedSearch,
        startDate,
        endDate,
        page,
        size
      });
      if (res.success) {
        setPurchases(res.purchases);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      } else {
        toast.error(res.message || 'Failed to load purchases');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching medicine purchases');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, startDate, endDate, page, size]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // Handle Form Item Change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...purchaseForm.items];
    updatedItems[index][field] = value;

    // If medicine changed, auto-populate default purchasePrice and sellingPrice
    if (field === 'medicineId') {
      const matched = activeMedicines.find(m => (m.uuid || m._id) === value);
      if (matched) {
        if (!updatedItems[index].purchasePrice && matched.purchasePrice) {
          updatedItems[index].purchasePrice = matched.purchasePrice;
        }
        if (!updatedItems[index].sellingPrice && matched.sellingPrice) {
          updatedItems[index].sellingPrice = matched.sellingPrice;
        }
      }
    }

    setPurchaseForm({ ...purchaseForm, items: updatedItems });
  };

  const handleAddItem = () => {
    setPurchaseForm({
      ...purchaseForm,
      items: [
        ...purchaseForm.items,
        {
          medicineId: '',
          batchNumber: '',
          expiryDate: '',
          manufacturingDate: '',
          quantity: 1,
          purchasePrice: '',
          sellingPrice: ''
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (purchaseForm.items.length === 1) {
      toast.warn('At least one item is required per invoice');
      return;
    }
    const updated = purchaseForm.items.filter((_, i) => i !== index);
    setPurchaseForm({ ...purchaseForm, items: updated });
  };

  // Calculations for new purchase
  const itemsSubtotal = purchaseForm.items.reduce((sum, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.purchasePrice) || 0;
    return sum + (q * p);
  }, 0);

  const discountAmount = Number(purchaseForm.discount) || 0;
  const taxAmount = Number(purchaseForm.tax) || 0;
  const grandTotal = Math.max(0, itemsSubtotal - discountAmount + taxAmount);

  // Submit Purchase
  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    if (!purchaseForm.invoiceNumber.trim() || !purchaseForm.purchaseDate) {
      toast.warn('Please fill in invoice number and purchase date');
      return;
    }

    // Validate items
    for (let i = 0; i < purchaseForm.items.length; i++) {
      const it = purchaseForm.items[i];
      if (!it.medicineId) {
        toast.warn(`Please select a medicine for item #${i + 1}`);
        return;
      }
      if (!it.batchNumber.trim()) {
        toast.warn(`Please enter a batch number for item #${i + 1}`);
        return;
      }
      if (!it.expiryDate) {
        toast.warn(`Please specify an expiry date for item #${i + 1}`);
        return;
      }
      if (!it.quantity || Number(it.quantity) <= 0) {
        toast.warn(`Quantity must be greater than zero for item #${i + 1}`);
        return;
      }
      if (it.purchasePrice === '' || Number(it.purchasePrice) < 0) {
        toast.warn(`Please enter purchase price for item #${i + 1}`);
        return;
      }
    }

    setSavingPurchase(true);
    try {
      const payload = {
        supplierName: purchaseForm.supplierName.trim() || 'Direct Supplier',
        invoiceNumber: purchaseForm.invoiceNumber.trim(),
        purchaseDate: purchaseForm.purchaseDate,
        discount: discountAmount,
        tax: taxAmount,
        paymentStatus: purchaseForm.paymentStatus,
        notes: purchaseForm.notes.trim() || null,
        items: purchaseForm.items.map(it => ({
          medicineId: it.medicineId,
          batchNumber: it.batchNumber.trim(),
          expiryDate: it.expiryDate,
          manufacturingDate: it.manufacturingDate || null,
          quantity: Number(it.quantity),
          purchasePrice: Number(it.purchasePrice),
          sellingPrice: it.sellingPrice ? Number(it.sellingPrice) : null
        }))
      };

      const res = await medicinePurchaseService.createPurchase(payload);
      if (res.success) {
        toast.success(res.message || 'Purchase invoice recorded successfully');
        setIsNewPurchaseOpen(false);
        // Reset form
        setPurchaseForm({
          supplierName: '',
          invoiceNumber: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          discount: '',
          tax: '',
          paymentStatus: 'PAID',
          notes: '',
          items: [
            {
              medicineId: '',
              batchNumber: '',
              expiryDate: '',
              manufacturingDate: '',
              quantity: 1,
              purchasePrice: '',
              sellingPrice: ''
            }
          ]
        });
        loadPurchases();
      } else {
        toast.error(res.message || 'Failed to record purchase');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setSavingPurchase(false);
    }
  };

  // View Purchase Details
  const handleViewDetail = async (id) => {
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const res = await medicinePurchaseService.getPurchaseById(id);
      if (res.success) {
        setSelectedPurchase(res.purchase);
      } else {
        toast.error(res.message || 'Failed to load purchase details');
      }
    } catch (err) {
      toast.error('Error fetching purchase details');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Medicine Purchases & Supplier Invoices"
        subtitle="Manage supplier procurement, batch inflows, GST invoices, and cost valuation"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadPurchases}
              className="px-3.5 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsNewPurchaseOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Record New Purchase
            </button>
          </div>
        }
      />

      {/* Filter and Date Search Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice # or supplier..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
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
              className="text-xs text-primary hover:underline font-medium"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm">Loading purchase invoices...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-slate-600 text-base">No purchase invoices found.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Record New Purchase" above to add your first supplier delivery.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Invoice #</th>
                  <th className="px-4 py-3.5">Supplier Name</th>
                  <th className="px-4 py-3.5">Purchase Date</th>
                  <th className="px-4 py-3.5">Subtotal</th>
                  <th className="px-4 py-3.5">Tax / Discount</th>
                  <th className="px-4 py-3.5">Grand Total</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((pur) => (
                  <tr key={pur.uuid || pur._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {pur.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {pur.supplierName || 'Direct Vendor'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {pur.purchaseDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      ₹{Number(pur.subtotal || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>+ ₹{Number(pur.tax || 0).toFixed(2)} Tax</div>
                      <div>- ₹{Number(pur.discount || 0).toFixed(2)} Disc</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 text-base">
                      ₹{Number(pur.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        pur.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {pur.paymentStatus || 'PAID'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetail(pur.uuid || pur._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Invoice
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
            Showing {totalElements === 0 ? 0 : page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} invoices
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

      {/* Record New Purchase Modal */}
      <Modal
        isOpen={isNewPurchaseOpen}
        onClose={() => setIsNewPurchaseOpen(false)}
        title="Record Medicine Purchase Invoice"
      >
        <form onSubmit={handleSubmitPurchase} className="flex flex-col gap-5 text-sm max-h-[75vh] overflow-y-auto pr-1">
          {/* Invoice Header Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Name *</label>
              <input
                type="text"
                required
                value={purchaseForm.supplierName}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                placeholder="e.g. Apex Healthcare Ltd"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={purchaseForm.invoiceNumber}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                placeholder="e.g. INV-2026-089"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Date *</label>
              <input
                type="date"
                required
                value={purchaseForm.purchaseDate}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Line Items Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Delivered Items & Batch Allocations ({purchaseForm.items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Item
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {purchaseForm.items.map((item, index) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0);
                return (
                  <div key={index} className="p-3 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700">Item #{index + 1}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-600">
                          Total: ₹{lineTotal.toFixed(2)}
                        </span>
                        {purchaseForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-rose-500 hover:text-rose-700"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Medicine *</label>
                        <select
                          required
                          value={item.medicineId}
                          onChange={(e) => handleItemChange(index, 'medicineId', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">-- Choose Medicine from Catalog --</option>
                          {activeMedicines.map(m => (
                            <option key={m.uuid || m._id} value={m.uuid || m._id}>
                              {m.medicineName} ({m.unit || 'Unit'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Batch Number *</label>
                        <input
                          type="text"
                          required
                          value={item.batchNumber}
                          onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                          placeholder="e.g. BATCH-2026-01"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mfg Date</label>
                        <input
                          type="date"
                          value={item.manufacturingDate}
                          onChange={(e) => handleItemChange(index, 'manufacturingDate', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry Date *</label>
                        <input
                          type="date"
                          required
                          value={item.expiryDate}
                          onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          placeholder="1"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Purchase Cost (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.purchasePrice}
                          onChange={(e) => handleItemChange(index, 'purchasePrice', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="w-1/2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.sellingPrice}
                        onChange={(e) => handleItemChange(index, 'sellingPrice', e.target.value)}
                        placeholder="Selling price for patients"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals & Taxes */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={purchaseForm.paymentStatus}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
              </select>

              <label className="block text-xs font-semibold text-slate-700 mt-3 mb-1">Notes / Delivery Details</label>
              <textarea
                rows="2"
                value={purchaseForm.notes}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                placeholder="Transport remarks, consignment #, etc."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2 justify-end text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold text-slate-800">₹{itemsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Discount (₹):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchaseForm.discount}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, discount: e.target.value })}
                  placeholder="0.00"
                  className="w-28 px-2 py-1 bg-white border border-slate-200 rounded text-right text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tax / GST (₹):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchaseForm.tax}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, tax: e.target.value })}
                  placeholder="0.00"
                  className="w-28 px-2 py-1 bg-white border border-slate-200 rounded text-right text-xs"
                />
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-bold">
                <span className="text-slate-800">Grand Total:</span>
                <span className="text-primary text-base">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewPurchaseOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingPurchase}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {savingPurchase ? 'Saving Invoice...' : 'Save Purchase & Inflow Stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Purchase Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedPurchase ? `Purchase Invoice: ${selectedPurchase.invoiceNumber}` : "Invoice Details"}
      >
        {loadingDetail ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
            Loading invoice details...
          </div>
        ) : selectedPurchase ? (
          <div className="flex flex-col gap-4 text-xs text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block">Supplier:</span>
                <strong className="text-slate-800 text-sm">{selectedPurchase.supplierName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Invoice #:</span>
                <strong className="text-slate-800 font-mono text-sm">{selectedPurchase.invoiceNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Purchase Date:</span>
                <strong className="text-slate-800">{selectedPurchase.purchaseDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Status:</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  selectedPurchase.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedPurchase.paymentStatus}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 uppercase mb-2">Itemized Batches Received</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Medicine</th>
                      <th className="px-3 py-2">Batch #</th>
                      <th className="px-3 py-2">Expiry Date</th>
                      <th className="px-3 py-2">Quantity</th>
                      <th className="px-3 py-2">Unit Cost</th>
                      <th className="px-3 py-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPurchase.items?.map((it, idx) => (
                      <tr key={it.uuid || idx}>
                        <td className="px-3 py-2 font-medium text-slate-800">{it.medicineName}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{it.batchNumber}</td>
                        <td className="px-3 py-2 text-slate-600">{it.expiryDate}</td>
                        <td className="px-3 py-2 font-bold text-slate-800">{it.quantity}</td>
                        <td className="px-3 py-2 text-slate-600">₹{Number(it.purchasePrice || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-800">
                          ₹{Number(it.totalAmount || (it.quantity * it.purchasePrice) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1 w-64 ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">₹{Number(selectedPurchase.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>- ₹{Number(selectedPurchase.discount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax / GST:</span>
                <span>+ ₹{Number(selectedPurchase.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-300 font-bold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className="text-primary">₹{Number(selectedPurchase.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            {selectedPurchase.notes && (
              <div className="text-xs text-slate-500 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200">
                <strong>Notes:</strong> {selectedPurchase.notes}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDetailOpen(false)}
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

export default MedicinePurchases;

