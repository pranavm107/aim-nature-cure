import React, { useState, useContext, useEffect } from 'react';
import { dailyReportService } from '../../services/dailyReportService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import { InputField, TextareaField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';
import Badge from '../../components/common/Badge';

const DoctorDailyReport = () => {
  const { profileData } = useContext(DoctorContext);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [addendumNote, setAddendumNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  
  const [formData, setFormData] = useState({
    patientCount: '',
    consultations: '',
    therapySessions: '',
    followUps: '',
    summary: '',
    issues: ''
  });

  const fetchHistory = async () => {
    if (!profileData) return;
    try {
      const res = await dailyReportService.getDoctorReports(profileData._id);
      if (res.success) {
        const sorted = res.reports.sort((a,b) => b.date - a.date);
        setHistory(sorted);
        
        // Refresh selected report if one is selected, else select today's if it exists
        const todayStr = new Date().toDateString();
        const todayReport = sorted.find(r => new Date(r.date).toDateString() === todayStr);
        
        setSelectedReport(prev => {
          if (prev) {
            return sorted.find(r => r._id === prev._id) || prev;
          }
          if (todayReport) {
            return todayReport;
          }
          return null;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [profileData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await dailyReportService.submitReport({
        ...formData,
        docId: profileData._id,
        patientCount: Number(formData.patientCount),
        consultations: Number(formData.consultations),
        therapySessions: Number(formData.therapySessions),
        followUps: Number(formData.followUps),
      });
      if (res.success) {
        toast.success("Daily report submitted successfully");
        setFormData({
          patientCount: '',
          consultations: '',
          therapySessions: '',
          followUps: '',
          summary: '',
          issues: ''
        });
        fetchHistory();
      }
    } catch (err) {
      toast.error("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAddendum = async (e) => {
    e.preventDefault();
    if (!addendumNote.trim() || !selectedReport) return;
    setAddingNote(true);
    try {
      const res = await dailyReportService.addReportAddendum(selectedReport._id, addendumNote);
      if (res.success) {
        toast.success("Note added successfully");
        setAddendumNote('');
        fetchHistory();
      }
    } catch (err) {
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const isTodaySubmitted = history.length > 0 && new Date(history[0].date).toDateString() === new Date().toDateString();
  const isSelectedToday = selectedReport && new Date(selectedReport.date).toDateString() === new Date().toDateString();

  return (
    <PageContainer>
      <PageHeader title="Daily Closing Report" subtitle="Submit your end-of-day summary to administration" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="space-y-6">
              <Card>
                {/* Locked Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center rounded-t-xl">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Report: {new Date(selectedReport.date).toLocaleDateString()}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Submitted at {new Date(selectedReport.date).toLocaleTimeString()}</p>
                  </div>
                  {selectedReport.status === 'Reviewed' ? (
                    <Badge variant="success">Reviewed by Admin</Badge>
                  ) : (
                    <Badge variant="warning">Pending Admin Review</Badge>
                  )}
                </div>
                
                {/* Locked Content */}
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Patients</p><p className="font-semibold text-lg">{selectedReport.patientCount || selectedReport.patientsSeen || 0}</p></div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Consults</p><p className="font-semibold text-lg">{selectedReport.consultations || selectedReport.consultationsCompleted || 0}</p></div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Therapies</p><p className="font-semibold text-lg">{selectedReport.therapySessions || 0}</p></div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Follow-Ups</p><p className="font-semibold text-lg">{selectedReport.followUps || selectedReport.followUpsCompleted || 0}</p></div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-bold text-slate-700 mb-2">Summary</p>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 min-h-[4rem]">
                      {selectedReport.summary || selectedReport.notes || 'No summary provided.'}
                    </div>
                  </div>

                  {(selectedReport.issues) && (
                    <div>
                      <p className="text-sm font-bold text-red-700 mb-2">Operational Issues</p>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800 min-h-[3rem]">
                        {selectedReport.issues}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Addendums Section */}
              <div className="space-y-4">
                {selectedReport.addendums && selectedReport.addendums.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700 ml-1">Notes & Addendums</h4>
                    {selectedReport.addendums.map((addendum, i) => (
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

              {isSelectedToday && (
                <div className="text-center p-4">
                  <p className="text-sm text-slate-500 font-medium">Tomorrow's closing report will be available after midnight.</p>
                </div>
              )}
            </div>
          ) : (
            <Card title="New Report Form">
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <InputField 
                    label="Patients Seen" 
                    type="number" 
                    required 
                    min="0"
                    value={formData.patientCount} 
                    onChange={e => setFormData({...formData, patientCount: e.target.value})} 
                  />
                  <InputField 
                    label="Consultations" 
                    type="number" 
                    required 
                    min="0"
                    value={formData.consultations} 
                    onChange={e => setFormData({...formData, consultations: e.target.value})} 
                  />
                  <InputField 
                    label="Therapies" 
                    type="number" 
                    required 
                    min="0"
                    value={formData.therapySessions} 
                    onChange={e => setFormData({...formData, therapySessions: e.target.value})} 
                  />
                  <InputField 
                    label="Follow-Ups" 
                    type="number" 
                    required 
                    min="0"
                    value={formData.followUps} 
                    onChange={e => setFormData({...formData, followUps: e.target.value})} 
                  />
                </div>
                
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
                  <PrimaryButton type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Report'}</PrimaryButton>
                </div>
              </form>
            </Card>
          )}
        </div>

        <div>
          <Card title="Past Submissions">
            {loading ? (
              <div className="p-6 text-center text-gray-500 text-sm">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No past reports found.</div>
            ) : (
              <div className="flex flex-col">
                {!isTodaySubmitted && !selectedReport && (
                  <div 
                    className="p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50"
                    onClick={() => setSelectedReport(null)}
                  >
                    <p className="font-semibold text-primary">Submit Today's Report</p>
                  </div>
                )}
                {history.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 border-b last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${selectedReport?._id === item._id ? 'bg-blue-50/50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setSelectedReport(item)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className={`font-semibold ${selectedReport?._id === item._id ? 'text-primary' : 'text-slate-800'}`}>{new Date(item.date).toLocaleDateString()}</p>
                      {item.status === 'Reviewed' ? <Badge variant="success">Reviewed</Badge> : <Badge variant="warning">Pending</Badge>}
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
