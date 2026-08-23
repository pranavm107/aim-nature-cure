import React, { useState } from 'react';

const initialPulseState = { lu: '', li: '', st: '', sp: '', tw: '', pc: '', ht: '', si: '', liv: '', gb: '', ub: '', kid: '' };
const initialVitals = { height: '', weight: '', bp: '', heartRate: '', respiratoryRate: '', temperature: '' };
const initialPersonal = { appetite: '', sleep: '', bowel: '', micturition: '', thirst: '', addiction: '' };

const CaseSheetForm = ({ patient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    presentComplaints: '',
    vitals: initialVitals,
    obgHistory: '',
    personalHistory: initialPersonal,
    gpe: '',
    systemicExamination: '',
    pulseDiagnosis: initialPulseState,
    finalDiagnosis: ''
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    const caseSheetData = {
      ...formData,
      headerSnapshot: {
        idNumber: patient._id,
        name: patient.name,
        phone: patient.phone,
        age: patient.dob || 'Unknown', 
        gender: patient.gender,
        occupation: 'N/A',
        address: patient.address
      }
    };
    setShowConfirm(false);
    onSubmit(caseSheetData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">New Case Sheet Intake</h2>
          <p className="text-sm text-red-500 font-medium mt-1">Warning: Case Sheets cannot be modified after submission.</p>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Present Complaints */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Present Complaints</label>
          <textarea name="presentComplaints" value={formData.presentComplaints} onChange={handleChange} rows="3" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="Enter patient complaints..."></textarea>
        </div>

        {/* Vitals */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.keys(initialVitals).map(key => (
              <div key={key}>
                <label className="block text-xs text-slate-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input type={key==='bp'?'text':'number'} className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" value={formData.vitals[key]} onChange={(e) => handleNestedChange('vitals', key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Personal History</h3>
            <div className="space-y-3">
               {Object.keys(initialPersonal).map(key => (
                 <div key={key} className="flex items-center gap-3">
                   <label className="w-24 text-sm text-slate-600 capitalize">{key}:</label>
                   <input type="text" className="flex-1 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" value={formData.personalHistory[key]} onChange={(e) => handleNestedChange('personalHistory', key, e.target.value)} />
                 </div>
               ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">OBG History</label>
              <textarea name="obgHistory" value={formData.obgHistory} onChange={handleChange} rows="2" className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">General Physical Exam</label>
              <textarea name="gpe" value={formData.gpe} onChange={handleChange} rows="2" className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Systemic Exam</label>
              <textarea name="systemicExamination" value={formData.systemicExamination} onChange={handleChange} rows="2" className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
            </div>
          </div>
        </div>

        {/* Pulse Diagnosis */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Pulse Diagnosis</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
             {Object.keys(initialPulseState).map(meridian => (
                <div key={meridian}>
                  <label className="block text-xs text-slate-500 font-bold uppercase mb-1">{meridian}</label>
                  <input type="text" className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. deep" value={formData.pulseDiagnosis[meridian]} onChange={(e) => handleNestedChange('pulseDiagnosis', meridian, e.target.value)} />
                </div>
             ))}
          </div>
        </div>

        {/* Final Diagnosis */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Final Diagnosis</label>
          <textarea name="finalDiagnosis" value={formData.finalDiagnosis} onChange={handleChange} rows="2" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="Final assessment..."></textarea>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 font-medium transition">Cancel</button>
        <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition shadow-sm">Finalize & Submit</button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Finalize Case Sheet?</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to finalize the Case Sheet? This action is immutable and cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Confirm Finalize
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default CaseSheetForm;
