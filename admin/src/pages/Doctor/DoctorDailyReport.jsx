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
      if (res.success) setHistory(res.reports.sort((a,b) => b.date - a.date));
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

  const isTodaySubmitted = history.length > 0 && new Date(history[0].date).toDateString() === new Date().toDateString();

  return (
    <PageContainer>
      <PageHeader title="Daily Closing Report" subtitle="Submit your end-of-day summary to administration" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isTodaySubmitted ? (
            <Card>
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Report Submitted</h3>
                <p className="text-gray-500">You have already submitted your closing report for today.</p>
              </div>
            </Card>
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
                {history.map((item, idx) => (
                  <div key={idx} className="p-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-800">{new Date(item.date).toLocaleDateString()}</p>
                      {item.status === 'Reviewed' ? <Badge variant="success">Reviewed</Badge> : <Badge variant="warning">Pending</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
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
