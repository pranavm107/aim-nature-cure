import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, RefreshCw, Eye, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import medicineIssueService from '../../services/medicineIssueService';
import Modal from '../common/Modal';

const PatientMedicineHistory = ({ patientId }) => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIssues = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await medicineIssueService.getIssuesByPatient(patientId);
      if (res.success) {
        setIssues(res.issues || []);
      }
    } catch (err) {
      console.error('Failed to load patient medicine issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [patientId]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-800">Prescribed & Issued Medicines</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchIssues}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Medicine History"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/admin/inventory/issue')}
            className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Dispense Medicines
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
          Loading medicine records...
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <p className="text-slate-500 text-sm mb-1">No medicines have been dispensed to this patient yet.</p>
          <p className="text-xs text-slate-400">Click "Dispense Medicines" above to fulfill a prescription.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {issues.map((iss) => (
            <div 
              key={iss.uuid || iss._id}
              className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-800">
                    {iss.issueNumber || 'ISSUE'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {iss.issueDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Total: ₹{Number(iss.totalAmount || 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => { setSelectedIssue(iss); setIsModalOpen(true); }}
                    className="p-1 text-primary hover:text-primary/80"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-slate-600 flex flex-wrap gap-2">
                {iss.items?.map((it, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 font-medium text-slate-700">
                    <span className="text-primary font-bold">{it.quantity}x</span> {it.medicineName}
                    {it.batchNumber && <span className="text-slate-400 font-mono text-[10px]">({it.batchNumber})</span>}
                  </span>
                ))}
              </div>

              {iss.notes && (
                <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                  Dosage / Instructions: {iss.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedIssue ? `Dispensed Medicines - ${selectedIssue.issueNumber || 'Details'}` : 'Details'}
      >
        {selectedIssue && (
          <div className="flex flex-col gap-4 text-xs text-slate-600">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
              <div>
                <span className="text-slate-400 block">Date Dispensed:</span>
                <strong className="text-slate-800">{selectedIssue.issueDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Invoice #:</span>
                <strong className="text-slate-800 font-mono">{selectedIssue.invoiceNumber || 'N/A'}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Total Billed:</span>
                <strong className="text-primary text-sm">₹{Number(selectedIssue.totalAmount || 0).toFixed(2)}</strong>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Medicine</th>
                    <th className="px-3 py-2">Batch #</th>
                    <th className="px-3 py-2">Quantity</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedIssue.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium text-slate-800">{it.medicineName}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{it.batchNumber || 'FIFO'}</td>
                      <td className="px-3 py-2 font-bold text-slate-800">{it.quantity}</td>
                      <td className="px-3 py-2">₹{Number(it.unitPrice || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-800">
                        ₹{Number(it.totalPrice || (it.quantity * it.unitPrice) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedIssue.notes && (
              <div className="bg-blue-50/50 p-2.5 rounded border border-blue-200 text-xs">
                <strong>Dosage Instructions:</strong> {selectedIssue.notes}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientMedicineHistory;

