import React, { useState, useEffect, useCallback } from 'react';
import { patientService } from '../../services/patientService';
import therapyService from '../../services/therapyService';
import packageService from '../../services/packageService';
import medicineService from '../../services/medicineService';
import therapyAssignmentService from '../../services/therapyAssignmentService';
import MultiSelect from '../../components/common/MultiSelect';
import PatientSelectDropdown from '../../components/common/PatientSelectDropdown';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Package, 
  Activity, 
  ArrowRight, 
  IndianRupee, 
  Trash2, 
  Clock, 
  Receipt, 
  CheckCircle2,
  Calendar,
  Pill,
  Plus,
  RefreshCw,
  ClipboardList
} from 'lucide-react';

const TherapyAssignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPatientId = location.state?.patientId || searchParams.get('patientId') || '';

  const [selectedPatientObj, setSelectedPatientObj] = useState(null);
  const [therapies, setTherapies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activeMedicines, setActiveMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: initialPatientId,
    assignmentType: 'therapy', // 'therapy' or 'package'
    selectedTherapyIds: [],
    packageId: '',
    doctorFees: 0,
    assignedDate: new Date().toISOString().split('T')[0],
    assignedTime: new Date().toTimeString().slice(0, 5)
  });

  // Configured therapy items: [{ therapyId, name, duration, sessions, price }]
  const [configuredItems, setConfiguredItems] = useState([]);

  // Configured medicine rows: [{ id, medicineId, medicineName, unit, availableStock, quantity, price }]
  const [medicineRows, setMedicineRows] = useState([]);

  // Therapy Assignments Table State (GET /api/v1/therapy-assignments/all)
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsPage, setAssignmentsPage] = useState(0);
  const [assignmentsSize, setAssignmentsSize] = useState(10);
  const [assignmentsTotalElements, setAssignmentsTotalElements] = useState(0);
  const [assignmentsTotalPages, setAssignmentsTotalPages] = useState(1);

  const fetchAssignments = useCallback(async (patientIdFilter = formData.patientId, page = assignmentsPage, size = assignmentsSize) => {
    setAssignmentsLoading(true);
    try {
      const res = await therapyAssignmentService.getPatientAssignments(
        patientIdFilter || null,
        page,
        size
      );
      if (res.success) {
        setAssignmentsList(res.assignments || []);
        setAssignmentsTotalElements(res.totalElements || 0);
        setAssignmentsTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load therapy assignments:', err);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [formData.patientId, assignmentsPage, assignmentsSize]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [thersRes, pkgsRes, medsRes] = await Promise.all([
          therapyService.getTherapiesDropdown(),
          packageService.getAllPackages(),
          medicineService.getActiveMedicines()
        ]);
        
        const thers = thersRes?.success ? thersRes.therapies : [];
        setTherapies(thers);
        
        const pkgs = pkgsRes?.success ? pkgsRes.packages : [];
        setPackages(pkgs.filter(p => p.status === true));

        const meds = medsRes?.success ? medsRes.medicines : [];
        setActiveMedicines(meds);

        if (initialPatientId) {
          const patRes = await patientService.getPatientById(initialPatientId);
          if (patRes.success && patRes.patient) {
            setSelectedPatientObj(patRes.patient);
          }
        }
      } catch (error) {
        toast.error('Failed to load data for assignment');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialPatientId]);

  useEffect(() => {
    fetchAssignments(formData.patientId, assignmentsPage, assignmentsSize);
  }, [formData.patientId, assignmentsPage, assignmentsSize, fetchAssignments]);

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

  // Medicine Rows Handlers
  const addMedicineRow = () => {
    setMedicineRows(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        medicineId: '',
        medicineName: '',
        unit: '',
        availableStock: 0,
        quantity: 1,
        price: 0
      }
    ]);
  };

  const removeMedicineRow = (rowId) => {
    setMedicineRows(prev => prev.filter(row => row.id !== rowId));
  };

  const handleMedicineSelect = (rowId, selectedMedId) => {
    const medObj = activeMedicines.find(m => (m.uuid || m._id) === selectedMedId);
    setMedicineRows(prev => prev.map(row => {
      if (row.id === rowId) {
        if (!medObj) {
          return {
            ...row,
            medicineId: '',
            medicineName: '',
            unit: '',
            availableStock: 0,
            price: 0
          };
        }
        return {
          ...row,
          medicineId: medObj.uuid || medObj._id,
          medicineName: medObj.medicineName || '',
          unit: medObj.unit || 'Unit',
          availableStock: medObj.stock ?? medObj.availableStock ?? 0,
          quantity: row.quantity || 1,
          price: Number(medObj.sellingPrice || 0)
        };
      }
      return row;
    }));
  };

  const updateMedicineRowField = (rowId, field, value) => {
    setMedicineRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return { ...row, [field]: value };
      }
      return row;
    }));
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

  const validMedicineRows = medicineRows.filter(row => row.medicineId);
  const medicinesSubtotal = validMedicineRows.reduce(
    (sum, row) => sum + ((parseInt(row.quantity, 10) || 0) * (parseFloat(row.price) || 0)),
    0
  );

  const doctorFeesAmount = Math.max(0, Number(formData.doctorFees) || 0);

  const therapyOrPackageRevenue = formData.assignmentType === 'therapy' 
    ? totalStandaloneRevenue 
    : packageRevenue;

  const totalRevenue = therapyOrPackageRevenue + medicinesSubtotal + doctorFeesAmount;

  const hasValidAssignmentItems =
    (formData.assignmentType === 'therapy' && (configuredItems.length > 0 || validMedicineRows.length > 0)) ||
    (formData.assignmentType === 'package' && Boolean(formData.packageId));

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
      if (configuredItems.length === 0 && validMedicineRows.length === 0) {
        return toast.error('Please select at least one therapy or medicine to assign.');
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

    for (const medRow of validMedicineRows) {
      const qty = parseInt(medRow.quantity, 10) || 0;
      if (qty < 1) {
        return toast.error(`Please specify a valid quantity (at least 1) for ${medRow.medicineName || 'selected medicine'}.`);
      }
      if (medRow.availableStock > 0 && qty > medRow.availableStock) {
        return toast.error(`Quantity (${qty}) exceeds available stock (${medRow.availableStock}) for ${medRow.medicineName}.`);
      }
    }

    setSubmitting(true);
    try {
      const docId = localStorage.getItem('userId') || localStorage.getItem('doctorId') || '12e6f0c9-1a3b-42d2-9e9e-283a8de28a54';
      const formattedTime = formData.assignedTime.length === 5 ? `${formData.assignedTime}:00` : formData.assignedTime;

      const medicinesPayload = validMedicineRows.map(row => ({
        medicineId: row.medicineId,
        quantity: Math.max(1, parseInt(row.quantity, 10) || 1),
        price: Math.max(0, parseFloat(row.price) || 0)
      }));

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
          medicines: medicinesPayload,
          doctorFees: doctorFeesAmount,
          assignedDate: formData.assignedDate,
          assignedTime: formattedTime,
          userId: docId
        });

        if (!assignRes.success) {
          throw new Error(assignRes.message);
        }

        toast.success(`Assignment saved on ${formData.assignedDate} at ${formData.assignedTime}! Total revenue of ₹${totalRevenue.toLocaleString('en-IN')} credited.`);
      } else {
        // Real API Call: POST /api/v1/therapy-assignments/assign (Package)
        const assignRes = await therapyAssignmentService.assign({
          patientId: formData.patientId,
          assignmentType: 'Package',
          packageId: formData.packageId,
          medicines: medicinesPayload,
          doctorFees: doctorFeesAmount,
          assignedDate: formData.assignedDate,
          assignedTime: formattedTime,
          userId: docId
        });

        if (!assignRes.success) {
          throw new Error(assignRes.message);
        }

        toast.success(`Successfully assigned package on ${formData.assignedDate} at ${formData.assignedTime}! Total revenue of ₹${totalRevenue.toLocaleString('en-IN')} credited.`);
      }

      fetchAssignments(formData.patientId, 0, assignmentsSize);
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

  return (
    <div className="m-5 max-w-4xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Assign Therapy, Medicines & Generate Revenue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Prescribe standalone therapies, packages, medicines, and doctor fees with automated revenue attribution.
        </p>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELECT PATIENT WITH INFINITE SCROLL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-slate-700 text-sm font-bold">
                Select Patient <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">Search & scroll to browse all</span>
            </div>
            <PatientSelectDropdown
              value={formData.patientId}
              onChange={(patientId, patientObj) => {
                setFormData(prev => ({ ...prev, patientId }));
                setSelectedPatientObj(patientObj);
                setAssignmentsPage(0);
              }}
              required
              placeholder="Search by name, ID (e.g. AIM...), or phone..."
            />
            {selectedPatientObj && (
              <div className="mt-3 p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {selectedPatientObj.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-850 text-sm flex items-center gap-2">
                      <span>{selectedPatientObj.name}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {selectedPatientObj.patientId || selectedPatientObj.idNumber}
                      </span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-3 mt-0.5">
                      {selectedPatientObj.phone && (
                        <span>📞 {selectedPatientObj.phone}</span>
                      )}
                      {selectedPatientObj.doctorName && (
                        <span>Doctor: <strong className="text-slate-700">{selectedPatientObj.doctorName}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
                {selectedPatientObj.status && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-center ${
                    selectedPatientObj.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedPatientObj.status}
                  </span>
                )}
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

          {/* THERAPY / PACKAGE SELECTION AREA */}
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
                      Configure Therapy Sessions & Pricing ({configuredItems.length} selected)
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

          {/* MEDICINE SELECTION SECTION */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  Assign Medicines (Optional)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add medicines to dispense with this assignment. Automatically deducts stock and adds to revenue.
                </p>
              </div>
              <button
                type="button"
                onClick={addMedicineRow}
                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            {medicineRows.length === 0 ? (
              <div className="p-5 text-center bg-white text-slate-400 text-xs">
                No medicines added yet. Click <strong>"+ Add Medicine"</strong> to prescribe medicines alongside this assignment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 p-3 bg-white space-y-3">
                {medicineRows.map((row, idx) => {
                  const lineTotal = (parseInt(row.quantity, 10) || 0) * (parseFloat(row.price) || 0);
                  return (
                    <div key={row.id} className="pt-3 first:pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        {/* Medicine Dropdown */}
                        <div className="sm:col-span-5">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Medicine #{idx + 1}
                          </label>
                          <select
                            value={row.medicineId}
                            onChange={(e) => handleMedicineSelect(row.id, e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                          >
                            <option value="">-- Select Medicine --</option>
                            {activeMedicines.map((med) => {
                              const medId = med.uuid || med._id;
                              const stockVal = med.stock ?? med.availableStock ?? 0;
                              const priceVal = Number(med.sellingPrice || 0);
                              return (
                                <option key={medId} value={medId}>
                                  {med.medicineName} ({med.unit || 'Unit'}) — Stock: {stockVal} — ₹{priceVal.toLocaleString('en-IN')}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Quantity {row.medicineId ? <span className="text-[10px] text-slate-400">(Avail: {row.availableStock})</span> : null}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={row.availableStock > 0 ? row.availableStock : undefined}
                            value={row.quantity}
                            onChange={(e) => updateMedicineRowField(row.id, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Unit Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.price}
                              onChange={(e) => updateMedicineRowField(row.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full bg-white border border-slate-300 rounded-lg pl-6 pr-2 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="sm:col-span-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex flex-col justify-center">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Line Total</span>
                          <span className="text-sm font-bold text-emerald-600">
                            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <div className="sm:col-span-1 flex justify-end pb-1">
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(row.id)}
                            className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove medicine row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DOCTOR FEES FIELD */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <label className="block text-slate-700 text-sm font-bold mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-primary" />
              Doctor Fees (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={formData.doctorFees}
                onChange={(e) => setFormData({ ...formData, doctorFees: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Included in total generated revenue and attributed to the doctor.
            </p>
          </div>

          {/* LIVE REVENUE GENERATION SUMMARY PANEL */}
          {(hasValidAssignmentItems || doctorFeesAmount > 0 || medicinesSubtotal > 0) && (
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-500/10">
                <div>
                  <p className="text-xs text-slate-500">
                    {formData.assignmentType === 'therapy'
                      ? `Therapy Subtotal (${totalSessions} sess)`
                      : 'Package Subtotal'}
                  </p>
                  <p className="text-base font-semibold text-slate-800">
                    ₹{therapyOrPackageRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Medicines Subtotal ({validMedicineRows.length})
                  </p>
                  <p className="text-base font-semibold text-slate-800">
                    ₹{medicinesSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Doctor Fees</p>
                  <p className="text-base font-semibold text-slate-800">
                    ₹{doctorFeesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="col-span-2 sm:col-span-1 bg-white/80 p-2.5 rounded-lg border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Grand Total (Revenue)</p>
                    <p className="text-lg font-extrabold text-emerald-600">
                      ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500/60 shrink-0" />
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
            disabled={submitting || !hasValidAssignmentItems}
            className="w-full bg-primary text-white py-3.5 px-4 rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Sessions, Dispensing Medicines & Creating Invoice...</span>
              </>
            ) : (
              <>
                <span>
                  {totalRevenue > 0 
                    ? `Assign & Generate Revenue (₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` 
                    : 'Assign and Generate Sessions'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* RECENT THERAPY ASSIGNMENTS LIST / TABLE (GET /api/v1/therapy-assignments/all) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              {selectedPatientObj ? `Therapy Assignments for ${selectedPatientObj.name}` : 'Recent Therapy Assignments'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes assigned therapies, packages, dispensed medicines, and doctor fees.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchAssignments(formData.patientId, assignmentsPage, assignmentsSize)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-center shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${assignmentsLoading ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Therapy / Package</th>
                <th className="px-4 py-3">Medicine</th>
                <th className="px-4 py-3">Doctor Fees</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignmentsLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    Loading assignments...
                  </td>
                </tr>
              ) : assignmentsList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No therapy assignments found.
                  </td>
                </tr>
              ) : (
                assignmentsList.map((asn) => (
                  <tr key={asn.uuid || asn._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{asn.assignedDate || '—'}</div>
                      {asn.assignedTime && (
                        <div className="text-xs text-slate-400 font-mono">{String(asn.assignedTime).slice(0, 5)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {asn.patientName || selectedPatientObj?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {asn.assignmentType || 'Standalone'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {asn.therapyName || asn.packageName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {asn.medicineName ? (
                        <div>
                          <span className="font-medium text-slate-800">{asn.medicineName}</span>
                          <div className="text-xs text-slate-500">
                            {asn.medicineQuantity ? `Qty: ${asn.medicineQuantity}` : ''}
                            {asn.medicinePrice != null ? ` • ₹${Number(asn.medicinePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {asn.doctorFees != null && Number(asn.doctorFees) > 0
                        ? `₹${Number(asn.doctorFees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : '₹0.00'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        asn.status === 'Active' || asn.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {asn.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {assignmentsTotalElements > assignmentsSize && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {assignmentsPage * assignmentsSize + 1}–{Math.min((assignmentsPage + 1) * assignmentsSize, assignmentsTotalElements)} of {assignmentsTotalElements}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={assignmentsPage === 0}
                onClick={() => setAssignmentsPage(p => Math.max(0, p - 1))}
                className="px-2.5 py-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-700">
                Page {assignmentsPage + 1} of {Math.max(1, assignmentsTotalPages)}
              </span>
              <button
                type="button"
                disabled={assignmentsPage + 1 >= assignmentsTotalPages}
                onClick={() => setAssignmentsPage(p => p + 1)}
                className="px-2.5 py-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapyAssignment;
