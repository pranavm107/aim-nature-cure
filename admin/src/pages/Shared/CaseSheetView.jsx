import { Lock } from 'lucide-react';

const CaseSheetView = ({ caseSheet, onAddProtocol, isDoctor }) => {
  if (!caseSheet) return null;

  const { headerSnapshot, vitals, personalHistory, pulseDiagnosis } = caseSheet;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Info */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Case Sheet Intake Record</h2>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1.5 border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            Finalized (Immutable)
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-slate-500 block text-xs">Date</span><span className="font-medium text-slate-800">{new Date(caseSheet.date).toLocaleDateString()}</span></div>
          <div><span className="text-slate-500 block text-xs">Patient Name</span><span className="font-medium text-slate-800">{headerSnapshot?.name || 'N/A'}</span></div>
          <div><span className="text-slate-500 block text-xs">ID Number</span><span className="font-medium text-slate-800">{headerSnapshot?.idNumber || 'N/A'}</span></div>
          <div><span className="text-slate-500 block text-xs">Age / Gender</span><span className="font-medium text-slate-800">{headerSnapshot?.age || '-'} / {headerSnapshot?.gender || '-'}</span></div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Present Complaints */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Present Complaints</h3>
          <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">{caseSheet.presentComplaints || 'None recorded'}</p>
        </div>

        {/* Vitals */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Vitals</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-primary/5 p-2 rounded-lg text-center border border-primary/20">
              <span className="block text-xs text-primary font-medium">Height</span>
              <span className="text-sm font-bold text-slate-800">{vitals?.height || '-'} cm</span>
            </div>
            <div className="bg-primary/5 p-2 rounded-lg text-center border border-primary/20">
              <span className="block text-xs text-primary font-medium">Weight</span>
              <span className="text-sm font-bold text-slate-800">{vitals?.weight || '-'} kg</span>
            </div>
            <div className="bg-primary/5 p-2 rounded-lg text-center border border-primary/20">
              <span className="block text-xs text-primary font-medium">BP</span>
              <span className="text-sm font-bold text-slate-800">{vitals?.bp || '-'}</span>
            </div>
            <div className="bg-primary/5 p-2 rounded-lg text-center border border-primary/20">
              <span className="block text-xs text-primary font-medium">Heart Rate</span>
              <span className="text-sm font-bold text-slate-800">{vitals?.heartRate || '-'}</span>
            </div>
            <div className="bg-primary/5 p-2 rounded-lg text-center border border-primary/20">
              <span className="block text-xs text-primary font-medium">Resp. Rate</span>
              <span className="text-sm font-bold text-slate-800">{vitals?.respiratoryRate || '-'}</span>
            </div>
            <div className="bg-primary/5 p-2 rounded-lg text-center border border-primary/20">
              <span className="block text-xs text-primary font-medium">Temp</span>
              <span className="text-sm font-bold text-slate-800">{vitals?.temperature || '-'} °F</span>
            </div>
          </div>
        </div>

        {/* History & Exams */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Personal History</h3>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Appetite:</span> <span className="font-medium text-slate-800">{personalHistory?.appetite || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Sleep:</span> <span className="font-medium text-slate-800">{personalHistory?.sleep || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Bowel:</span> <span className="font-medium text-slate-800">{personalHistory?.bowel || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Micturition:</span> <span className="font-medium text-slate-800">{personalHistory?.micturition || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thirst:</span> <span className="font-medium text-slate-800">{personalHistory?.thirst || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Addiction:</span> <span className="font-medium text-slate-800">{personalHistory?.addiction || '-'}</span></div>
            </div>
          </div>
          <div>
             <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Examinations</h3>
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3 text-sm">
               <div>
                 <span className="text-slate-500 block mb-1">General Physical Exam:</span>
                 <p className="font-medium text-slate-800">{caseSheet.gpe || '-'}</p>
               </div>
               <div className="border-t border-slate-200 pt-2">
                 <span className="text-slate-500 block mb-1">Systemic Exam:</span>
                 <p className="font-medium text-slate-800">{caseSheet.systemicExamination || '-'}</p>
               </div>
               <div className="border-t border-slate-200 pt-2">
                 <span className="text-slate-500 block mb-1">OBG History:</span>
                 <p className="font-medium text-slate-800">{caseSheet.obgHistory || '-'}</p>
               </div>
             </div>
          </div>
        </div>

        {/* Pulse Diagnosis */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Pulse Diagnosis</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
             {['lu', 'li', 'st', 'sp', 'tw', 'pc', 'ht', 'si', 'liv', 'gb', 'ub', 'kid'].map(meridian => (
                <div key={meridian} className="bg-slate-50 p-2 rounded-lg text-center border border-slate-200">
                  <span className="block text-xs text-primary font-bold uppercase">{meridian}</span>
                  <span className="text-sm font-medium text-slate-800 truncate block" title={pulseDiagnosis?.[meridian] || '-'}>
                    {pulseDiagnosis?.[meridian] || '-'}
                  </span>
                </div>
             ))}
          </div>
        </div>

        {/* Final Diagnosis */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Final Diagnosis</h3>
          <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">{caseSheet.finalDiagnosis || 'None recorded'}</p>
        </div>

      </div>
    </div>
  );
};

export default CaseSheetView;
