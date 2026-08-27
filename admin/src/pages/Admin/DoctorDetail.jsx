import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';
import { Edit } from 'lucide-react';
import { InputField, SelectField, TextareaField } from '../../components/common/FormFields';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDoctorById(id);
      if (res.success) {
        setDoctor(res.doctor);
      } else {
        toast.error("Doctor not found");
        navigate('/doctor-list');
      }
    } catch (err) {
      toast.error("Error loading doctor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const openEditModal = () => {
    setEditFormData({
      name: doctor.name,
      speciality: doctor.speciality,
      experience: doctor.experience,
      fees: doctor.fees,
      about: doctor.about,
      degree: doctor.degree,
      address1: doctor.address?.line1 || '',
      address2: doctor.address?.line2 || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: editFormData.name,
        speciality: editFormData.speciality,
        experience: editFormData.experience,
        fees: Number(editFormData.fees),
        about: editFormData.about,
        degree: editFormData.degree,
        address: { line1: editFormData.address1, line2: editFormData.address2 }
      };
      const res = await adminService.updateDoctor(id, updateData);
      if (res.success) {
        toast.success("Doctor updated successfully");
        setEditModalOpen(false);
        fetchDoctor();
      } else {
        toast.error(res.message || "Failed to update doctor");
      }
    } catch (err) {
      toast.error("Error updating doctor");
    }
  };

  const experienceOptions = [
      { value: '1 Year', label: '1 Year' },
      { value: '2 Year', label: '2 Years' },
      { value: '3 Year', label: '3 Years' },
      { value: '4 Year', label: '4 Years' },
      { value: '5 Year', label: '5 Years' },
      { value: '10 Year', label: '10+ Years' },
  ];

  const specialityOptions = [
      { value: 'General physician', label: 'General physician' },
      { value: 'Gynecologist', label: 'Gynecologist' },
      { value: 'Dermatologist', label: 'Dermatologist' },
      { value: 'Pediatricians', label: 'Pediatricians' },
      { value: 'Neurologist', label: 'Neurologist' },
      { value: 'Gastroenterologist', label: 'Gastroenterologist' },
  ];

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!doctor) return null;

  return (
    <PageContainer>
      <PageHeader title={`Doctor: ${doctor.name}`} subtitle="View and manage doctor profile" />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Professional Details</h2>
          <button onClick={openEditModal} className="text-slate-500 hover:text-primary transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <img src={doctor.image} alt={doctor.name} className="w-full rounded-lg bg-slate-50 border border-slate-200" />
            <div className="mt-4 text-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${doctor.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {doctor.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Name</p>
              <p className="font-medium text-slate-800">{doctor.name}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Email</p>
              <p className="font-medium text-slate-800">{doctor.email}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Speciality</p>
              <p className="font-medium text-slate-800">{doctor.speciality}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Degree</p>
              <p className="font-medium text-slate-800">{doctor.degree}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Experience</p>
              <p className="font-medium text-slate-800">{doctor.experience}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Fees</p>
              <p className="font-medium text-slate-800">₹{doctor.fees}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-slate-500 mb-1">About</p>
              <p className="font-medium text-slate-800">{doctor.about}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-slate-500 mb-1">Address</p>
              <p className="font-medium text-slate-800">{doctor.address?.line1}<br/>{doctor.address?.line2}</p>
            </div>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Edit Doctor Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Name" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required />
                <SelectField label="Speciality" value={editFormData.speciality} onChange={e => setEditFormData({...editFormData, speciality: e.target.value})} options={specialityOptions} />
                <InputField label="Degree" value={editFormData.degree} onChange={e => setEditFormData({...editFormData, degree: e.target.value})} required />
                <SelectField label="Experience" value={editFormData.experience} onChange={e => setEditFormData({...editFormData, experience: e.target.value})} options={experienceOptions} />
                <InputField label="Fees" type="number" value={editFormData.fees} onChange={e => setEditFormData({...editFormData, fees: e.target.value})} required />
                <div className="md:col-span-2">
                  <TextareaField label="About" value={editFormData.about} onChange={e => setEditFormData({...editFormData, about: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-700">Address</p>
                  <input type="text" value={editFormData.address1} onChange={e => setEditFormData({...editFormData, address1: e.target.value})} placeholder="Line 1" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" required />
                  <input type="text" value={editFormData.address2} onChange={e => setEditFormData({...editFormData, address2: e.target.value})} placeholder="Line 2" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default DoctorDetail;
