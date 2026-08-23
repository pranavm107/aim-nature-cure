import React, { useState, useEffect, useContext } from 'react';
import { consultationService } from '../../services/consultationService';
import { patientService } from '../../services/patientService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ConsultationHistory = () => {
  const { profileData } = useContext(DoctorContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!profileData) return;
      setLoading(true);
      try {
        // Fetch all assigned patients
        const pRes = await patientService.getPatients();
        const patients = pRes.success ? pRes.patients.filter(p => p.assignedDoctor === profileData._id) : [];
        
        // Fetch consultations for each patient
        let allCons = [];
        for (const p of patients) {
          const cRes = await consultationService.getConsultations(p._id);
          if (cRes.success) {
            allCons = [...allCons, ...cRes.consultations.map(c => ({ ...c, patientName: p.name }))];
          }
        }
        setHistory(allCons.sort((a,b) => b.date - a.date));
      } catch (err) {
        toast.error("Failed to load consultation history");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profileData]);

  const columns = [
    { label: 'Date' },
    { label: 'Patient Name' },
    { label: 'Chief Complaint' },
    { label: 'Diagnosis' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1.5fr_2fr_1.5fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p>{new Date(item.date).toLocaleDateString()}</p>
      <p className="font-medium text-gray-800 cursor-pointer hover:text-primary" onClick={() => navigate(`/patient/${item.patientId}`)}>{item.patientName}</p>
      <p className="text-gray-600 truncate pr-4">{item.chiefComplaint}</p>
      <p className="text-gray-600 truncate pr-4">{item.diagnosis}</p>
      <div className="text-right">
        <button 
          onClick={() => navigate(`/patient/${item.patientId}`)}
          className="text-xs bg-gray-50 text-gray-600 border px-3 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          View Patient
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title="Consultation History" subtitle="Review all past consultations" />
      <DataTable 
        columns={columns} 
        data={history} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No consultations found."
        gridColsClass="grid-cols-[1fr_1.5fr_2fr_1.5fr_1fr]" 
      />
    </PageContainer>
  );
};

export default ConsultationHistory;
