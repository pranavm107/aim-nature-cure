import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import { followUpService } from '../../services/followUpService';
import { toast } from 'react-toastify';
import { InputField, TextareaField, SelectField, PrimaryButton } from '../../components/common/FormFields';
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
    notes: '',
    // Follow-up Section
    followUpRequired: 'No',
    followUpDate: '',
    followUpType: 'Treatment Follow-up',
    followUpNotes: '',
    followUpPriority: 'Normal'
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

    if (formData.followUpRequired === 'Yes' && !formData.followUpDate) {
      toast.warn("Please provide a date for the follow-up.");
      return;
    }

    setLoading(true);
    try {
      // 1. Save Consultation
      const consData = {
        doctorId: profileData._id,
        chiefComplaint: formData.chiefComplaint,
        history: formData.history,
        observations: formData.observations,
        diagnosis: formData.diagnosis,
        treatmentPlan: formData.treatmentPlan,
        notes: formData.notes
      };
      
      const res = await consultationService.createConsultation(id, consData);
      
      // 2. Save Follow-up if required
      if (res.success && formData.followUpRequired === 'Yes') {
        const fuData = {
          patientId: id,
          doctorId: profileData._id,
          consultationId: res.consultation._id, // Link to the newly created consultation
          date: new Date(formData.followUpDate).getTime(),
          type: formData.followUpType,
          notes: formData.followUpNotes,
          priority: formData.followUpPriority,
          source: 'Created from Consultation'
        };
        await followUpService.createFollowUp(fuData);
      }

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
      <PageHeader title="New Consultation" subtitle="Record clinical findings and treatment plan" backLink={`/patient/${id}`} />
      <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      
      <div className="bg-white p-8 border border-slate-200 rounded-xl flex flex-col gap-6 shadow-sm">
        
        <div className="flex flex-col gap-6">
          <TextareaField 
            label="Chief Complaint *"
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
            label="Observations / Examination *"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Clinical observations..."
            required
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-6 border-t border-slate-100 pt-6">
          <InputField 
            label="Diagnosis *"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Primary diagnosis"
            required
          />
          
          <TextareaField 
            label="Treatment Plan *"
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

        {/* Follow-up Section */}
        <div className="flex flex-col gap-6 border-t border-slate-100 pt-6 bg-primary/5 p-6 rounded-xl -mx-4 mt-2">
          <h3 className="font-semibold text-primary border-b border-primary/20 pb-2">Follow-up Required?</h3>
          <SelectField 
            label="Follow-up Needed"
            name="followUpRequired"
            value={formData.followUpRequired}
            onChange={handleChange}
            options={[{label: 'No', value: 'No'}, {label: 'Yes', value: 'Yes'}]}
          />

          {formData.followUpRequired === 'Yes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="md:col-span-2">
                <InputField 
                  label="Follow-up Date *"
                  name="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <SelectField 
                label="Follow-up Type"
                name="followUpType"
                value={formData.followUpType}
                onChange={handleChange}
                options={[
                  {label: 'Consultation', value: 'Consultation'},
                  {label: 'Therapy Session', value: 'Therapy Session'},
                  {label: 'Review', value: 'Review'},
                  {label: 'Treatment Follow-up', value: 'Treatment Follow-up'},
                  {label: 'General Follow-up', value: 'General Follow-up'}
                ]}
              />
              <SelectField 
                label="Priority"
                name="followUpPriority"
                value={formData.followUpPriority}
                onChange={handleChange}
                options={[
                  {label: 'Normal', value: 'Normal'},
                  {label: 'Important', value: 'Important'},
                  {label: 'Urgent', value: 'Urgent'}
                ]}
              />
              <div className="md:col-span-2">
                <TextareaField 
                  label="Follow-up Notes"
                  name="followUpNotes"
                  value={formData.followUpNotes}
                  onChange={handleChange}
                  placeholder="What needs to be reviewed or done?"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-6 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate(`/patient/${id}`)}
            className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Lock & Save Consultation'}
          </PrimaryButton>
        </div>
      </div>
      </form>
    </PageContainer>
  );
};

export default NewConsultation;
