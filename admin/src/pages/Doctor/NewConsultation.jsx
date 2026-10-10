import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import { patientService } from '../../services/patientService';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';
import { InputField, TextareaField, SelectField, PrimaryButton } from '../../components/common/FormFields';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';

const NewConsultation = () => {
  const { id } = useParams(); // patientId might be in URL
  const navigate = useNavigate();
  const { profileData } = useContext(DoctorContext);
  const { token } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    patientId: id || '',
    doctorId: profileData?._id || '',
    chiefComplaint: '',
    hpi: '',
    observations: '',
    diagnosis: '',
    treatmentPlan: '',
    followUpNeeded: false,
    followUpDate: '',
    followUpType: 'Treatment Follow-up',
    priority: 'Normal',
    followUpNotes: '',
    status: 'Locked'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await patientService.getPatients({ size: 1000 });
        if (pRes.success) setPatients(pRes.patients);

        const dRes = await adminService.getDoctorsDropdown();
        if (dRes.success) setDoctors(dRes.doctors);

        if (profileData?._id) {
          setFormData(prev => ({ ...prev, doctorId: profileData._id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      toast.error("Patient and Doctor are required");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };

      // Axios will throw if the response status is not 2xx. 
      // So if we reach the next line, the request was successful even if the response body is empty.
      await consultationService.createConsultation(payload);

      toast.success("Consultation created successfully");
      navigate(id ? `/patient/${id}` : '/doctor/history');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Error creating consultation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="New Consultation" subtitle="Record clinical findings and treatment plan" backLink={id ? `/patient/${id}` : '/doctor/history'} />
      <form onSubmit={handleSubmit} className="w-full max-w-4xl">

        <div className="bg-white p-8 border border-slate-200 rounded-xl flex flex-col gap-6 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Patient *"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              options={[{ label: "-- Select Patient --", value: "" }, ...patients.map(p => ({ label: p.name, value: p._id }))]}
              required
            />
            <SelectField
              label="Doctor *"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              options={[{ label: "-- Select Doctor --", value: "" }, ...doctors.map(d => ({ label: d.name, value: d._id }))]}
              required
            />
          </div>

          <div className="flex flex-col gap-6 border-t border-slate-100 pt-6">
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
              name="hpi"
              value={formData.hpi}
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
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-6 border-t border-slate-100 pt-6">
            <InputField
              label="Diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Primary diagnosis"
            />

            <TextareaField
              label="Treatment Plan"
              name="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={handleChange}
              placeholder="Prescribed therapies, diet, exercises..."
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-6 border-t border-slate-100 pt-6">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="followUpNeeded"
                checked={formData.followUpNeeded}
                onChange={handleChange}
                className="w-4 h-4 text-primary"
              />
              Follow-Up Needed
            </label>

            {formData.followUpNeeded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <InputField
                  label="Follow-Up Date *"
                  name="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  required={formData.followUpNeeded}
                />
                <SelectField
                  label="Follow-Up Type"
                  name="followUpType"
                  value={formData.followUpType}
                  onChange={handleChange}
                  options={[
                    { label: "Treatment Follow-up", value: "Treatment Follow-up" },
                    { label: "General Checkup", value: "General Checkup" }
                  ]}
                />
                <SelectField
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={[
                    { label: "Low", value: "Low" },
                    { label: "Normal", value: "Normal" },
                    { label: "High", value: "High" },
                    { label: "Urgent", value: "Urgent" }
                  ]}
                />
                <div className="col-span-1 md:col-span-2">
                  <TextareaField
                    label="Follow-Up Notes"
                    name="followUpNotes"
                    value={formData.followUpNotes}
                    onChange={handleChange}
                    placeholder="Notes for the follow-up..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-6 flex justify-between gap-3">
            <SelectField
              label="Consultation Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { label: "Locked", value: "Locked" },
                { label: "Draft", value: "Draft" }
              ]}
            />
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={() => navigate(id ? `/patient/${id}` : '/doctor/history')}
                className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Consultation'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
};

export default NewConsultation;
