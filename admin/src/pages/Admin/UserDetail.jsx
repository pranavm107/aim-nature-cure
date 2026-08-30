import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import { Edit } from 'lucide-react';
import { InputField, SelectField } from '../../components/common/FormFields';
import Badge from '../../components/common/Badge';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

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
    setEditFormData({
      name: user.name,
      role: user.role
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to update user
      const res = await userService.updateUser(id, editFormData);
      if (res.success) {
        toast.success("User updated successfully");
        setEditModalOpen(false);
        fetchUser();
      } else {
        toast.error(res.message || "Failed to update user");
      }
    } catch (err) {
      toast.error("Error updating user");
    }
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!user) return null;

  return (
    <PageContainer>
      <PageHeader title={`User: ${user.name}`} subtitle="View and manage user profile" />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h2 className="text-lg font-semibold text-slate-800">User Details</h2>
          <button onClick={openEditModal} className="text-slate-500 hover:text-primary transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Name</p>
            <p className="font-medium text-slate-800">{user.name}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Email</p>
            <p className="font-medium text-slate-800">{user.email} <span className="text-xs text-slate-400 ml-2">(Locked)</span></p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Role</p>
            <p className="font-medium text-slate-800 capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Status</p>
            <div>
              {user.status === 'Active' ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}
            </div>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Created At</p>
            <p className="font-medium text-slate-800">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Last Active</p>
            <p className="font-medium text-slate-800">{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Edit User</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto">
              <div className="flex flex-col gap-4">
                <InputField 
                  label="Name" 
                  value={editFormData.name} 
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                  required 
                />
                
                <div className="opacity-60 pointer-events-none">
                  <InputField 
                    label="Email (Cannot be changed)" 
                    value={user.email} 
                    onChange={() => {}}
                    disabled
                  />
                </div>

                <SelectField 
                  label="Role" 
                  value={editFormData.role} 
                  onChange={e => setEditFormData({...editFormData, role: e.target.value})} 
                  options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'doctor', label: 'Doctor' },
                    { value: 'receptionist', label: 'Receptionist' }
                  ]}
                />
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

export default UserDetail;
