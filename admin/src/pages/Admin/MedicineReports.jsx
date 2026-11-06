import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  BarChart3, TrendingUp, DollarSign, ShoppingBag, 
  Users, RefreshCw, Calendar, PieChart, Layers, ArrowUpRight
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import medicineReportService from '../../services/medicineReportService';

const MedicineReports = () => {
  // Period filter
  const [period, setPeriod] = useState('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Report States
  const [revenueReport, setRevenueReport] = useState(null);
  const [profitReport, setProfitReport] = useState(null);
  const [stockValuation, setStockValuation] = useState(null);
  const [topSellingMeds, setTopSellingMeds] = useState([]);
  const [patientWiseReports, setPatientWiseReports] = useState([]);

  // Pagination for patient-wise
  const [patientPage, setPatientPage] = useState(0);
  const [patientTotalPages, setPatientTotalPages] = useState(1);
  const [patientTotalElements, setPatientTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);

  // Fetch all report data
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, profitRes, valRes, topRes, patRes] = await Promise.all([
        medicineReportService.getRevenueReport({ period, fromDate, toDate }),
        medicineReportService.getProfitReport({ period, fromDate, toDate }),
        medicineReportService.getStockValuation(),
        medicineReportService.getTopSellingMedicines({ period, fromDate, toDate, limit: 10 }),
        medicineReportService.getPatientWiseReport({ page: patientPage, size: 10 })
      ]);

      if (revRes.success) setRevenueReport(revRes.report);
      if (profitRes.success) setProfitReport(profitRes.report);
      if (valRes.success) setStockValuation(valRes.valuation);
      if (topRes.success) setTopSellingMeds(topRes.medicines);
      if (patRes.success) {
        setPatientWiseReports(patRes.patientReports);
        setPatientTotalPages(patRes.totalPages);
        setPatientTotalElements(patRes.totalElements);
      }
    } catch (err) {
      console.error('Failed to load medicine reports:', err);
      toast.error('Failed to load analytical reports');
    } finally {
      setLoading(false);
    }
  }, [period, fromDate, toDate, patientPage]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Derived margin
  const revenue = revenueReport?.medicineSalesRevenue ?? 0;
  const cogs = profitReport?.medicineCogs ?? 0;
  const grossProfit = profitReport?.medicineGrossProfit ?? (revenue - cogs);
  const marginPercent = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : '0.0';

  return (
    <PageContainer>
      <PageHeader 
        title="Medicine Financial Reports & Analytics"
        subtitle="Revenue, Cost of Goods Sold (COGS), gross margin, inventory valuation, and top performers"
        actions={
          <button
            onClick={loadReports}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Period Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['today', 'this_week', 'this_month', 'this_year', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setFromDate(''); setToDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                period === p && !fromDate
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Custom:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPeriod('custom'); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <span>to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPeriod('custom'); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicine Sales Revenue</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            ₹{Number(revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {revenueReport?.totalIssuesCount ?? 0} prescriptions fulfilled
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost of Goods Sold (COGS)</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            ₹{Number(cogs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Cost price of units dispensed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Profit</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{Number(grossProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {marginPercent}% profit margin
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Purchases Inflow</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            ₹{Number(revenueReport?.totalPurchases ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Procurement expense in period
          </p>
        </div>
      </div>

      {/* Stock Asset Valuation Banner */}
      {stockValuation && (
        <div className="bg-slate-900 text-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-bold">Total Inventory Asset Valuation</h3>
              <p className="text-xs text-slate-400">
                Live asset capital locked in {stockValuation.totalMedicinesCount} medicines & {stockValuation.totalActiveBatchesCount} batches
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Units In Stock</span>
              <span className="text-xl font-bold text-emerald-400">{Number(stockValuation.totalQuantityInStock || 0).toLocaleString()} units</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Valuation at Cost (Asset Capital):</span>
              <span className="text-xl font-bold text-white">
                ₹{Number(stockValuation.totalValuationAtCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Valuation at Retail (Selling Price):</span>
              <span className="text-xl font-bold text-white">
                ₹{Number(stockValuation.totalValuationAtSellingPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Potential Inventory Profit:</span>
              <span className="text-xl font-bold text-emerald-400">
                ₹{Number(stockValuation.potentialProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top-Selling Medicines Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-slate-800">Top-Selling Medicines (Ranked by Sales Volume)</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium capitalize">Period: {period.replace('_', ' ')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Medicine Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Units Sold</th>
                <th className="px-4 py-3">Sales Revenue</th>
                <th className="px-4 py-3">COGS</th>
                <th className="px-4 py-3">Gross Profit</th>
                <th className="px-4 py-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topSellingMeds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No sales data recorded for the selected period.
                  </td>
                </tr>
              ) : (
                topSellingMeds.map((med, index) => {
                  const profit = med.totalGrossProfit ?? (med.totalSalesRevenue - med.totalCogs);
                  const margin = med.totalSalesRevenue > 0 ? ((profit / med.totalSalesRevenue) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={med.medicineId || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {index + 1}. {med.medicineName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{med.category || 'General'}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {med.totalQuantitySold} {med.unit || 'units'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        ₹{Number(med.totalSalesRevenue || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        ₹{Number(med.totalCogs || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        ₹{Number(profit || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">
                        {margin}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient-Wise Medicine Billing & Outstanding Report */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-slate-800">Patient-Wise Medicine Charges & Outstanding</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Billed vs Outstanding</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Issues Count</th>
                <th className="px-4 py-3">Total Billed</th>
                <th className="px-4 py-3">Total Paid</th>
                <th className="px-4 py-3">Outstanding Balance</th>
                <th className="px-4 py-3 text-right">Last Dispensed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientWiseReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No patient medicine charges found.
                  </td>
                </tr>
              ) : (
                patientWiseReports.map((pat) => (
                  <tr key={pat.patientId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{pat.patientName}</div>
                      <div className="text-xs text-slate-400 font-mono">{pat.idNumber || 'ID'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{pat.phoneNumber || '-'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{pat.totalIssuesCount}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      ₹{Number(pat.totalBilledAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">
                      ₹{Number(pat.totalPaidAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-600">
                      ₹{Number(pat.totalOutstandingAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {pat.lastIssueDate || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            Showing {patientTotalElements === 0 ? 0 : patientPage * 10 + 1} to {Math.min((patientPage + 1) * 10, patientTotalElements)} of {patientTotalElements} patients
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={patientPage === 0}
              onClick={() => setPatientPage(p => Math.max(0, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-xs font-medium"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {patientPage + 1} of {Math.max(1, patientTotalPages)}
            </span>
            <button
              disabled={patientPage + 1 >= patientTotalPages}
              onClick={() => setPatientPage(p => p + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-xs font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default MedicineReports;

