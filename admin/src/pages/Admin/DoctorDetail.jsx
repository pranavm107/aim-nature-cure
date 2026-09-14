import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { adminService } from '../../services/adminService';
import { salaryService } from '../../services/salaryService';
import { toast } from 'react-toastify';
import { Edit } from 'lucide-react';
import { InputField, TextareaField } from '../../components/common/FormFields';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [salaryFormData, setSalaryFormData] = useState({ amount: '', effectiveFrom: '' });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const fetchSalaryAndIncentive = async () => {
    try {
      const res = await salaryService.getCurrentSalary(id);
      if (res.success) setCurrentSalary(res.salary);
      else setCurrentSalary(null);
      
      const histRes = await salaryService.getSalaryHistory(id);
      if (histRes.success) setSalaryHistory(histRes.history);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDoctorById(id);
      if (res.success) {
        setDoctor(res.doctor);
        await fetchSalaryAndIncentive();
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

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    if (!salaryFormData.amount || Number(salaryFormData.amount) <= 0) {
      toast.error("Salary amount must be greater than zero");
      return;
    }
    if (!salaryFormData.effectiveFrom) {
      toast.error("Effective date is required");
      return;
    }

    try {
      const res = await salaryService.setSalary(id, doctor.name, salaryFormData.amount, salaryFormData.effectiveFrom);
      if (res.success) {
        toast.success(res.message);
        setSalaryModalOpen(false);
        fetchSalaryAndIncentive();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to set salary");
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

      {/* Salary Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl mt-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Salary Information</h2>
          <button onClick={() => {
            setSalaryFormData({ amount: currentSalary?.salaryAmount || '', effectiveFrom: new Date().toISOString().split('T')[0] });
            setSalaryModalOpen(true);
          }} className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-xs font-medium transition-colors">
            Set Salary
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Current Monthly Salary</p>
            <p className="text-2xl font-bold text-slate-800">
              {currentSalary ? `₹${currentSalary.salaryAmount.toLocaleString('en-IN')}` : 'Not Set'}
            </p>
            {currentSalary && (
              <p className="text-xs text-slate-500 mt-1">
                Effective From: {new Date(currentSalary.effectiveFrom).toLocaleDateString('en-GB')}
              </p>
            )}
          </div>
          
          <button onClick={() => setHistoryModalOpen(true)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
            View Salary History
          </button>
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

      {/* Set Salary Modal */}
      {salaryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Set Doctor Salary</h3>
              <button onClick={() => setSalaryModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSalarySubmit} className="p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-500 mb-1">Doctor</p>
                <p className="text-base text-slate-800 font-medium">{doctor.name}</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <InputField label="Monthly Salary (₹)" type="number" min="1" value={salaryFormData.amount} onChange={e => setSalaryFormData({...salaryFormData, amount: e.target.value})} required />
                <InputField label="Effective From" type="date" value={salaryFormData.effectiveFrom} onChange={e => setSalaryFormData({...salaryFormData, effectiveFrom: e.target.value})} required />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setSalaryModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">Set Salary</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Salary History - {doctor.name}</h3>
              <button onClick={() => setHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {salaryHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Effective From</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Salary</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Set By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryHistory.map(record => (
                        <tr key={record._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-700">{new Date(record.effectiveFrom).toLocaleDateString('en-GB')}</td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-800">₹{record.salaryAmount.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              record.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                              record.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{record.createdBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No salary history available.</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setHistoryModalOpen(false)} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default DoctorDetail;
