import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  Pill, AlertTriangle, Clock, TrendingUp, Search, Plus, 
  Edit3, Trash2, Layers, RefreshCw, AlertCircle, ArrowUpDown, 
  ChevronRight, CheckCircle2, XCircle, ShieldAlert, BarChart2
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/common/Modal';
import medicineService from '../../services/medicineService';
import medicineInventoryService from '../../services/medicineInventoryService';
import medicineReportService from '../../services/medicineReportService';

const STATUS_BADGE = {
  IN_STOCK: {
    label: 'In Stock',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  LOW_STOCK: {
    label: 'Low Stock',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    className: 'bg-rose-50 text-rose-700 border-rose-200'
  }
};

const EXPIRY_BADGE = {
  EXPIRED: 'bg-red-100 text-red-800 border-red-300 font-bold',
  EXPIRING_30_DAYS: 'bg-rose-50 text-rose-700 border-rose-200',
  EXPIRING_60_DAYS: 'bg-amber-50 text-amber-700 border-amber-200',
  EXPIRING_90_DAYS: 'bg-blue-50 text-blue-700 border-blue-200'
};

const MedicineInventory = () => {
  // Active Tab: 'stock' | 'catalog' | 'low_stock' | 'expiry'
  const [activeTab, setActiveTab] = useState('stock');

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [expiryDays, setExpiryDays] = useState(90);

  // Data States
  const [stockList, setStockList] = useState([]);
  const [catalogList, setCatalogList] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [expiryList, setExpiryList] = useState([]);
  const [valuationData, setValuationData] = useState(null);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineFormData, setMedicineFormData] = useState({
    medicineName: '',
    genericName: '',
    category: 'Ayurveda',
    brandName: '',
    manufacturer: '',
    description: '',
    unit: 'Bottle',
    purchasePrice: '',
    sellingPrice: '',
    minimumStockLevel: 10,
    stock: 0,
    active: true
  });
  const [savingMedicine, setSavingMedicine] = useState(false);

  // Batch Inspection Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedMedicineBatches, setSelectedMedicineBatches] = useState([]);
  const [selectedMedicineName, setSelectedMedicineName] = useState('');
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustmentTarget, setAdjustmentTarget] = useState(null);
  const [adjustFormData, setAdjustFormData] = useState({
    batchId: '',
    quantity: '',
    movementType: 'MANUAL_ADJUSTMENT',
    reason: ''
  });
  const [savingAdjust, setSavingAdjust] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load KPI overview (valuation & counts)
  const loadKpis = useCallback(async () => {
    try {
      const valRes = await medicineReportService.getStockValuation();
      if (valRes.success) {
        setValuationData(valRes.valuation);
      }
    } catch (err) {
      console.error('Failed to load valuation KPI:', err);
    }
  }, []);

  useEffect(() => {
    loadKpis();
  }, [loadKpis]);

  // Load data according to active tab
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'stock') {
        const res = await medicineInventoryService.getStockSummaries({
          search: debouncedSearch,
          status: stockStatusFilter,
          page,
          size
        });
        if (res.success) {
          setStockList(res.stockSummaries);
          setTotalElements(res.totalElements);
          setTotalPages(res.totalPages);
        }
      } else if (activeTab === 'catalog') {
        const res = await medicineService.getAllMedicines({
          search: debouncedSearch,
          page,
          size
        });
        if (res.success) {
          setCatalogList(res.medicines);
          setTotalElements(res.totalElements);
          setTotalPages(res.totalPages);
        }
      } else if (activeTab === 'low_stock') {
        const res = await medicineInventoryService.getLowStockMedicines({
          search: debouncedSearch,
          page,
          size
        });
        if (res.success) {
          setLowStockList(res.lowStockMedicines);
          setTotalElements(res.totalElements);
          setTotalPages(res.totalPages);
        }
      } else if (activeTab === 'expiry') {
        const res = await medicineInventoryService.getExpiringBatches({
          days: expiryDays,
          page,
          size
        });
        if (res.success) {
          setExpiryList(res.expiringBatches);
          setTotalElements(res.totalElements);
          setTotalPages(res.totalPages);
        }
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
      toast.error('Failed to load medicine inventory data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, stockStatusFilter, expiryDays, page, size]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab switch handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
    setSearchTerm('');
  };

  // Open Create/Edit Medicine Modal
  const handleOpenMedicineModal = (med = null) => {
    if (med) {
      setEditingMedicine(med);
      setMedicineFormData({
        medicineName: med.medicineName || '',
        genericName: med.genericName || '',
        category: med.category || 'Ayurveda',
        brandName: med.brandName || '',
        manufacturer: med.manufacturer || '',
        description: med.description || '',
        unit: med.unit || 'Bottle',
        purchasePrice: med.purchasePrice ?? '',
        sellingPrice: med.sellingPrice ?? '',
        minimumStockLevel: med.minimumStockLevel ?? 10,
        stock: med.stock ?? med.availableStock ?? 0,
        active: med.active ?? true
      });
    } else {
      setEditingMedicine(null);
      setMedicineFormData({
        medicineName: '',
        genericName: '',
        category: 'Ayurveda',
        brandName: '',
        manufacturer: '',
        description: '',
        unit: 'Bottle',
        purchasePrice: '',
        sellingPrice: '',
        minimumStockLevel: 10,
        stock: 0,
        active: true
      });
    }
    setIsMedicineModalOpen(true);
  };

  // Save Medicine
  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    if (!medicineFormData.medicineName.trim() || !medicineFormData.unit.trim()) {
      toast.warn('Please provide medicine name and unit');
      return;
    }

    setSavingMedicine(true);
    try {
      const payload = {
        medicineName: medicineFormData.medicineName.trim(),
        genericName: medicineFormData.genericName.trim() || null,
        category: medicineFormData.category.trim() || null,
        brandName: medicineFormData.brandName.trim() || null,
        manufacturer: medicineFormData.manufacturer.trim() || null,
        description: medicineFormData.description.trim() || null,
        unit: medicineFormData.unit.trim(),
        purchasePrice: medicineFormData.purchasePrice ? Number(medicineFormData.purchasePrice) : 0,
        sellingPrice: medicineFormData.sellingPrice ? Number(medicineFormData.sellingPrice) : 0,
        minimumStockLevel: medicineFormData.minimumStockLevel !== '' ? Number(medicineFormData.minimumStockLevel) : 10,
        stock: medicineFormData.stock !== '' ? Number(medicineFormData.stock) : 0,
        active: medicineFormData.active
      };

      let res;
      if (editingMedicine) {
        res = await medicineService.updateMedicine(editingMedicine.uuid || editingMedicine._id || editingMedicine.medicineId, payload);
      } else {
        res = await medicineService.createMedicine(payload);
      }

      if (res.success) {
        toast.success(res.message || (editingMedicine ? 'Medicine updated' : 'Medicine created'));
        setIsMedicineModalOpen(false);
        loadData();
        loadKpis();
      } else {
        toast.error(res.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setSavingMedicine(false);
    }
  };

  // Deactivate Medicine
  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate "${name}"?`)) return;
    try {
      const res = await medicineService.deleteMedicine(id);
      if (res.success) {
        toast.success(res.message || 'Medicine deactivated');
        loadData();
        loadKpis();
      } else {
        toast.error(res.message || 'Failed to deactivate medicine');
      }
    } catch (err) {
      toast.error('Error deactivating medicine');
    }
  };

  // View Batches for a Medicine
  const handleViewBatches = async (medicineId, medicineName) => {
    setSelectedMedicineName(medicineName);
    setIsBatchModalOpen(true);
    setLoadingBatches(true);
    try {
      const res = await medicineInventoryService.getBatchesByMedicine(medicineId);
      if (res.success) {
        setSelectedMedicineBatches(res.batches);
      } else {
        toast.error(res.message || 'Failed to load batches');
      }
    } catch (err) {
      toast.error('Error loading batches');
    } finally {
      setLoadingBatches(false);
    }
  };

  // Open Adjust Modal from Batch
  const handleOpenAdjustModal = (batch, medName = '') => {
    setAdjustmentTarget({
      batchId: batch.uuid || batch.batchId,
      batchNumber: batch.batchNumber,
      medicineName: medName || selectedMedicineName,
      availableQuantity: batch.availableQuantity
    });
    setAdjustFormData({
      batchId: batch.uuid || batch.batchId,
      quantity: '',
      movementType: 'MANUAL_ADJUSTMENT',
      reason: ''
    });
    setIsAdjustModalOpen(true);
  };

  // Save Stock Adjustment
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    const qty = parseInt(adjustFormData.quantity, 10);
    if (isNaN(qty) || qty === 0) {
      toast.warn('Please enter a valid non-zero adjustment quantity');
      return;
    }
    if (!adjustFormData.reason.trim()) {
      toast.warn('Please provide a mandatory reason for adjustment');
      return;
    }

    setSavingAdjust(true);
    try {
      const payload = {
        batchId: adjustFormData.batchId,
        quantity: qty,
        movementType: adjustFormData.movementType,
        reason: adjustFormData.reason.trim()
      };

      const res = await medicineInventoryService.adjustStock(payload);
      if (res.success) {
        toast.success(res.message || 'Stock adjusted successfully');
        setIsAdjustModalOpen(false);
        if (isBatchModalOpen && adjustmentTarget?.medicineName) {
          // Refresh batches
          handleViewBatches(selectedMedicineBatches[0]?.medicineId, selectedMedicineName);
        }
        loadData();
        loadKpis();
      } else {
        toast.error(res.message || 'Failed to adjust stock');
      }
    } catch (err) {
      toast.error('Error submitting stock adjustment');
    } finally {
      setSavingAdjust(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Medicine Inventory & Stock Management"
        subtitle="Live inventory tracking, multi-batch valuation, expiry alerts, and catalog control"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { loadData(); loadKpis(); }}
              className="px-3.5 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
              title="Refresh Inventory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => handleOpenMedicineModal()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Medicines</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {valuationData ? valuationData.totalMedicinesCount : '...'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {valuationData ? `${valuationData.totalActiveBatchesCount || 0} Active Batches` : 'Loading batches'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units In Stock</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {valuationData ? Number(valuationData.totalQuantityInStock || 0).toLocaleString() : '...'}
              </h3>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 inline" /> Available across batches
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Valuation (Cost)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{valuationData ? Number(valuationData.totalValuationAtCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Selling: ₹{valuationData ? Number(valuationData.totalValuationAtSellingPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potential Profit</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{valuationData ? Number(valuationData.potentialProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Expected inventory margin
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-t-xl px-4 pt-3 border-b-0 flex flex-wrap gap-2">
        <button
          onClick={() => handleTabChange('stock')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Stock Overview & Batches
        </button>

        <button
          onClick={() => handleTabChange('catalog')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          Master Catalog
        </button>

        <button
          onClick={() => handleTabChange('low_stock')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'low_stock'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock Alerts
        </button>

        <button
          onClick={() => handleTabChange('expiry')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'expiry'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Expiring Batches
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'expiry'
                ? "Search batches / medicines..."
                : "Search by medicine or generic name..."
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {activeTab === 'stock' && (
            <select
              value={stockStatusFilter}
              onChange={(e) => { setStockStatusFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          )}

          {activeTab === 'expiry' && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-xs font-medium">Expiring within:</span>
              <select
                value={expiryDays}
                onChange={(e) => { setExpiryDays(Number(e.target.value)); setPage(0); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
                <option value={180}>180 Days</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Show:</span>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Table Area */}
      <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm">Loading medicine inventory data...</p>
          </div>
        ) : (
          <>
            {/* 1. STOCK OVERVIEW TAB */}
            {activeTab === 'stock' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">Medicine Name</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Unit</th>
                      <th className="px-4 py-3.5">Selling Price</th>
                      <th className="px-4 py-3.5">Stock Status</th>
                      <th className="px-4 py-3.5">Available Units</th>
                      <th className="px-4 py-3.5">Min Threshold</th>
                      <th className="px-4 py-3.5">Active Batches</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockList.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-12 text-slate-400">
                          No stock records found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      stockList.map((item) => {
                        const statusObj = STATUS_BADGE[item.stockStatus] || STATUS_BADGE.IN_STOCK;
                        return (
                          <tr key={item.medicineId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800">{item.medicineName}</div>
                              {item.genericName && (
                                <div className="text-xs text-slate-400 italic">{item.genericName}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                                {item.category || 'General'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{item.unit || 'Unit'}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              ₹{Number(item.sellingPrice || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusObj.className}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.stockStatus === 'OUT_OF_STOCK' ? 'bg-rose-500' : item.stockStatus === 'LOW_STOCK' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                {statusObj.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800 text-base">
                              {item.stock ?? item.availableStock ?? 0}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{item.minimumStockLevel ?? 10}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleViewBatches(item.medicineId, item.medicineName)}
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                {item.activeBatchesCount || 0} Batches
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleViewBatches(item.medicineId, item.medicineName)}
                                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                              >
                                Manage Batches
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. MASTER CATALOG TAB */}
            {activeTab === 'catalog' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">Medicine Name</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Brand / Mfr</th>
                      <th className="px-4 py-3.5">Unit</th>
                      <th className="px-4 py-3.5">Purchase Price</th>
                      <th className="px-4 py-3.5">Selling Price</th>
                      <th className="px-4 py-3.5">Stock</th>
                      <th className="px-4 py-3.5">Min Stock</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {catalogList.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-12 text-slate-400">
                          No medicines registered in catalog. Click "Add Medicine" to create one.
                        </td>
                      </tr>
                    ) : (
                      catalogList.map((med) => (
                        <tr key={med.uuid || med._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{med.medicineName}</div>
                            {med.genericName && (
                              <div className="text-xs text-slate-400 italic">{med.genericName}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{med.category || 'N/A'}</td>
                          <td className="px-4 py-3 text-slate-700">
                            <div>{med.brandName || 'Generic'}</div>
                            {med.manufacturer && (
                              <div className="text-xs text-slate-400">{med.manufacturer}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{med.unit || 'Unit'}</td>
                          <td className="px-4 py-3 text-slate-700">
                            ₹{Number(med.purchasePrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            ₹{Number(med.sellingPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {med.stock ?? med.availableStock ?? 0}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{med.minimumStockLevel ?? 10}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              med.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {med.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenMedicineModal(med)}
                                className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Medicine"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedicine(med.uuid || med._id, med.medicineName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Deactivate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. LOW STOCK ALERTS TAB */}
            {activeTab === 'low_stock' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-amber-50/50 text-xs uppercase text-amber-800 font-semibold border-b border-amber-200">
                    <tr>
                      <th className="px-4 py-3.5">Medicine Name</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Unit</th>
                      <th className="px-4 py-3.5">Available Units</th>
                      <th className="px-4 py-3.5">Threshold Level</th>
                      <th className="px-4 py-3.5">Deficit Units</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStockList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-400">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="font-medium text-slate-600">All medicines have healthy stock levels!</p>
                          <p className="text-xs text-slate-400 mt-1">No medicines currently below their minimum threshold.</p>
                        </td>
                      </tr>
                    ) : (
                      lowStockList.map((item) => {
                        const available = item.stock ?? item.availableStock ?? 0;
                        const min = item.minimumStockLevel ?? 10;
                        const deficit = min - available;
                        return (
                          <tr key={item.medicineId} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800">{item.medicineName}</div>
                              {item.genericName && (
                                <div className="text-xs text-slate-400 italic">{item.genericName}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{item.category || 'General'}</td>
                            <td className="px-4 py-3 text-slate-700">{item.unit || 'Unit'}</td>
                            <td className="px-4 py-3 font-bold text-rose-600 text-base">
                              {available}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{min}</td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                -{deficit > 0 ? deficit : 0} {item.unit || 'units'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleViewBatches(item.medicineId, item.medicineName)}
                                className="text-xs font-semibold px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                              >
                                View Batches
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. EXPIRING BATCHES TAB */}
            {activeTab === 'expiry' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">Medicine Name</th>
                      <th className="px-4 py-3.5">Batch Number</th>
                      <th className="px-4 py-3.5">Expiry Date</th>
                      <th className="px-4 py-3.5">Available Units</th>
                      <th className="px-4 py-3.5">Purchase Cost</th>
                      <th className="px-4 py-3.5">Days Left</th>
                      <th className="px-4 py-3.5">Alert Level</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expiryList.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12 text-slate-400">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="font-medium text-slate-600">No batches expiring within {expiryDays} days.</p>
                          <p className="text-xs text-slate-400 mt-1">All current inventory batches are safely within validity periods.</p>
                        </td>
                      </tr>
                    ) : (
                      expiryList.map((batch) => {
                        const alertClass = EXPIRY_BADGE[batch.alertCategory] || 'bg-slate-100 text-slate-700';
                        return (
                          <tr key={batch.batchId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {batch.medicineName}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-700">
                              {batch.batchNumber}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {batch.expiryDate}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800">
                              {batch.availableQuantity}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              ₹{Number(batch.purchasePrice || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${batch.daysRemaining <= 0 ? 'text-red-700' : batch.daysRemaining <= 30 ? 'text-rose-600' : 'text-amber-600'}`}>
                                {batch.daysRemaining <= 0 ? 'EXPIRED' : `${batch.daysRemaining} days`}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${alertClass}`}>
                                {batch.alertCategory?.replace(/_/g, ' ') || 'ALERT'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleOpenAdjustModal(batch, batch.medicineName)}
                                className="text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors"
                              >
                                Write-off / Adjust
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
              <p>
                Showing {totalElements === 0 ? 0 : page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} items
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
          </>
        )}
      </div>

      {/* 1. Add / Edit Medicine Modal */}
      <Modal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        title={editingMedicine ? "Edit Medicine" : "Add New Medicine to Catalog"}
      >
        <form onSubmit={handleSaveMedicine} className="flex flex-col gap-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                value={medicineFormData.medicineName}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, medicineName: e.target.value })}
                placeholder="e.g. Ashwagandha Tablets 500mg"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Generic / Botanical Name</label>
              <input
                type="text"
                value={medicineFormData.genericName}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, genericName: e.target.value })}
                placeholder="e.g. Withania somnifera"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={medicineFormData.category}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, category: e.target.value })}
                placeholder="e.g. Ayurveda, Naturopathy, Herbs"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={medicineFormData.brandName}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, brandName: e.target.value })}
                placeholder="e.g. Himalaya, Kottakkal"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure *</label>
              <select
                required
                value={medicineFormData.unit}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Bottle">Bottle</option>
                <option value="Syrup">Syrup</option>
                <option value="Powder (Churna)">Powder (Churna)</option>
                <option value="Oil (Tailam)">Oil (Tailam)</option>
                <option value="Pack">Pack</option>
                <option value="Strip">Strip</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Purchase Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={medicineFormData.purchasePrice}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, purchasePrice: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={medicineFormData.sellingPrice}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, sellingPrice: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={medicineFormData.minimumStockLevel}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, minimumStockLevel: e.target.value })}
                placeholder="10"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock (Initial / Available Stock)</label>
              <input
                type="number"
                min="0"
                value={medicineFormData.stock}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, stock: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Indications</label>
            <textarea
              rows="2"
              value={medicineFormData.description}
              onChange={(e) => setMedicineFormData({ ...medicineFormData, description: e.target.value })}
              placeholder="Clinical indications, usage guidelines, dosage recommendations..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {editingMedicine && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="activeStatus"
                checked={medicineFormData.active}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, active: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="activeStatus" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Active in Master Catalog
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMedicineModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingMedicine}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {savingMedicine ? 'Saving...' : editingMedicine ? 'Save Changes' : 'Create Medicine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Medicine Batches Inspection Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title={`Batches for "${selectedMedicineName}"`}
      >
        <div className="text-sm">
          {loadingBatches ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
              Loading batches...
            </div>
          ) : selectedMedicineBatches.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-slate-600">No active batches for this medicine.</p>
              <p className="text-xs text-slate-400 mt-1">Record a purchase invoice to add batch inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Batch #</th>
                    <th className="px-3 py-2.5">Expiry Date</th>
                    <th className="px-3 py-2.5">Available Qty</th>
                    <th className="px-3 py-2.5">Cost Price</th>
                    <th className="px-3 py-2.5">Selling Price</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedMedicineBatches.map((batch) => {
                    const isExp = batch.isExpired || (batch.daysUntilExpiry !== null && batch.daysUntilExpiry <= 0);
                    return (
                      <tr key={batch.uuid || batch.batchId} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                          {batch.batchNumber}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-700">
                          {batch.expiryDate}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-800 text-sm">
                          {batch.availableQuantity}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          ₹{Number(batch.purchasePrice || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-800">
                          ₹{Number(batch.sellingPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5">
                          {isExp ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              EXPIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {batch.daysUntilExpiry !== null ? `${batch.daysUntilExpiry}d left` : 'Active'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleOpenAdjustModal(batch, selectedMedicineName)}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setIsBatchModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Stock Adjustment (Damage / Expiry / Audit)"
      >
        <form onSubmit={handleSaveAdjustment} className="flex flex-col gap-4 text-sm">
          {adjustmentTarget && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs flex flex-col gap-1">
              <div><span className="text-slate-500">Medicine:</span> <strong className="text-slate-800">{adjustmentTarget.medicineName}</strong></div>
              <div><span className="text-slate-500">Batch:</span> <strong className="text-slate-800 font-mono">{adjustmentTarget.batchNumber}</strong></div>
              <div><span className="text-slate-500">Current Stock:</span> <strong className="text-slate-800 text-sm">{adjustmentTarget.availableQuantity} units</strong></div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Type *</label>
            <select
              value={adjustFormData.movementType}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, movementType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="MANUAL_ADJUSTMENT">Manual Stock Correction (Audit count)</option>
              <option value="DAMAGE">Damaged / Broken in Transit</option>
              <option value="EXPIRY">Expired Stock Write-off</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjustment Quantity *
            </label>
            <input
              type="number"
              required
              value={adjustFormData.quantity}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, quantity: e.target.value })}
              placeholder="e.g. -5 to reduce, 10 to increase"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * Enter negative number (e.g. -5) to deduct damaged/expired units, or positive to add.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mandatory Reason / Notes *</label>
            <textarea
              required
              rows="3"
              value={adjustFormData.reason}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, reason: e.target.value })}
              placeholder="Detail reasons for audit audit trail (e.g. Broken seal during delivery, Stock count discrepancy)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingAdjust}
              className="px-5 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {savingAdjust ? 'Submitting...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default MedicineInventory;

