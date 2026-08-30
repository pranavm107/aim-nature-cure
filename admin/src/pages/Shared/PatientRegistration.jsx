import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { patientService } from '../../services/patientService';
import { InputField, SelectField, PrimaryButton } from '../../components/common/FormFields';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { AdminContext } from '../../context/AdminContext';
import { DoctorContext } from '../../context/DoctorContext';

const PatientRegistration = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken, profileData } = useContext(DoctorContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    leadSource: '',
    assignedDoctor: '',
    status: 'Active',
    periodOfDays: 14
  });

  useEffect(() => {
    // If admin, fetch doctors list for assignment
    if (aToken) {
      const fetchDoctors = async () => {
        try {
          const res = await adminService.getAllDoctors();
          if (res.success) {
            setDoctors(res.doctors);
            if (res.doctors.length > 0) {
              setFormData(prev => ({...prev, assignedDoctor: res.doctors[0]._id}));
            }
          }
        } catch (error) {
          console.error('Error fetching doctors:', error);
        }
      };
      fetchDoctors();
    } else if (dToken && profileData) {
      // If doctor, auto-assign to themselves
      setFormData(prev => ({ ...prev, assignedDoctor: profileData._id }));
    }
  }, [aToken, dToken, profileData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await patientService.createPatient(formData);
      if (res.success) {
        toast.success("Patient registered successfully!");
        navigate('/patients');
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Error registering patient");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Patient Registration" subtitle="Register a new patient" />
      <form onSubmit={handleSubmit} className='w-full max-w-4xl'>
      
      <div className='bg-white px-8 py-8 border rounded w-full flex flex-col gap-6'>
        
        <div className='flex flex-col lg:flex-row gap-6'>
          <InputField 
            label="Full Name" 
            name="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Name" 
            required 
          />
          <InputField 
            label="Email" 
            type="email"
            name="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="Email Address" 
          />
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          <InputField 
            label="Phone" 
            name="phone"
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="Phone Number" 
            required 
          />
          <InputField 
            label="Date of Birth" 
            type="date"
            name="dob"
            value={formData.dob} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          <SelectField 
            label="Gender" 
            name="gender"
            value={formData.gender} 
            onChange={handleChange} 
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' }
            ]}
          />
          <InputField 
            label="Lead Source" 
            name="leadSource"
            value={formData.leadSource} 
            onChange={handleChange} 
            placeholder="e.g. Google, Referral" 
          />
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          {aToken ? (
            <SelectField 
              label="Assigned Doctor" 
              name="assignedDoctor"
              value={formData.assignedDoctor} 
              onChange={handleChange} 
              options={doctors.map(d => ({ label: d.name, value: d._id }))}
              required
            />
          ) : (
            <InputField 
              label="Assigned Doctor" 
              value={profileData?.name || ''} 
              disabled
              className="bg-gray-50"
            />
          )}
          
          <SelectField 
            label="Status" 
            name="status"
            value={formData.status} 
            onChange={handleChange} 
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'Completed Treatment', value: 'Completed Treatment' }
            ]}
          />
        </div>

        <div className='flex flex-col gap-6'>
          <InputField 
            label="Address" 
            name="address"
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Full Address" 
          />
        </div>

        <div className='flex flex-col gap-6'>
          <InputField 
            label="Period of Days (Treatment cycle duration)" 
            type="number"
            name="periodOfDays"
            value={formData.periodOfDays} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="mt-4">
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Patient'}
          </PrimaryButton>
        </div>
      </div>
      </form>
    </PageContainer>
  );
};

export default PatientRegistration;
