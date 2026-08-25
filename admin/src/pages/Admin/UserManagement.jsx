import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { InputField, PrimaryButton } from '../../components/common/FormFields';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      if (res.success) setUsers(res.users);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await userService.updateUserStatus(id, newStatus);
      if (res.success) {
        toast.success(`User marked as ${newStatus}`);
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddingAdmin(true);
    try {
      const res = await userService.addAdmin(adminName, adminEmail);
      if (res.success) {
        toast.success(
          <div>
            {res.message} <br/>
            <strong>Temp Password: {res.generatedPassword}</strong> <br/>
            <span className="text-xs text-yellow-100">Simulated email sent to {adminEmail}</span>
          </div>,
          { autoClose: false } // Keep open so they can copy it
        );
        setShowAdminModal(false);
        setAdminName('');
        setAdminEmail('');
        fetchUsers();
      } else {
        toast.error(res.message || "Failed to add admin");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setAddingAdmin(false);
    }
  };

  const columns = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Role' },
    { label: 'Last Active' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b border-slate-100 items-center text-sm hover:bg-slate-50 transition-colors">
      <p className="font-medium text-slate-800">{item.name}</p>
      <p className="text-slate-600">{item.email}</p>
      <p className="text-slate-700 capitalize">{item.role}</p>
      <p className="text-slate-500">{new Date(item.lastActive).toLocaleDateString()}</p>
      <div>
        {item.status === 'Active' ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}
      </div>
      <div className="text-right flex justify-end gap-2">
        <button 
          onClick={() => handleToggleStatus(item._id, item.status)}
          className={`text-xs px-3 py-1 rounded border ${item.status === 'Active' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
        >
          {item.status === 'Active' ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="User Management" subtitle="Manage Admin and Doctor accounts" />
        <PrimaryButton onClick={() => setShowAdminModal(true)}>+ Add Admin</PrimaryButton>
      </div>
      
      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No users found."
        gridColsClass="grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr]" 
      />

      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Create Admin Account</h3>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6">
              <div className="flex flex-col gap-4 mb-6">
                <InputField 
                  label="Name" 
                  value={adminName} 
                  onChange={(e) => setAdminName(e.target.value)} 
                  placeholder="Admin Name" 
                  required 
                />
                <InputField 
                  label="Email" 
                  type="email" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  placeholder="admin@example.com" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancel</button>
                <PrimaryButton type="submit" disabled={addingAdmin}>{addingAdmin ? 'Creating...' : 'Create Admin'}</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default UserManagement;
