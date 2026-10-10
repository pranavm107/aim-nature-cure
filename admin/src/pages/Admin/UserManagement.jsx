import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { rolesService } from '../../services/rolesService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import { InputField, PrimaryButton, SelectField } from '../../components/common/FormFields';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState('ADMIN');
  const [addingAdmin, setAddingAdmin] = useState(false);
  
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        userService.getUsers(),
        rolesService.getRoles()
      ]);
      
      if (usersRes.success) setUsers(usersRes.users);
      if (rolesRes.success) {
        setRoles(rolesRes.roles || []);
        if (rolesRes.roles?.length > 0 && adminRole === 'ADMIN') {
          // Keep ADMIN if it exists, otherwise select first available
          const hasAdmin = rolesRes.roles.some(r => r.roleName === 'ADMIN' || r.name === 'ADMIN');
          if (!hasAdmin) setAdminRole(rolesRes.roles[0].roleName || rolesRes.roles[0].name);
        }
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await userService.updateUserStatus(id, newStatus);
      if (res.success) {
        toast.success(`User marked as ${newStatus}`);
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddingAdmin(true);
    try {
      const res = await userService.addUser(adminName, adminEmail, adminRole, adminPhone, adminPassword);
      if (res.success) {
        toast.success(res.message);
        setShowAdminModal(false);
        setAdminName('');
        setAdminEmail('');
        setAdminPhone('');
        setAdminPassword('');
        setAdminRole(roles.length > 0 ? (roles[0].roleName || roles[0].name) : 'ADMIN');
        fetchData();
      } else {
        toast.error(res.message || "Failed to add user");
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
                <InputField 
                  label="Phone" 
                  value={adminPhone} 
                  onChange={(e) => setAdminPhone(e.target.value)} 
                  placeholder="Phone number" 
                  required 
                />
                <InputField 
                  label="Password" 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                  placeholder="Strong password" 
                  required 
                />
                <SelectField
                  label="Role"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  options={
                    roles.length > 0 
                      ? roles.map(r => ({ value: r.roleName || r.name, label: r.roleName || r.name }))
                      : [{ value: 'ADMIN', label: 'Admin' }, { value: 'DOCTOR', label: 'Doctor' }]
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancel</button>
                <PrimaryButton type="submit" disabled={addingAdmin}>{addingAdmin ? 'Creating...' : 'Create User'}</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default UserManagement;
