import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import therapyService from '../../services/therapyService';
import packageService from '../../services/packageService';
import therapyAssignmentService from '../../services/therapyAssignmentService';
import MultiSelect from '../../components/common/MultiSelect';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Package, 
  Activity, 
  User, 
  ArrowRight, 
  IndianRupee, 
  Trash2, 
  Clock, 
  Receipt, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

const TherapyAssignment = () => {
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: '',
    assignmentType: 'therapy', // 'therapy' or 'package'
    selectedTherapyIds: [],
    packageId: '',
    assignedDate: new Date().toISOString().split('T')[0],
    assignedTime: new Date().toTimeString().slice(0, 5)
  });

  // Configured items: [{ therapyId, name, duration, sessions, price }]
  const [configuredItems, setConfiguredItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patRes, thersRes, pkgsRes] = await Promise.all([
          patientService.getPatients(),
          therapyService.getTherapiesDropdown(),
          packageService.getAllPackages()
        ]);
        setPatients(patRes.patients || []);
        
        const thers = thersRes?.success ? thersRes.therapies : [];
        setTherapies(thers);
        
        const pkgs = pkgsRes?.success ? pkgsRes.packages : [];
        setPackages(pkgs.filter(p => p.status === true));
      } catch (error) {
        toast.error('Failed to load data for assignment');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Synchronize configuredItems whenever selectedTherapyIds changes
  const handleTherapySelectionChange = (newIds) => {
    setFormData(prev => ({ ...prev, selectedTherapyIds: newIds }));

    setConfiguredItems(prevItems => {
      const existingMap = new Map(prevItems.map(item => [item.therapyId, item]));
      return newIds.map(id => {
        if (existingMap.has(id)) {
          return existingMap.get(id);
        }
        const tObj = therapies.find(t => (t._id === id || t.uuid === id));
        return {
          therapyId: id,
          name: tObj?.name || 'Therapy',
          duration: tObj?.duration || 30,
          sessions: 1,
          price: Number(tObj?.price || 0)
        };
      });
    });
  };

  const updateItemConfig = (therapyId, field, value) => {
    setConfiguredItems(prev => prev.map(item => {
      if (item.therapyId === therapyId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeItem = (therapyId) => {
    const updatedIds = formData.selectedTherapyIds.filter(id => id !== therapyId);
    handleTherapySelectionChange(updatedIds);
  };

  // Calculations
  const totalSessions = configuredItems.reduce(
    (sum, item) => sum + (parseInt(item.sessions, 10) || 0), 
    0
  );

  const totalStandaloneRevenue = configuredItems.reduce(
    (sum, item) => sum + ((parseInt(item.sessions, 10) || 0) * (parseFloat(item.price) || 0)), 
    0
  );

  const selectedPackage = packages.find(
    p => p._id === formData.packageId || p.uuid === formData.packageId
  );
  const packageRevenue = Number(selectedPackage?.price || 0);

  const totalRevenue = formData.assignmentType === 'therapy' 
    ? totalStandaloneRevenue 
    : packageRevenue;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      return toast.error('Please select a patient.');
    }

    if (!formData.assignedDate) {
      return toast.error('Please specify the assignment date.');
    }

    if (!formData.assignedTime) {
      return toast.error('Please specify the assignment time.');
    }

    if (formData.assignmentType === 'therapy') {
      if (!formData.selectedTherapyIds || formData.selectedTherapyIds.length === 0) {
        return toast.error('Please select at least one therapy.');
      }
      for (const item of configuredItems) {
        if (!item.sessions || item.sessions < 1) {
          return toast.error(`Please specify valid sessions for ${item.name}`);
        }
      }
    } else {
      if (!formData.packageId) {
        return toast.error('Please select a package to assign.');
      }
    }

    setSubmitting(true);
    try {
      const docId = localStorage.getItem('userId') || localStorage.getItem('doctorId') || '12e6f0c9-1a3b-42d2-9e9e-283a8de28a54';
      const formattedTime = formData.assignedTime.length === 5 ? `${formData.assignedTime}:00` : formData.assignedTime;

      if (formData.assignmentType === 'therapy') {
        const items = configuredItems.map(item => ({
          therapyId: item.therapyId,
          name: item.name,
          sessions: Math.max(1, parseInt(item.sessions, 10) || 1),
          price: Math.max(0, parseFloat(item.price) || 0)
        }));

        // Real API Call: POST /api/v1/therapy-assignments/assign
        const assignRes = await therapyAssignmentService.assign({
          patientId: formData.patientId,
          assignmentType: 'Standalone',
          items,
          assignedDate: formData.assignedDate,
          assignedTime: formattedTime,
          userId: docId
        });

        if (!assignRes.success) {
          throw new Error(assignRes.message);
        }

        toast.success(`Successfully assigned ${items.length} therapies on ${formData.assignedDate} at ${formData.assignedTime}! Revenue of ₹${totalStandaloneRevenue.toLocaleString('en-IN')} credited.`);
      } else {
        // Real API Call: POST /api/v1/therapy-assignments/assign (Package)
        const assignRes = await therapyAssignmentService.assign({
          patientId: formData.patientId,
          assignmentType: 'Package',
          packageId: formData.packageId,
          assignedDate: formData.assignedDate,
          assignedTime: formattedTime,
          userId: docId
        });

        if (!assignRes.success) {
          throw new Error(assignRes.message);
        }

        toast.success(`Successfully assigned package on ${formData.assignedDate} at ${formData.assignedTime}! Revenue of ₹${packageRevenue.toLocaleString('en-IN')} credited.`);
      }

      navigate('/doctor/therapy-sessions');
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(error.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p>Loading assignment form...</p>
      </div>
    );
  }

  const selectedPatient = patients.find(p => p._id === formData.patientId || p.uuid === formData.patientId);

  return (
    <div className="m-5 max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Assign Therapy & Generate Revenue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Prescribe standalone therapies or packages with date & time and automated doctor revenue attribution.
        </p>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELECT PATIENT */}
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">
              Select Patient <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                required
              >
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p._id || p.uuid} value={p._id || p.uuid}>
                    {p.name} {p.phoneNumber ? `(${p.phoneNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {selectedPatient && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-primary" />
                  {selectedPatient.name}
                </span>
                <span className="text-slate-500">
                  ID: <span className="font-mono text-slate-700">{selectedPatient.idNumber || selectedPatient._id?.slice(0, 8)}</span>
                </span>
              </div>
            )}
          </div>

          {/* DATE AND TIME PICKER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                Assignment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.assignedDate}
                onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                Assignment Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.assignedTime}
                onChange={(e) => setFormData({ ...formData, assignedTime: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
          </div>

          {/* ASSIGNMENT TYPE */}
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">Assignment Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  formData.assignmentType === 'therapy' 
                    ? 'border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="assignmentType" 
                  value="therapy" 
                  checked={formData.assignmentType === 'therapy'} 
                  onChange={() => setFormData({...formData, assignmentType: 'therapy', packageId: ''})}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <Activity className="w-5 h-5 text-primary" />
                <span>Standalone Therapies</span>
              </label>

              <label 
                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  formData.assignmentType === 'package' 
                    ? 'border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="assignmentType" 
                  value="package" 
                  checked={formData.assignmentType === 'package'} 
                  onChange={() => {
                    setFormData({...formData, assignmentType: 'package', selectedTherapyIds: []});
                    setConfiguredItems([]);
                  }}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <Package className="w-5 h-5 text-primary" />
                <span>Pre-defined Package</span>
              </label>
            </div>
          </div>

          {/* SELECTION AREA */}
          {formData.assignmentType === 'therapy' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">
                  Select Therapies (Multiselect) <span className="text-red-500">*</span>
                </label>
                <MultiSelect 
                  options={therapies.map(t => ({
                    value: t._id || t.uuid,
                    label: `${t.name} (₹${Number(t.price || 0).toLocaleString('en-IN')})`,
                    raw: t
                  }))}
                  selectedValues={formData.selectedTherapyIds}
                  onChange={handleTherapySelectionChange}
                  placeholder="-- Select One or Multiple Therapies --"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Choose therapies to prescribe. You can customize the sessions count and price for each below.
                </p>
              </div>

              {/* CONFIGURED THERAPIES LIST WITH PER-THERAPY SESSIONS & PRICE */}
              {configuredItems.length > 0 && (
                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Configure Sessions & Pricing ({configuredItems.length} selected)
                    </span>
                    <span className="text-xs text-slate-500">
                      Total: <span className="font-semibold text-slate-800">{totalSessions} sessions</span>
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 p-2 bg-white">
                    {configuredItems.map((item) => {
                      const lineTotal = (parseInt(item.sessions, 10) || 0) * (parseFloat(item.price) || 0);

                      return (
                        <div key={item.therapyId} className="p-3.5 hover:bg-slate-50/60 rounded-lg transition-colors">
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                              <span className="text-xs text-slate-400">({item.duration || 30} mins/session)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.therapyId)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                              title="Remove therapy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Sessions input */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Sessions Count
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={item.sessions}
                                onChange={(e) => updateItemConfig(item.therapyId, 'sessions', Math.max(1, parseInt(e.target.value, 10) || 1))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                              />
                            </div>

                            {/* Price per session input */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Price / Session (₹)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={item.price}
                                  onChange={(e) => updateItemConfig(item.therapyId, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                                  className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                                />
                              </div>
                            </div>

                            {/* Subtotal */}
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col justify-center">
                              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Subtotal</span>
                              <span className="text-sm font-bold text-emerald-600">
                                ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2">
                Select Package <span className="text-red-500">*</span>
              </label>
              <select 
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                value={formData.packageId}
                onChange={(e) => setFormData({...formData, packageId: e.target.value})}
                required
              >
                <option value="">-- Select Package --</option>
                {packages.map(p => (
                  <option key={p._id || p.uuid} value={p._id || p.uuid}>
                    {p.name || p.packageName} {p.price ? `(₹${Number(p.price).toLocaleString('en-IN')})` : ''}
                  </option>
                ))}
              </select>

              {selectedPackage && (
                <div className="mt-3 p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{selectedPackage.name || selectedPackage.packageName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Fixed package price bundle</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">
                    ₹{Number(selectedPackage.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* REAL-TIME REVENUE SUMMARY PANEL */}
          {((formData.assignmentType === 'therapy' && configuredItems.length > 0) || (formData.assignmentType === 'package' && formData.packageId)) && (
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-primary/5 border border-emerald-500/20 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Revenue Generation Summary
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                  Automated Invoice & Payment
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-500/10">
                {formData.assignmentType === 'therapy' ? (
                  <>
                    <div>
                      <p className="text-xs text-slate-500">Therapies</p>
                      <p className="text-base font-semibold text-slate-800">{configuredItems.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Sessions</p>
                      <p className="text-base font-semibold text-slate-800">{totalSessions}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-xs text-slate-500">Package Type</p>
                    <p className="text-base font-semibold text-slate-800">Pre-defined</p>
                  </div>
                )}
                
                <div className="col-span-2 sm:col-span-1 bg-white/70 p-2.5 rounded-lg border border-emerald-500/20">
                  <p className="text-xs text-slate-500 font-medium">Total Generated Revenue</p>
                  <p className="text-xl font-extrabold text-emerald-600">
                    ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic pt-1">
                ℹ️ Attributed immediately to the assigned doctor. Reflected in Today, This Week, and This Month revenue analytics.
              </p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={submitting || (formData.assignmentType === 'therapy' && configuredItems.length === 0) || (formData.assignmentType === 'package' && !formData.packageId)}
            className="w-full bg-primary text-white py-3.5 px-4 rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Sessions & Invoices...</span>
              </>
            ) : (
              <>
                <span>
                  {totalRevenue > 0 
                    ? `Assign & Generate Revenue (₹${totalRevenue.toLocaleString('en-IN')})` 
                    : 'Assign and Generate Sessions'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TherapyAssignment;
