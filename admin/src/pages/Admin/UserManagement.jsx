import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { rolesService } from '../../services/rolesService';
import RoleModal from '../../components/admin/RoleModal';
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
  const [adminRole, setAdminRole] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [roles, setRoles] = useState([]);
  
  // Role Creation State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleFormData, setRoleFormData] = useState({ name: '', permissions: [] });
  
  const navigate = useNavigate();

  const fetchRoles = async () => {
    const res = await rolesService.getAllRoles();
    if(res.success) setRoles(res.roles);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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

  const handleRoleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'CREATE_NEW') {
      setRoleFormData({ name: '', permissions: [] });
      setShowRoleModal(true);
      // Don't change adminRole to CREATE_NEW, leave it as is or empty
    } else {
      setAdminRole(val);
    }
  };

  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (roleFormData.permissions.length === 0) {
      return toast.error("Please assign at least one permission");
    }
    try {
      const res = await rolesService.createRole(roleFormData);
      toast.success("Role created successfully");
      await fetchRoles(); // Refresh roles list
      setAdminRole(res.role.name.toLowerCase()); // Auto-select new role
      setShowRoleModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to save role");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddingAdmin(true);
    try {
      const res = await userService.addUser(adminName, adminEmail, adminRole || 'admin');
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
        setAdminRole('');
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
          onClick={() => navigate(`/admin/users/${item._id}`)}
          className="text-xs px-3 py-1 rounded border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
        >
          View
        </button>
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
        <PageHeader title="User Management" subtitle="Manage Admin, Doctor and custom accounts" />
        <PrimaryButton onClick={() => setShowAdminModal(true)}>+ Add New User</PrimaryButton>
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
              <h3 className="font-semibold text-slate-800">Create New User</h3>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6">
              <div className="flex flex-col gap-4 mb-6">
                <InputField 
                  label="Name" 
                  value={adminName} 
                  onChange={(e) => setAdminName(e.target.value)} 
                  placeholder="User Name" 
                  required 
                />
                <InputField 
                  label="Email" 
                  type="email" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  placeholder="user@example.com" 
                  required 
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    value={adminRole}
                    onChange={handleRoleSelectChange}
                    required
                  >
                    <option value="" disabled={adminRole === '' ? false : true}>Select Role</option>
                    {roles.map(r => (
                      <option key={r._id} value={r.name.toLowerCase()}>{r.name}</option>
                    ))}
                    <option value="CREATE_NEW" className="font-bold text-primary">+ Create New Role</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancel</button>
                <PrimaryButton type="submit" disabled={addingAdmin}>{addingAdmin ? 'Creating...' : 'Create User'}</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <RoleModal 
            isOpen={showRoleModal}
            onClose={() => setShowRoleModal(false)}
            onSubmit={handleCreateRoleSubmit}
            formData={roleFormData}
            setFormData={setRoleFormData}
            editingRole={null}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default UserManagement;
