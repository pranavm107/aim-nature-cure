import React, { useState, useContext, useEffect } from 'react';
import { dailyReportService } from '../../services/dailyReportService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { TextareaField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';
import Badge from '../../components/common/Badge';

const DoctorDailyReport = () => {
  const { profileData } = useContext(DoctorContext);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  
  // selectedReport represents { report, summary } returned from getDoctorDailyReport
  const [selectedReportContext, setSelectedReportContext] = useState(null);
  
  const [addendumNote, setAddendumNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  
  const [formData, setFormData] = useState({
    summary: '',
    issues: ''
  });
  
  const [reportError, setReportError] = useState(null);
  const [loadingDate, setLoadingDate] = useState(false);
  
  // Single source of truth for the active date being viewed
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const getLocalDateObj = (dateStr) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const stepDate = (days) => {
    const d = getLocalDateObj(selectedDateStr);
    d.setDate(d.getDate() + days);
    const ny = d.getFullYear();
    const nm = String(d.getMonth() + 1).padStart(2, '0');
    const nd = String(d.getDate()).padStart(2, '0');
    loadDateReport(`${ny}-${nm}-${nd}`);
  };

  const fetchHistoryAndToday = async () => {
    if (!profileData) return;
    setLoading(true);
    try {
      // 1. Fetch History
      const histRes = await dailyReportService.getDoctorReportsList(profileData._id);
      if (histRes.success) {
        const sorted = histRes.reports.sort((a,b) => b.date - a.date);
        setHistory(sorted);
      }
      
      // 2. Fetch/Create Today's Report Context
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      await loadDateReport(todayStr);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const loadDateReport = async (dateStr) => {
    if (!profileData) return;
    setSelectedDateStr(dateStr);
    setLoadingDate(true);
    setReportError(null);
    setSelectedReportContext(null); // explicit clear
    try {
      const res = await dailyReportService.getDoctorDailyReport(profileData._id, dateStr);
      if (res.success) {
        setSelectedReportContext(res);
        if (res.report.status === 'Draft') {
          setFormData({
            summary: res.report.summary || '',
            issues: res.report.issues || ''
          });
        }
      } else {
        setReportError("Failed to calculate the daily summary.");
      }
    } catch (err) {
      toast.error("Failed to load specific date report");
      setReportError("An error occurred while calculating the daily summary.");
    } finally {
      setLoadingDate(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndToday();
  }, [profileData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReportContext || selectedReportContext.report.status !== 'Draft') return;
    
    setSubmitting(true);
    try {
      const res = await dailyReportService.submitDailyReport({
        doctorId: profileData._id,
        reportDateStr: selectedReportContext.report.reportDate,
        summary: formData.summary,
        issues: formData.issues
      });
      if (res.success) {
        toast.success("Daily report submitted successfully");
        fetchHistoryAndToday(); // Reload everything
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAddendum = async (e) => {
    e.preventDefault();
    if (!addendumNote.trim() || !selectedReportContext?.report?._id) return;
    setAddingNote(true);
    try {
      const res = await dailyReportService.addReportAddendum(selectedReportContext.report._id, addendumNote, profileData._id);
      if (res.success) {
        toast.success("Note added successfully");
        setAddendumNote('');
        loadDateReport(selectedReportContext.report.reportDate); // Reload current context
      }
    } catch (err) {
      toast.error(err.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  // UI Helpers
  const renderStatusBadge = (status) => {
    if (status === 'Reviewed') return <Badge variant="success">Reviewed by Admin</Badge>;
    if (status === 'Submitted' || status === 'Pending') return <Badge variant="warning">Pending Admin Review</Badge>;
    return <Badge variant="secondary">Draft</Badge>;
  };

  const renderMetricsGrid = (summary) => (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Patients</p>
        <p className="font-semibold text-lg">{summary?.patientsSeen || 0}</p>
      </div>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Consults</p>
        <p className="font-semibold text-lg">{summary?.consultations || 0}</p>
      </div>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Therapies</p>
        <p className="font-semibold text-lg">{summary?.therapySessions || 0}</p>
      </div>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Follow-Ups</p>
        <p className="font-semibold text-lg">{summary?.followUps || 0}</p>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-500 uppercase font-bold tracking-wider">Social</p>
        <p className="font-semibold text-lg text-blue-700">{summary?.socialMediaActivities || 0}</p>
      </div>
    </div>
  );

  const formattedDisplayDate = getLocalDateObj(selectedDateStr).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Daily Closing Report" 
        subtitle={formattedDisplayDate} 
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => stepDate(-1)} 
          disabled={loadingDate}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 transition-colors"
        >
          &larr; Previous Day
        </button>
        <button 
          onClick={() => {
            const d = new Date();
            loadDateReport(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
          }} 
          disabled={loadingDate}
          className="px-4 py-2 bg-primary text-white border border-transparent rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Today
        </button>
        <button 
          onClick={() => stepDate(1)} 
          disabled={loadingDate}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 transition-colors"
        >
          Next Day &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedReportContext ? (
            <div className="space-y-6">
              <Card>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center rounded-t-xl">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Report Details</h3>
                    {selectedReportContext.report.submittedAt && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Submitted at {new Date(selectedReportContext.report.submittedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {renderStatusBadge(selectedReportContext.report.status)}
                </div>
                
                {/* Content */}
                <div className="p-6">
                  {/* Aggregated Metrics */}
                  {renderMetricsGrid(selectedReportContext.summary)}

                  {/* Patient Activity Section */}
                  {selectedReportContext.summary.patientActivities && (
                    <Card title={`Today's Patient Activity`} className="mb-6 border-slate-200 shadow-sm">
                       <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                             <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                   <th className="p-3 font-semibold">Patient</th>
                                   <th className="p-3 font-semibold">Consultation</th>
                                   <th className="p-3 font-semibold">Therapy</th>
                                   <th className="p-3 font-semibold text-center">Sessions</th>
                                   <th className="p-3 font-semibold">Follow-up</th>
                                </tr>
                             </thead>
                             <tbody className="text-sm">
                               {selectedReportContext.summary.patientActivities.length === 0 ? (
                                 <tr>
                                   <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                                      No patient activity recorded for this date.
                                   </td>
                                 </tr>
                               ) : (
                                 selectedReportContext.summary.patientActivities.map(p => (
                                   <tr key={p.patientId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                      <td className="p-3 font-medium text-slate-800">{p.patientName}</td>
                                      <td className="p-3">
                                         {p.consultationStatus === 'Completed' ? <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-xs">Completed</span> : <span className="text-slate-300">—</span>}
                                      </td>
                                      <td className="p-3 text-slate-700">
                                         {p.therapies.length > 0 ? p.therapies.map(t => t.therapyName).join(', ') : <span className="text-slate-300">—</span>}
                                      </td>
                                      <td className="p-3 text-center text-slate-700 font-medium">
                                         {p.totalTherapySessions > 0 ? p.totalTherapySessions : <span className="text-slate-300">—</span>}
                                      </td>
                                      <td className="p-3">
                                         {p.followUpStatus === 'Completed' ? <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-xs">Completed</span> : <span className="text-slate-300">—</span>}
                                      </td>
                                   </tr>
                                 ))
                               )}
                             </tbody>
                          </table>
                       </div>
                    </Card>
                  )}

                  {/* Form or Locked Data depending on status */}
                  {selectedReportContext.report.status === 'Draft' ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6 border-t border-slate-100 pt-6">
                      <p className="text-sm text-slate-500 italic mb-2">Metrics above are automatically calculated from your daily activities.</p>
                      
                      <TextareaField 
                        label="Daily Summary" 
                        required 
                        placeholder="Summarize the day's operations, notable cases, or general progress..."
                        rows={4}
                        value={formData.summary} 
                        onChange={e => setFormData({...formData, summary: e.target.value})} 
                      />

                      <TextareaField 
                        label="Operational Issues / Blockers" 
                        placeholder="Report any equipment issues, supply shortages, or operational blockers..."
                        rows={3}
                        value={formData.issues} 
                        onChange={e => setFormData({...formData, issues: e.target.value})} 
                      />

                      <div className="flex justify-end pt-2">
                        <PrimaryButton type="submit" disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit Report'}
                        </PrimaryButton>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-sm font-bold text-slate-700 mb-2">Summary</p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 min-h-[4rem]">
                          {selectedReportContext.report.summary || 'No summary provided.'}
                        </div>
                      </div>

                      {selectedReportContext.report.issues && (
                        <div>
                          <p className="text-sm font-bold text-red-700 mb-2">Operational Issues</p>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800 min-h-[3rem]">
                            {selectedReportContext.report.issues}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {/* Addendums Section (Only if Submitted/Reviewed) */}
              {selectedReportContext.report.status !== 'Draft' && (
                <div className="space-y-4">
                  {selectedReportContext.report.addendums && selectedReportContext.report.addendums.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-700 ml-1">Notes & Addendums</h4>
                      {selectedReportContext.report.addendums.map((addendum, i) => (
                        <div key={i} className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100 shadow-sm relative">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold text-yellow-800">Addendum</p>
                            <p className="text-xs text-yellow-600/70 font-medium">{new Date(addendum.date).toLocaleString()}</p>
                          </div>
                          <p className="text-sm text-yellow-900">{addendum.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Note Form */}
                  <Card>
                    <form onSubmit={handleAddAddendum} className="p-4 flex gap-3 items-start bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <TextareaField 
                          placeholder="Add a note or correction to this report..."
                          rows={2}
                          value={addendumNote}
                          onChange={e => setAddendumNote(e.target.value)}
                        />
                      </div>
                      <PrimaryButton type="submit" disabled={addingNote || !addendumNote.trim()}>
                        {addingNote ? 'Adding...' : 'Add Note'}
                      </PrimaryButton>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          ) : loadingDate ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
               <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-slate-500 font-medium">Loading daily summary...</p>
            </div>
          ) : reportError ? (
            <div className="p-12 text-center bg-red-50 rounded-xl border border-red-100">
               <p className="text-red-600 font-medium mb-4">{reportError}</p>
               <PrimaryButton onClick={() => loadDateReport(selectedDateStr)} type="button">
                  Try Again
               </PrimaryButton>
            </div>
          ) : (
             <div className="p-6 text-center text-gray-500 bg-white rounded-xl border border-slate-200">Please select a date from the history panel.</div>
          )}
        </div>

        {/* Sidebar History */}
        <div>
          <Card title="Past Submissions">
            {loading ? (
              <div className="p-6 text-center text-gray-500 text-sm">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No past reports found.</div>
            ) : (
              <div className="flex flex-col max-h-[600px] overflow-y-auto">
                {/* Always provide option to load today if not in history explicitly */}
                <div 
                  className="p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50"
                  onClick={() => {
                    const d = new Date();
                    loadDateReport(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                  }}
                >
                  <p className="font-semibold text-primary">Load Today's Report</p>
                </div>
                
                {history.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 border-b last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${selectedReportContext?.report?._id === item._id ? 'bg-blue-50/50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => {
                       const d = new Date(item.date).toISOString().split('T')[0];
                       loadDateReport(d);
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className={`font-semibold ${selectedReportContext?.report?._id === item._id ? 'text-primary' : 'text-slate-800'}`}>
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      {renderStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.summary || item.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default DoctorDailyReport;
