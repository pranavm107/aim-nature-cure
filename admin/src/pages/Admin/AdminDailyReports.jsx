import React, { useState, useEffect } from 'react';
import { dailyReportService } from '../../services/dailyReportService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';

const AdminDailyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await dailyReportService.getAdminReports();
      if (res.success) setReports(res.reports);
    } catch (err) {
      toast.error("Failed to load daily reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await dailyReportService.updateReportStatus(id, status);
      if (res.success) {
        toast.success(`Report marked as ${status}`);
        fetchReports();
        setSelectedReport(null);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const columns = [
    { label: 'Date' },
    { label: 'Doctor ID' },
    { label: 'Patients' },
    { label: 'Consultations' },
    { label: 'Therapies' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p>{new Date(item.date).toLocaleDateString()}</p>
      <p className="font-medium text-gray-800">{item.docId}</p>
      <p>{item.patientCount}</p>
      <p>{item.consultations}</p>
      <p>{item.therapySessions}</p>
      <div>
        {item.status === 'Pending' ? <Badge variant="warning">Pending</Badge> : <Badge variant="success">Reviewed</Badge>}
      </div>
      <div className="text-right">
        <button 
          onClick={() => setSelectedReport(item)}
          className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Daily Reports" subtitle="Review end-of-day reports submitted by doctors" />
      <DataTable 
        columns={columns} 
        data={reports.sort((a,b) => b.date - a.date)} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No reports found."
        gridColsClass="grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr]" 
      />

      <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title="Daily Report Details">
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(selectedReport.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Doctor ID</p>
                <p className="font-medium">{selectedReport.docId}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">{selectedReport.patientCount}</p>
                <p className="text-xs text-gray-500">Patients</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">{selectedReport.consultations}</p>
                <p className="text-xs text-gray-500">Consultations</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">{selectedReport.therapySessions}</p>
                <p className="text-xs text-gray-500">Therapies</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">{selectedReport.followUps}</p>
                <p className="text-xs text-gray-500">Follow-Ups</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Summary</p>
              <div className="p-3 bg-gray-50 rounded border text-sm text-gray-800 min-h-16">
                {selectedReport.summary || 'No summary provided.'}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Operational Issues</p>
              <div className="p-3 bg-red-50 text-red-800 rounded border border-red-100 text-sm min-h-16">
                {selectedReport.issues || 'No issues reported.'}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
              {selectedReport.status === 'Pending' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedReport._id, 'Reviewed')} 
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                  Mark Reviewed
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default AdminDailyReports;
