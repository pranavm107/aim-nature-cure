import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import therapyService from '../../services/therapyService';
import packageService from '../../services/packageService';
import therapySessionService from '../../services/therapySessionService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TherapyAssignment = () => {
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: '',
    assignmentType: 'therapy', // 'therapy' or 'package'
    itemId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patRes, thers, pkgs] = await Promise.all([
          patientService.getPatients(),
          therapyService.getAllTherapies(),
          packageService.getAllPackages()
        ]);
        setPatients(patRes.patients);
        setTherapies(thers.filter(t => t.status === true));
        setPackages(pkgs.filter(p => p.status === true));
      } catch (error) {
        toast.error('Failed to load data for assignment');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.itemId) {
      return toast.error('Please select both a patient and an item to assign.');
    }

    try {
      const payload = {
        type: formData.assignmentType,
        itemId: formData.itemId,
        assignedDocId: 'doc1' // Mocking current doctor ID
      };
      
      const response = await therapySessionService.assignToPatient(formData.patientId, payload);
      toast.success(response.message || 'Assigned successfully');
      navigate('/doctor/therapy-sessions');
    } catch (error) {
      toast.error('Assignment failed');
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="m-5 max-w-2xl mx-auto">
      <h1 className="text-2xl font-medium mb-5">Assign Therapy / Package</h1>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2">Select Patient</label>
            <select 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              required
            >
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>{p.name} (ID: {p._id})</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2">Assignment Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-slate-700 text-sm">
                <input 
                  type="radio" 
                  name="type" 
                  value="therapy" 
                  checked={formData.assignmentType === 'therapy'}
                  onChange={() => setFormData({...formData, assignmentType: 'therapy', itemId: ''})}
                /> 
                Standalone Therapy
              </label>
              <label className="flex items-center gap-2 text-slate-700 text-sm">
                <input 
                  type="radio" 
                  name="type" 
                  value="package" 
                  checked={formData.assignmentType === 'package'}
                  onChange={() => setFormData({...formData, assignmentType: 'package', itemId: ''})}
                /> 
                Pre-defined Package
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 text-sm font-bold mb-2">
              Select {formData.assignmentType === 'therapy' ? 'Therapy' : 'Package'}
            </label>
            <select 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.itemId}
              onChange={(e) => setFormData({...formData, itemId: e.target.value})}
              required
            >
              <option value="">-- Select {formData.assignmentType === 'therapy' ? 'Therapy' : 'Package'} --</option>
              {formData.assignmentType === 'therapy' && therapies.map(t => (
                <option key={t._id} value={t._id}>{t.name} (${t.price})</option>
              ))}
              {formData.assignmentType === 'package' && packages.map(p => (
                <option key={p._id} value={p._id}>{p.name} (${p.price})</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-sm mt-4">
            Assign and Generate Sessions
          </button>
        </form>
      </div>
    </div>
  );
};

export default TherapyAssignment;
