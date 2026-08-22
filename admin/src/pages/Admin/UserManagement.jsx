import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const columns = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Role' },
    { label: 'Last Active' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <p className="font-medium text-gray-800">{item.name}</p>
      <p className="text-gray-600">{item.email}</p>
      <p>{item.role}</p>
      <p className="text-gray-500">{new Date(item.lastActive).toLocaleDateString()}</p>
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
      <PageHeader title="User Management" subtitle="Manage Admin and Doctor accounts" />
      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No users found."
        gridColsClass="grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr]" 
      />
    </PageContainer>
  );
};

export default UserManagement;
