import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import { Edit, ShieldAlert } from 'lucide-react';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await userService.getUserById(id);
      if (res.success) {
        setUser(res.user);
      } else {
        toast.error("User not found");
        navigate('/admin/users');
      }
    } catch (err) {
      toast.error("Error loading user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const openEditModal = () => {
    setEditName(user.name);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await userService.updateUser(id, { name: editName });
      if (res.success) {
        toast.success("User updated");
        setEditModalOpen(false);
        fetchUser();
      }
    } catch (err) {
      toast.error("Error updating user");
    }
  };

  const openRoleModal = () => {
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async () => {
    try {
      const res = await userService.updateUserRole(id, newRole);
      if (res.success) {
        toast.success("Role updated successfully");
        setRoleModalOpen(false);
        fetchUser();
      }
    } catch (err) {
      toast.error("Error updating role");
    }
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!user) return null;

  return (
    <PageContainer>
      <PageHeader title={`User: ${user.name}`} subtitle="View and manage user profile" />
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Account Details</h2>
          <button onClick={openEditModal} className="text-slate-500 hover:text-primary transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-3 text-sm mb-6">
          <p><span className="text-slate-500 w-24 inline-block">Name:</span> <span className="font-medium text-slate-800">{user.name}</span></p>
          <p><span className="text-slate-500 w-24 inline-block">Email:</span> <span className="font-medium text-slate-800">{user.email}</span></p>
          <p><span className="text-slate-500 w-24 inline-block">Role:</span> <span className="font-medium text-slate-800 capitalize">{user.role}</span></p>
          <p><span className="text-slate-500 w-24 inline-block">Status:</span> <span className="font-medium text-slate-800">{user.status}</span></p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button onClick={openRoleModal} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium">
            <ShieldAlert className="w-4 h-4" />
            Change Role
          </button>
          <p className="text-xs text-slate-500 mt-2">Changing a user's role affects their system access and dashboard views.</p>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit User Profile</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={user.email} disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg p-2.5 text-sm outline-none cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed to protect login access.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleEditSubmit} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {roleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Role</h3>
            <p className="text-sm text-slate-600 mb-4">Select a new role for {user.name}.</p>
            <div className="mb-6">
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRoleModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleRoleSubmit} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-colors">Confirm Role Change</button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default UserDetail;
