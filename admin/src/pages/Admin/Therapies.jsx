import React, { useState, useEffect } from 'react';
import therapyService from '../../services/therapyService';
import { toast } from 'react-toastify';

const Therapies = () => {
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTherapy, setEditingTherapy] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', duration: '', price: '', status: true });

  const fetchTherapies = async () => {
    setLoading(true);
    try {
      const data = await therapyService.getAllTherapies();
      setTherapies(data);
    } catch (err) {
      toast.error('Failed to load therapies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapies();
  }, []);

  const openModal = (therapy = null) => {
    if (therapy) {
      setEditingTherapy(therapy);
      setFormData({ name: therapy.name, duration: therapy.duration, price: therapy.price, status: therapy.status });
    } else {
      setEditingTherapy(null);
      setFormData({ name: '', duration: '', price: '', status: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTherapy(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTherapy) {
        await therapyService.updateTherapy(editingTherapy._id, formData);
        toast.success('Therapy updated successfully');
      } else {
        await therapyService.createTherapy(formData);
        toast.success('Therapy created successfully');
      }
      closeModal();
      fetchTherapies();
    } catch (err) {
      toast.error('Failed to save therapy');
    }
  };

  const toggleStatus = async (therapy) => {
    try {
      await therapyService.updateStatus(therapy._id, !therapy.status);
      toast.success(`Therapy ${!therapy.status ? 'activated' : 'deactivated'}`);
      fetchTherapies();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="m-5">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-medium">Therapy Master</h1>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded">Add New Therapy</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-700 text-sm">Name</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Duration (mins)</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Price ($)</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {therapies.map((item) => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                <td className="p-4 font-medium text-slate-800">{item.name}</td>
                <td className="p-4">{item.duration}</td>
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
            {therapies.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No therapies found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">{editingTherapy ? 'Edit Therapy' : 'Add New Therapy'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block text-slate-700 text-sm font-bold mb-2">Duration (mins)</label>
                  <input 
                    type="number" 
                    required min="1"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
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
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Therapies;
