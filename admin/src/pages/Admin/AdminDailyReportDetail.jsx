import React, { useState, useEffect } from 'react';
import { dailyReportService } from '../../services/dailyReportService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const AdminDailyReportDetail = () => {
  const { date } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aggregates, setAggregates] = useState(null);
  const navigate = useNavigate();

  const fetchDateReports = async () => {
    setLoading(true);
    try {
      const res = await dailyReportService.getAdminReports();
      if (res.success) {
        // Filter by date
        const dateReports = res.reports.filter(r => new Date(r.date).toISOString().split('T')[0] === date);
        
        // Fetch patient list for each report's doctor
        for (let r of dateReports) {
          const ptRes = await dailyReportService.getPatientsSeen(r.doctorId || r.docId, date);
          if (ptRes.success) {
            r.patientsSeenList = ptRes.patientsSeen;
          } else {
            r.patientsSeenList = [];
          }
        }

        setReports(dateReports);

        // Aggregate
        let totalPatients = 0;
        let totalConsultations = 0;
        let totalTherapies = 0;
        let allReviewed = dateReports.length > 0;

        dateReports.forEach(r => {
          totalPatients += (r.patientCount || r.patientsSeen || 0);
          totalConsultations += (r.consultations || r.consultationsCompleted || 0);
          totalTherapies += (r.therapySessions || 0);
          if (r.status !== 'Reviewed') {
            allReviewed = false;
          }
        });

        setAggregates({
          totalDoctors: dateReports.length,
          totalPatients,
          totalConsultations,
          totalTherapies,
          allReviewed
        });
      }
    } catch (err) {
      toast.error("Failed to load date reports");
      navigate('/admin/daily-reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDateReports();
  }, [date]);

  const handleMarkDateReviewed = async () => {
    try {
      const pendingReports = reports.filter(r => r.status !== 'Reviewed');
      for (const rep of pendingReports) {
        await dailyReportService.updateReportStatus(rep._id, 'Reviewed');
      }
      toast.success('All reports for this date marked as Reviewed');
      fetchDateReports();
    } catch (err) {
      toast.error('Failed to update report status');
    }
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!aggregates) return null;

  const displayDate = new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PageContainer>
      <PageHeader 
        title={`Daily Report: ${displayDate}`} 
        subtitle="Review aggregated performance and individual doctor submissions" 
      />

      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/admin/daily-reports')} className="text-sm text-slate-500 hover:text-slate-800 font-medium">← Back to Date List</button>
        <div className="flex gap-3">
          {aggregates.allReviewed ? (
            <Badge variant="success">All Reviewed</Badge>
          ) : (
            <button 
              onClick={handleMarkDateReviewed}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Mark Date as Reviewed
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-slate-800">{aggregates.totalDoctors}</p>
          <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">Doctors</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-slate-800">{aggregates.totalPatients}</p>
          <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">Patients</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-slate-800">{aggregates.totalConsultations}</p>
          <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">Consultations</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-slate-800">{aggregates.totalTherapies}</p>
          <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">Therapies</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4">Doctor Submissions</h3>
      <div className="space-y-6">
        {reports.length === 0 ? (
          <p className="text-slate-500 italic bg-white p-6 rounded-xl border border-slate-200">No doctor reports submitted for this date.</p>
        ) : (
          reports.map(report => (
            <div key={report._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{report.docId}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Submitted: {new Date(report.date).toLocaleTimeString()}</p>
                </div>
                {report.status === 'Reviewed' ? <Badge variant="success">Reviewed</Badge> : <Badge variant="warning">Pending Review</Badge>}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Patients</p><p className="font-semibold text-lg">{report.patientCount || report.patientsSeen || 0}</p></div>
                  <div><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Consults</p><p className="font-semibold text-lg">{report.consultations || report.consultationsCompleted || 0}</p></div>
                  <div><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Therapies</p><p className="font-semibold text-lg">{report.therapySessions || 0}</p></div>
                  <div><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Follow-Ups</p><p className="font-semibold text-lg">{report.followUps || report.followUpsCompleted || 0}</p></div>
                </div>
                
                {/* Patients Seen Section */}
                {report.patientsSeenList && report.patientsSeenList.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-slate-700 mb-3">Patients Seen</p>
                    <div className="flex flex-col gap-2">
                      {report.patientsSeenList.map(pt => (
                        <div key={pt.patientId} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <p className="text-sm font-medium text-slate-800 min-w-[150px]">{pt.patientName}</p>
                          <div className="flex gap-2 flex-wrap">
                            {pt.types.map(t => (
                              <Badge key={t} variant={t === 'Consultation' ? 'primary' : 'secondary'}>{t}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-sm font-bold text-slate-700 mb-2">Summary</p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 min-h-[4rem]">
                    {report.summary || report.notes || 'No summary provided.'}
                  </div>
                </div>

                {(report.issues) && (
                  <div>
                    <p className="text-sm font-bold text-red-700 mb-2">Operational Issues</p>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800 min-h-[3rem]">
                      {report.issues}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
};

export default AdminDailyReportDetail;
