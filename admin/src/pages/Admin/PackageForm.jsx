import React, { useState, useEffect } from 'react';
import packageService from '../../services/packageService';
import therapyService from '../../services/therapyService';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { InputField, PrimaryButton } from '../../components/common/FormFields';

const PackageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [availableTherapies, setAvailableTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', price: '', status: true, therapies: [] });

  const fetchData = async () => {
    setLoading(true);
    try {
      const thers = await therapyService.getAllTherapies();
      setAvailableTherapies(thers.filter(t => t.status === true));
      
      if (isEditMode) {
        const pkg = await packageService.getPackageById(id);
        setFormData({ 
          name: pkg.name, 
          price: pkg.price, 
          status: pkg.status, 
          therapies: JSON.parse(JSON.stringify(pkg.therapies)) 
        });
      }
    } catch (err) {
      toast.error('Failed to load package data');
      navigate('/admin/packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.therapies.length === 0) {
      return toast.error("Please add at least one therapy to the package.");
    }
    
    setSubmitting(true);
    try {
      if (isEditMode) {
        await packageService.updatePackage(id, formData);
        toast.success('Package updated successfully');
        navigate(`/admin/packages/${id}`);
      } else {
        await packageService.createPackage(formData);
        toast.success('Package created successfully');
        navigate('/admin/packages');
      }
    } catch (err) {
      toast.error('Failed to save package');
    } finally {
      setSubmitting(false);
    }
  };

  const addTherapyToPackage = () => {
    setFormData({
      ...formData,
      therapies: [...formData.therapies, { therapyId: '', count: 1 }]
    });
  };

  const removeTherapyFromPackage = (index) => {
    const newTherapies = [...formData.therapies];
    newTherapies.splice(index, 1);
    setFormData({ ...formData, therapies: newTherapies });
  };

  const updateTherapyItem = (index, field, value) => {
    const newTherapies = [...formData.therapies];
    newTherapies[index][field] = value;
    setFormData({ ...formData, therapies: newTherapies });
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;

  return (
    <PageContainer>
      <PageHeader 
        title={isEditMode ? 'Edit Package' : 'Add New Package'} 
        subtitle={isEditMode ? 'Modify package details' : 'Create a new therapy package'} 
      />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-[2]">
              <InputField 
                label="Package Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="flex-1">
              <InputField 
                label="Price ($)" 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                required 
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-semibold text-slate-800">Included Therapies</h3>
              <button type="button" onClick={addTherapyToPackage} className="text-sm text-primary font-semibold hover:text-primary/80">+ Add Therapy</button>
            </div>
            
            {formData.therapies.length === 0 && (
              <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500 text-sm border border-slate-100">
                No therapies added yet. Click "+ Add Therapy" to include treatments.
              </div>
            )}
            
            <div className="space-y-3">
              {formData.therapies.map((tItem, index) => (
                <div key={index} className="flex gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex-[2]">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Therapy</label>
                    <select 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                      required
                      value={tItem.therapyId}
                      onChange={(e) => updateTherapyItem(index, 'therapyId', e.target.value)}
                    >
                      <option value="">Select Therapy...</option>
                      {availableTherapies.map(th => (
                        <option key={th._id} value={th._id}>{th.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      min="1" required
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={tItem.count}
                      onChange={(e) => updateTherapyItem(index, 'count', Number(e.target.value))}
                    />
                  </div>
                  <div className="pt-5">
                    <button type="button" onClick={() => removeTherapyFromPackage(index)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => navigate(isEditMode ? `/admin/packages/${id}` : '/admin/packages')} 
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Package')}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default PackageForm;
