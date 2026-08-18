import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import { toast } from 'react-toastify';
import { InputField, TextareaField, PrimaryButton } from '../../components/common/FormFields';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { DoctorContext } from '../../context/DoctorContext';

const NewConsultation = () => {
  const { id } = useParams(); // patientId
  const navigate = useNavigate();
  const { profileData, dToken } = useContext(DoctorContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    chiefComplaint: '',
    history: '',
    observations: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dToken) {
      toast.error("Only doctors can create consultations");
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        doctorId: profileData._id
      };
      
      const res = await consultationService.createConsultation(id, dataToSubmit);
      if (res.success) {
        toast.success("Consultation saved successfully");
        navigate(`/patient/${id}`);
      } else {
        toast.error(res.message || "Failed to save consultation");
      }
    } catch (error) {
      toast.error("Error saving consultation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="New Consultation" subtitle="Record clinical findings and treatment plan" />
      <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      
      <div className="bg-white p-8 border rounded flex flex-col gap-6 shadow-sm">
        
        <div className="flex flex-col gap-6">
          <TextareaField 
            label="Chief Complaint"
            name="chiefComplaint"
            value={formData.chiefComplaint}
            onChange={handleChange}
            placeholder="What is the primary reason for the visit?"
            required
            rows={3}
          />
          
          <TextareaField 
            label="History of Present Illness (HPI)"
            name="history"
            value={formData.history}
            onChange={handleChange}
            placeholder="Relevant medical history..."
            rows={3}
          />
          
          <TextareaField 
            label="Observations / Examination"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Clinical observations..."
            required
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-6 border-t pt-6">
          <InputField 
            label="Diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Primary diagnosis"
            required
          />
          
          <TextareaField 
            label="Treatment Plan"
            name="treatmentPlan"
            value={formData.treatmentPlan}
            onChange={handleChange}
            placeholder="Prescribed therapies, diet, exercises..."
            required
            rows={4}
          />
          
          <TextareaField 
            label="Additional Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any other notes for internal record..."
            rows={2}
          />
        </div>

        <div className="mt-4 border-t pt-4 flex gap-4">
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Submit Consultation'}
          </PrimaryButton>
          <button 
            type="button" 
            onClick={() => navigate(`/patient/${id}`)}
            className="px-8 py-3 rounded-full text-gray-600 hover:bg-gray-100 border transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      </form>
    </PageContainer>
  );
};

export default NewConsultation;
