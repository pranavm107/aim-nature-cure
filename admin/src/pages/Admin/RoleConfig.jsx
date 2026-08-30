import React, { useState, useEffect } from 'react';
import { rolesService, AVAILABLE_PERMISSIONS } from '../../services/rolesService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { toast } from 'react-toastify';
import RoleModal from '../../components/admin/RoleModal';

const RoleConfig = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', permissions: [] });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await rolesService.getAllRoles();
      if (res.success) setRoles(res.roles);
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, permissions: [...role.permissions] });
    } else {
      setEditingRole(null);
      setFormData({ name: '', permissions: [] });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    setFormData(prev => {
      const perms = [...prev.permissions];
      if (perms.includes(permId)) {
        return { ...prev, permissions: perms.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...perms, permId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.permissions.length === 0) {
      return toast.error("Please assign at least one permission");
    }

    try {
      if (editingRole) {
        await rolesService.updateRole(editingRole._id, formData);
        toast.success("Role updated successfully");
      } else {
        await rolesService.createRole(formData);
        toast.success("Role created successfully");
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      toast.error(err.message || "Failed to save role");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await rolesService.deleteRole(id);
        toast.success("Role deleted");
        fetchRoles();
      } catch (err) {
        toast.error(err.message || "Failed to delete role");
      }
    }
  };

  // Group permissions for the UI
  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.group]) acc[perm.group] = [];
    acc[perm.group].push(perm);
    return acc;
  }, {});

  const columns = [
    { label: 'Role Name' },
    { label: 'Permissions Count' },
    { label: 'Type' },
    { label: 'Actions', className: 'text-right' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[2fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-slate-50">
      <p className="font-bold text-slate-800">{item.name}</p>
      <p className="text-slate-600">{item.permissions.length} permissions</p>
      <div>
        {item.isSystem ? <Badge variant="neutral">System</Badge> : <Badge variant="success">Custom</Badge>}
      </div>
      <div className="text-right flex justify-end gap-3">
        <button onClick={() => openModal(item)} className="text-primary font-medium hover:underline">Edit</button>
        {!item.isSystem && (
          <button onClick={() => handleDelete(item._id)} className="text-red-500 font-medium hover:underline">Delete</button>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Roles & Permissions Config" subtitle="Manage system access levels" />
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          Add New Role
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={roles} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No roles configured."
        gridColsClass="grid-cols-[2fr_1fr_1fr_1fr]" 
      />

      <RoleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingRole={editingRole}
      />
    </PageContainer>
  );
};

export default RoleConfig;
