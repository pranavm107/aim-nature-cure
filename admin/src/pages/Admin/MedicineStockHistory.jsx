import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  History, Search, RefreshCw, Filter, ArrowUpRight, 
  ArrowDownLeft, AlertTriangle, Layers, Calendar
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import medicineInventoryService from '../../services/medicineInventoryService';
import medicineService from '../../services/medicineService';

const MOVEMENT_BADGES = {
  PURCHASE: {
    label: 'Purchase Inflow',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ArrowDownLeft
  },
  ISSUE: {
    label: 'Dispensed / Issue',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ArrowUpRight
  },
  DAMAGE: {
    label: 'Damaged Stock',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle
  },
  EXPIRY: {
    label: 'Expired Write-off',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertTriangle
  },
  MANUAL_ADJUSTMENT: {
    label: 'Manual Adjustment',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: RefreshCw
  }
};

const MedicineStockHistory = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  // Filters
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [selectedMovementType, setSelectedMovementType] = useState('ALL');

  // Medicine list for filter
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const res = await medicineService.getActiveMedicines();
        if (res.success) {
          setMedicines(res.medicines);
        }
      } catch (err) {
        console.error('Failed to load medicines for movement filter:', err);
      }
    };
    fetchMeds();
  }, []);

  const loadMovements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await medicineInventoryService.getStockMovements({
        medicineId: selectedMedicineId || null,
        movementType: selectedMovementType,
        page,
        size
      });
      if (res.success) {
        setMovements(res.movements);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      } else {
        toast.error(res.message || 'Failed to load stock movements');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching stock audit trail');
    } finally {
      setLoading(false);
    }
  }, [selectedMedicineId, selectedMovementType, page, size]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  return (
    <PageContainer>
      <PageHeader 
        title="Stock Movement History & Audit Trail"
        subtitle="Complete ledger of every batch inflow, dispensing outflow, damage write-off, and adjustment"
        actions={
          <button
            onClick={loadMovements}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <select
              value={selectedMedicineId}
              onChange={(e) => { setSelectedMedicineId(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Medicines</option>
              {medicines.map(m => (
                <option key={m.uuid || m._id} value={m.uuid || m._id}>
                  {m.medicineName}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedMovementType}
              onChange={(e) => { setSelectedMovementType(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Movement Types</option>
              <option value="PURCHASE">Purchase Inflow (+)</option>
              <option value="ISSUE">Dispensed / Issue (-)</option>
              <option value="DAMAGE">Damaged Stock (-)</option>
              <option value="EXPIRY">Expired Write-off (-)</option>
              <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
            </select>
          </div>

          {(selectedMedicineId || selectedMovementType !== 'ALL') && (
            <button
              onClick={() => { setSelectedMedicineId(''); setSelectedMovementType('ALL'); setPage(0); }}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Page size:</span>
          <select
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm">Loading audit ledger...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-slate-600 text-base">No stock movement logs found.</p>
            <p className="text-xs text-slate-400 mt-1">Actions like purchases, dispensing, or adjustments will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Medicine</th>
                  <th className="px-4 py-3.5">Batch #</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Quantity Change</th>
                  <th className="px-4 py-3.5">Balance After</th>
                  <th className="px-4 py-3.5">Unit Price</th>
                  <th className="px-4 py-3.5">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((mov) => {
                  const badge = MOVEMENT_BADGES[mov.movementType] || {
                    label: mov.movementType,
                    className: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: History
                  };
                  const Icon = badge.icon;
                  const isPositive = mov.quantity > 0;
                  return (
                    <tr key={mov.uuid || mov._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {mov.createdAt ? new Date(mov.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {mov.medicineName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {mov.batchNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm">
                        <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                          {isPositive ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {mov.balanceAfter !== null ? mov.balanceAfter : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {mov.unitPrice ? `₹${Number(mov.unitPrice).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                        {mov.reason || mov.referenceType || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            Showing {totalElements === 0 ? 0 : page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} movements
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
    </PageContainer>
  );
};

export default MedicineStockHistory;

