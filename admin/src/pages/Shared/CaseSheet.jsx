import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { caseSheetService } from '../../services/caseSheetService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { InputField, TextareaField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

const PulseInput = ({ label, value, onChange, disabled }) => (
  <div className="flex flex-col items-center gap-1 p-2 border rounded-md bg-gray-50">
    <span className="font-medium text-gray-700 text-sm">{label}</span>
    <input 
      type="text" 
      className="w-full text-center text-sm border-b border-gray-300 bg-transparent focus:outline-none focus:border-primary disabled:text-gray-500" 
      value={value} 
      onChange={(e) => onChange(label.toLowerCase(), e.target.value)}
      disabled={disabled}
    />
  </div>
);

const CaseSheet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    presentComplaints: '',
    vitals: { height: '', weight: '', bp: '', heartRate: '', respiratoryRate: '', temperature: '' },
    obgHistory: '',
    personalHistory: { appetite: '', sleep: '', bowel: '', micturition: '', thirst: '', addiction: '' },
    gpe: '',
    systemicExamination: '',
    pulseDiagnosis: { lu: '', li: '', st: '', sp: '', tw: '', pc: '', ht: '', si: '', liv: '', gb: '', ub: '', kid: '' },
    finalDiagnosis: ''
  });

  const [treatmentProtocols, setTreatmentProtocols] = useState([]);
  const [newProtocolText, setNewProtocolText] = useState('');
  const [editingProtocolId, setEditingProtocolId] = useState(null);
  const [editingProtocolText, setEditingProtocolText] = useState('');

  const fetchCaseSheetData = async () => {
    setLoading(true);
    try {
      const pRes = await patientService.getPatientById(id);
      if (pRes.success) setPatient(pRes.patient);
      else { toast.error("Patient not found"); navigate('/patients'); return; }

      const cRes = await caseSheetService.getCaseSheetByPatientId(id);
      if (cRes.success && cRes.caseSheet) {
        const cs = cRes.caseSheet;
        setFormData({
          presentComplaints: cs.presentComplaints || '',
          vitals: cs.vitals || { height: '', weight: '', bp: '', heartRate: '', respiratoryRate: '', temperature: '' },
          obgHistory: cs.obgHistory || '',
          personalHistory: cs.personalHistory || { appetite: '', sleep: '', bowel: '', micturition: '', thirst: '', addiction: '' },
          gpe: cs.gpe || '',
          systemicExamination: cs.systemicExamination || '',
          pulseDiagnosis: cs.pulseDiagnosis || { lu: '', li: '', st: '', sp: '', tw: '', pc: '', ht: '', si: '', liv: '', gb: '', ub: '', kid: '' },
          finalDiagnosis: cs.finalDiagnosis || ''
        });
        setTreatmentProtocols(cs.treatmentProtocols || []);
        setIsEditing(false); // If exists, open in view mode
      } else {
        setIsEditing(true); // If no case sheet, open in edit mode
      }
    } catch (err) {
      toast.error("Failed to load case sheet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseSheetData();
  }, [id]);

  const handleSaveCaseSheet = async () => {
    setSaving(true);
    try {
      const res = await caseSheetService.saveCaseSheet(id, formData);
      if (res.success) {
        toast.success("Case Sheet saved successfully");
        setIsEditing(false);
      }
    } catch (err) {
      toast.error("Failed to save Case Sheet");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTreatment = async () => {
    if (!newProtocolText.trim()) return;
    try {
      // Must save case sheet first if it doesn't exist
      await caseSheetService.saveCaseSheet(id, formData);
      const res = await caseSheetService.addTreatmentProtocol(id, newProtocolText);
      if (res.success) {
        setTreatmentProtocols([...treatmentProtocols, res.protocol]);
        setNewProtocolText('');
        toast.success("Treatment protocol added");
      }
    } catch (err) {
      toast.error("Failed to add treatment protocol");
    }
  };

  const handleUpdateTreatment = async () => {
    if (!editingProtocolText.trim()) return;
    try {
      const res = await caseSheetService.updateTreatmentProtocol(id, editingProtocolId, editingProtocolText);
      if (res.success) {
        setTreatmentProtocols(treatmentProtocols.map(p => p._id === editingProtocolId ? { ...p, details: editingProtocolText } : p));
        setEditingProtocolId(null);
        setEditingProtocolText('');
      }
    } catch (err) {
      toast.error("Failed to update protocol");
    }
  };

  const handleDeleteTreatment = async (protocolId) => {
    try {
      const res = await caseSheetService.deleteTreatmentProtocol(id, protocolId);
      if (res.success) {
        setTreatmentProtocols(treatmentProtocols.filter(p => p._id !== protocolId));
        toast.success("Protocol removed");
      }
    } catch (err) {
      toast.error("Failed to remove protocol");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const updateNestedField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  if (loading || !patient) return <div className="flex h-screen items-center justify-center">Loading Case Sheet...</div>;

  return (
    <PageContainer>
      <div className="print:hidden">
        <PageHeader 
          title="Patient Case Sheet" 
          subtitle="Clinical assessment and treatment protocols" 
          backLink={`/patient/${id}`}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mb-4 print:hidden">
        <button onClick={handlePrint} className="px-4 py-2 border rounded-lg hover:bg-gray-50 bg-white flex items-center gap-2 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.728 9.75h10.544M6.728 12.75h10.544M6.728 15.75h10.544M4.5 19.5v-15A2.25 2.25 0 016.75 2.25h10.5a2.25 2.25 0 012.25 2.25v15M8.25 19.5h7.5M8.25 22.5h7.5" /></svg>
          Print Case Sheet
        </button>
        {isEditing ? (
          <>
            <button onClick={() => fetchCaseSheetData()} className="px-4 py-2 border rounded-lg hover:bg-gray-50 bg-white text-sm font-medium">Cancel Edit</button>
            <PrimaryButton onClick={handleSaveCaseSheet} disabled={saving}>{saving ? 'Saving...' : 'Save Case Sheet'}</PrimaryButton>
          </>
        ) : (
          <PrimaryButton onClick={() => setIsEditing(true)}>Edit Case Sheet</PrimaryButton>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none p-6 md:p-10 mb-8 max-w-4xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">AIM NATURE CURE</h1>
          <h2 className="text-lg font-medium text-gray-600 tracking-widest mt-1">HOSPITAL</h2>
          <div className="mt-4 inline-block bg-gray-100 px-6 py-2 rounded-full border border-gray-300">
            <h3 className="text-xl font-bold text-gray-800 tracking-widest">CASE SHEET</h3>
          </div>
        </div>

        {/* PATIENT INFO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
          <div><span className="font-semibold text-gray-700">Patient ID:</span> <span className="text-gray-800">{patient._id}</span></div>
          <div><span className="font-semibold text-gray-700">Date:</span> <span className="text-gray-800">{new Date().toLocaleDateString()}</span></div>
          <div className="col-span-2"><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-800 font-medium">{patient.name}</span></div>
          <div><span className="font-semibold text-gray-700">Age:</span> <span className="text-gray-800">{patient.dob ? (new Date().getFullYear() - new Date(patient.dob).getFullYear()) : 'N/A'}</span></div>
          <div><span className="font-semibold text-gray-700">Gender:</span> <span className="text-gray-800">{patient.gender}</span></div>
          <div className="col-span-2"><span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-800">{patient.phone}</span></div>
          <div className="col-span-4 border-t pt-4 mt-2"><span className="font-semibold text-gray-700">Address:</span> <span className="text-gray-800">{patient.address}</span></div>
        </div>

        {/* CLINICAL DATA */}
        <div className="space-y-8">
          
          <section>
            <h4 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-wide border-b pb-1">Present Complaints</h4>
            {isEditing ? (
              <textarea className="w-full border p-3 rounded focus:outline-none focus:border-primary min-h-24" value={formData.presentComplaints} onChange={e => setFormData({...formData, presentComplaints: e.target.value})} placeholder="Patient complaints..." />
            ) : (
              <p className="whitespace-pre-wrap text-gray-700 min-h-16">{formData.presentComplaints || 'N/A'}</p>
            )}
          </section>

          <section>
            <h4 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-wide border-b pb-1">Vital Data</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">Height:</span> 
                {isEditing ? <input type="text" className="border-b focus:outline-none focus:border-primary flex-1 min-w-0" value={formData.vitals.height} onChange={e => updateNestedField('vitals', 'height', e.target.value)} /> : <span className="border-b flex-1 min-w-0 pb-1">{formData.vitals.height}</span>} cm
              </div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">Weight:</span> 
                {isEditing ? <input type="text" className="border-b focus:outline-none focus:border-primary flex-1 min-w-0" value={formData.vitals.weight} onChange={e => updateNestedField('vitals', 'weight', e.target.value)} /> : <span className="border-b flex-1 min-w-0 pb-1">{formData.vitals.weight}</span>} kg
              </div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">BP:</span> 
                {isEditing ? <input type="text" className="border-b focus:outline-none focus:border-primary flex-1 min-w-0" value={formData.vitals.bp} onChange={e => updateNestedField('vitals', 'bp', e.target.value)} /> : <span className="border-b flex-1 min-w-0 pb-1">{formData.vitals.bp}</span>} mmHg
              </div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">Heart Rate:</span> 
                {isEditing ? <input type="text" className="border-b focus:outline-none focus:border-primary flex-1 min-w-0" value={formData.vitals.heartRate} onChange={e => updateNestedField('vitals', 'heartRate', e.target.value)} /> : <span className="border-b flex-1 min-w-0 pb-1">{formData.vitals.heartRate}</span>} bpm
              </div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">Resp Rate:</span> 
                {isEditing ? <input type="text" className="border-b focus:outline-none focus:border-primary flex-1 min-w-0" value={formData.vitals.respiratoryRate} onChange={e => updateNestedField('vitals', 'respiratoryRate', e.target.value)} /> : <span className="border-b flex-1 min-w-0 pb-1">{formData.vitals.respiratoryRate}</span>} cpm
              </div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">Temp:</span> 
                {isEditing ? <input type="text" className="border-b focus:outline-none focus:border-primary flex-1 min-w-0" value={formData.vitals.temperature} onChange={e => updateNestedField('vitals', 'temperature', e.target.value)} /> : <span className="border-b flex-1 min-w-0 pb-1">{formData.vitals.temperature}</span>}
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-wide border-b pb-1">OBG History</h4>
            {isEditing ? (
              <textarea className="w-full border p-3 rounded focus:outline-none focus:border-primary min-h-16" value={formData.obgHistory} onChange={e => setFormData({...formData, obgHistory: e.target.value})} placeholder="OBG history (if applicable)..." />
            ) : (
              <p className="whitespace-pre-wrap text-gray-700">{formData.obgHistory || 'N/A'}</p>
            )}
          </section>

          <section>
            <h4 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-wide border-b pb-1">Personal History</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              {['Appetite', 'Sleep', 'Bowel', 'Micturition', 'Thirst', 'Addiction'].map(key => {
                const fKey = key.toLowerCase();
                return (
                  <div key={key} className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">{key}:</span> 
                    {isEditing ? <input type="text" className="border-b focus:outline-none focus:border-primary flex-1 min-w-0" value={formData.personalHistory[fKey]} onChange={e => updateNestedField('personalHistory', fKey, e.target.value)} /> : <span className="border-b flex-1 min-w-0 pb-1">{formData.personalHistory[fKey] || '-'}</span>}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-wide border-b pb-1">GPE (General Physical Examination)</h4>
            {isEditing ? (
              <textarea className="w-full border p-3 rounded focus:outline-none focus:border-primary min-h-24" value={formData.gpe} onChange={e => setFormData({...formData, gpe: e.target.value})} />
            ) : (
              <p className="whitespace-pre-wrap text-gray-700 min-h-16">{formData.gpe || 'N/A'}</p>
            )}
          </section>

          <section>
            <h4 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-wide border-b pb-1">Systemic Examination</h4>
            {isEditing ? (
              <textarea className="w-full border p-3 rounded focus:outline-none focus:border-primary min-h-24" value={formData.systemicExamination} onChange={e => setFormData({...formData, systemicExamination: e.target.value})} />
            ) : (
              <p className="whitespace-pre-wrap text-gray-700 min-h-16">{formData.systemicExamination || 'N/A'}</p>
            )}
          </section>

          <section>
            <h4 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-wide border-b pb-1">Pulse Diagnosis</h4>
            <div className="grid grid-cols-6 gap-2">
              {['Lu', 'Li', 'St', 'Sp', 'Tw', 'Pc'].map(lbl => (
                <PulseInput key={lbl} label={lbl} value={formData.pulseDiagnosis[lbl.toLowerCase()]} onChange={(k, v) => updateNestedField('pulseDiagnosis', k, v)} disabled={!isEditing} />
              ))}
              {['Ht', 'Si', 'Liv', 'GB', 'UB', 'Kid'].map(lbl => (
                <PulseInput key={lbl} label={lbl} value={formData.pulseDiagnosis[lbl.toLowerCase()]} onChange={(k, v) => updateNestedField('pulseDiagnosis', k, v)} disabled={!isEditing} />
              ))}
            </div>
          </section>

          <section>
            <h4 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-wide border-b pb-1">Final Diagnosis</h4>
            {isEditing ? (
              <textarea className="w-full border p-3 rounded focus:outline-none focus:border-primary min-h-24 text-lg font-medium" value={formData.finalDiagnosis} onChange={e => setFormData({...formData, finalDiagnosis: e.target.value})} />
            ) : (
              <p className="whitespace-pre-wrap text-gray-900 font-bold text-lg min-h-16">{formData.finalDiagnosis || 'N/A'}</p>
            )}
          </section>
        </div>

        {/* TREATMENT PROTOCOLS (Separate Page/Section in print) */}
        <div className="mt-12 pt-8 border-t-2 border-gray-800 print:break-before-page">
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 tracking-widest">TREATMENT PROTOCOLS</h3>
          </div>

          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="py-2 font-bold w-1/4">Date</th>
                  <th className="py-2 font-bold">Treatment Protocol / Details</th>
                  <th className="py-2 w-24 print:hidden text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {treatmentProtocols.length === 0 ? (
                  <tr><td colSpan="3" className="py-4 text-center text-gray-500 border-b">No treatment protocols added.</td></tr>
                ) : (
                  treatmentProtocols.map(p => (
                    <tr key={p._id} className="border-b">
                      <td className="py-3 font-medium align-top">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="py-3 align-top whitespace-pre-wrap">
                        {editingProtocolId === p._id ? (
                          <textarea className="w-full border p-2 text-sm rounded focus:outline-none focus:border-primary" rows={3} value={editingProtocolText} onChange={(e) => setEditingProtocolText(e.target.value)} />
                        ) : p.details}
                      </td>
                      <td className="py-3 align-top print:hidden text-right">
                        {editingProtocolId === p._id ? (
                          <div className="flex flex-col gap-1">
                            <button onClick={handleUpdateTreatment} className="text-xs text-white bg-primary px-2 py-1 rounded">Save</button>
                            <button onClick={() => setEditingProtocolId(null)} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <button onClick={() => { setEditingProtocolId(p._id); setEditingProtocolText(p.details); }} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteTreatment(p._id)} className="text-xs text-red-600 hover:underline">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Treatment Input */}
          <div className="print:hidden bg-gray-50 p-4 rounded-lg border flex flex-col gap-3">
            <label className="font-semibold text-gray-700 text-sm">Add New Treatment Entry</label>
            <textarea 
              value={newProtocolText} 
              onChange={e => setNewProtocolText(e.target.value)} 
              placeholder="Describe the treatment protocol..."
              className="w-full border rounded p-2 focus:outline-none focus:border-primary"
              rows={3}
            />
            <div className="flex justify-end">
              <PrimaryButton onClick={handleAddTreatment}>+ Add Entry</PrimaryButton>
            </div>
            <p className="text-xs text-gray-500 italic mt-1 text-right">Save Case Sheet first to enable adding protocols if this is a new sheet.</p>
          </div>
        </div>

        {/* SIGNATURE AREA */}
        <div className="mt-16 pt-8 flex justify-between items-end">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Date:</p>
            <div className="border-b border-gray-400 w-32 pb-1 text-gray-800">{new Date().toLocaleDateString()}</div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700 mb-1">Doctor Signature</p>
            <div className="border-b border-gray-400 w-48 pb-1 text-gray-800 h-8 font-signature text-xl"></div>
            <p className="text-xs text-gray-500 mt-1">{patient.docData?.name || 'Dr. Assigned'}</p>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default CaseSheet;
