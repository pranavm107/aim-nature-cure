import React, { useState, useEffect } from 'react';
import packageService from '../../services/packageService';
import therapyService from '../../services/therapyService';
import { toast } from 'react-toastify';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [availableTherapies, setAvailableTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', price: '', status: true, therapies: [] });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgs, thers] = await Promise.all([
        packageService.getAllPackages(),
        therapyService.getAllTherapies()
      ]);
      setPackages(pkgs);
      setAvailableTherapies(thers.filter(t => t.status === true));
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({ 
        name: pkg.name, 
        price: pkg.price, 
        status: pkg.status, 
        therapies: JSON.parse(JSON.stringify(pkg.therapies)) 
      });
    } else {
      setEditingPackage(null);
      setFormData({ name: '', price: '', status: true, therapies: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.therapies.length === 0) {
      return toast.error("Please add at least one therapy to the package.");
    }
    
    try {
      if (editingPackage) {
        await packageService.updatePackage(editingPackage._id, formData);
        toast.success('Package updated successfully');
      } else {
        await packageService.createPackage(formData);
        toast.success('Package created successfully');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error('Failed to save package');
    }
  };

  const toggleStatus = async (pkg) => {
    try {
      await packageService.updateStatus(pkg._id, !pkg.status);
      toast.success(`Package ${!pkg.status ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
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

  const getTherapyName = (id) => {
    const th = availableTherapies.find(t => t._id === id);
    return th ? th.name : 'Unknown Therapy';
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="m-5">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-medium">Package Master</h1>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded">Add New Package</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-700 text-sm">Name</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Included Therapies</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Price ($)</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((item) => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                <td className="p-4 font-medium text-slate-800">{item.name}</td>
                <td className="p-4">
                  <ul className="text-sm text-slate-600 list-disc list-inside">
                    {item.therapies.map((t, idx) => (
                      <li key={idx}>{getTherapyName(t.therapyId)} (x{t.count})</li>
                    ))}
                  </ul>
                </td>
                <td className="p-4">${item.price}</td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleStatus(item)}
                    className={`px-3 py-1 rounded text-xs font-medium ${item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {item.status ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4">
                  <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No packages found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 overflow-y-auto pt-20 pb-10">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl my-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-800">{editingPackage ? 'Edit Package' : 'Add New Package'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex gap-4">
                <div className="flex-[2]">
                  <label className="block text-slate-700 text-sm font-bold mb-2">Package Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-slate-700 text-sm font-bold mb-2">Price</label>
                  <input 
                    type="number" 
                    required min="0" step="0.01"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-700 text-sm font-bold">Included Therapies</label>
                  <button type="button" onClick={addTherapyToPackage} className="text-xs text-primary font-bold hover:text-primary/80">+ Add Therapy</button>
                </div>
                {formData.therapies.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No therapies added yet.</p>
                )}
                {formData.therapies.map((tItem, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <select 
                      className="flex-[2] border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                      value={tItem.therapyId}
                      onChange={(e) => updateTherapyItem(index, 'therapyId', e.target.value)}
                    >
                      <option value="">Select Therapy...</option>
                      {availableTherapies.map(th => (
                        <option key={th._id} value={th._id}>{th.name}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-sm text-slate-500">Qty:</span>
                      <input 
                        type="number" 
                        min="1" required
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={tItem.count}
                        onChange={(e) => updateTherapyItem(index, 'count', Number(e.target.value))}
                      />
                    </div>
                    <button type="button" onClick={() => removeTherapyFromPackage(index)} className="text-red-500 font-bold px-2 hover:text-red-700">X</button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
