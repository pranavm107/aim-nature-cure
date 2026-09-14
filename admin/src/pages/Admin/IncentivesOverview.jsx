import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { incentiveService } from '../../services/incentiveService';
import { toast } from 'react-toastify';
import { Plus, Edit, Ban, Percent, IndianRupee } from 'lucide-react';
import { InputField, SelectField } from '../../components/common/FormFields';

const IncentivesOverview = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'Revenue',
    category: 'Consultation',
    value: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await incentiveService.getIncentiveRules();
      if (res.success) {
        setRules(res.rules);
      } else {
        toast.error("Failed to load incentive rules");
      }
    } catch (err) {
      toast.error("Error loading rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      type: 'Revenue',
      category: 'Consultation',
      value: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setModalMode('edit');
    setSelectedRuleId(rule._id);
    setFormData({
      type: rule.type,
      category: rule.category,
      value: rule.value,
      effectiveFrom: rule.effectiveFrom,
      status: rule.status
    });
    setModalOpen(true);
  };

  const handleDeactivate = async (rule) => {
    if (window.confirm(`Deactivate ${rule.category} incentive rule?`)) {
      try {
        const res = await incentiveService.deactivateIncentiveRule(rule._id);
        if (res.success) {
          toast.success(res.message);
          fetchRules();
        } else {
          toast.error(res.message);
        }
      } catch (err) {
        toast.error("Error deactivating rule");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.value || Number(formData.value) <= 0) {
      toast.error("Value must be greater than zero");
      return;
    }

    try {
      if (modalMode === 'add') {
        const res = await incentiveService.createIncentiveRule({
          type: formData.type,
          category: formData.category,
          value: Number(formData.value),
          effectiveFrom: formData.effectiveFrom,
          status: formData.status
        });
        if (res.success) {
          toast.success(res.message);
          setModalOpen(false);
          fetchRules();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await incentiveService.updateIncentiveRule(selectedRuleId, {
          value: Number(formData.value),
          effectiveFrom: formData.effectiveFrom,
          status: formData.status
        });
        if (res.success) {
          toast.success(res.message);
          setModalOpen(false);
          fetchRules();
        } else {
          toast.error(res.message);
        }
      }
    } catch (err) {
      toast.error("Error saving rule");
    }
  };

  const revenueRules = rules.filter(r => r.type === 'Revenue');
  const activityRules = rules.filter(r => r.type === 'Activity');

  const renderTable = (data, isRevenue) => {
    if (data.length === 0) {
      return (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <p>No {isRevenue ? 'Revenue' : 'Activity'} incentive rules configured.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Value</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Effective From</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(rule => (
                <tr key={rule._id} className={`hover:bg-slate-50 transition-colors ${rule.status === 'Inactive' ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">{rule.category}</td>
                  <td className="py-3 px-4 text-sm font-bold text-slate-700 flex items-center gap-1">
                    {isRevenue ? <>{rule.value}<Percent className="w-3 h-3 text-slate-400" /></> : <><IndianRupee className="w-3 h-3 text-slate-400" />{rule.value}</>}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {new Date(rule.effectiveFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rule.displayStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      rule.displayStatus === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                      rule.displayStatus === 'Inactive' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {rule.displayStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(rule)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Rule"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {rule.status === 'Active' && (
                        <button 
                          onClick={() => handleDeactivate(rule)} 
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Deactivate Rule"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const revenueCategories = [
    { value: 'Consultation', label: 'Consultation' },
    { value: 'Treatment', label: 'Treatment' },
    { value: 'Package', label: 'Package' }
  ];

  const activityCategories = [
    { value: 'Patient Follow-up', label: 'Patient Follow-up' },
    { value: 'Social Media Activity', label: 'Social Media Activity' }
  ];

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Incentive Management" subtitle="Configure revenue and activity rules" />
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Incentive Rule
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading rules...</div>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Revenue Incentive Rules</h3>
            {renderTable(revenueRules, true)}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Activity Incentive Rules</h3>
            {renderTable(activityRules, false)}
          </div>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalMode === 'add' ? 'Add Incentive Rule' : 'Edit Incentive Rule'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {modalMode === 'add' && (
                  <>
                    <SelectField
                      label="Rule Type"
                      options={[
                        { value: 'Revenue', label: 'Revenue' },
                        { value: 'Activity', label: 'Activity' }
                      ]}
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setFormData({
                          ...formData,
                          type: newType,
                          category: newType === 'Revenue' ? 'Consultation' : 'Patient Follow-up'
                        });
                      }}
                      required
                    />
                    <SelectField
                      label="Category"
                      options={formData.type === 'Revenue' ? revenueCategories : activityCategories}
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    />
                  </>
                )}
                
                {modalMode === 'edit' && (
                  <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Type</p>
                      <p className="text-sm font-semibold text-slate-800">{formData.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Category</p>
                      <p className="text-sm font-semibold text-slate-800">{formData.category}</p>
                    </div>
                  </div>
                )}

                <InputField
                  label={formData.type === 'Revenue' ? 'Percentage (%)' : 'Amount (₹)'}
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                />
                
                <InputField
                  label="Effective From"
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({...formData, effectiveFrom: e.target.value})}
                  required
                />
                
                {modalMode === 'edit' && (
                  <SelectField
                    label="Status"
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' }
                    ]}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  />
                )}
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
                >
                  {modalMode === 'add' ? 'Create Rule' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default IncentivesOverview;
