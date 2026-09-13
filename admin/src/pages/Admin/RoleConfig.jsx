import React, { useState, useEffect } from 'react';
import { rolesService, AVAILABLE_SCREENS } from '../../services/rolesService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { SelectField, PrimaryButton } from '../../components/common/FormFields';

const RoleConfig = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [currentRole, setCurrentRole] = useState(null);
  
  // Modal state for Add Role
  const [isAdding, setIsAdding] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await rolesService.getAllRoles();
      if (res.success) {
        setRoles(res.roles);
        if (!selectedRoleId && res.roles.length > 0) {
          setSelectedRoleId(res.roles[0]._id);
          setCurrentRole(res.roles[0]);
        } else if (selectedRoleId) {
          const updated = res.roles.find(r => r._id === selectedRoleId);
          if (updated) setCurrentRole(updated);
        }
      }
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleRoleSelect = (e) => {
    const id = e.target.value;
    setSelectedRoleId(id);
    const role = roles.find(r => r._id === id);
    setCurrentRole(role ? JSON.parse(JSON.stringify(role)) : null); // Deep copy for editing
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return toast.error("Role name is required");
    try {
      const res = await rolesService.createRole({ name: newRoleName });
      toast.success("Role created successfully");
      setIsAdding(false);
      setNewRoleName('');
      setSelectedRoleId(res.role._id);
      fetchRoles();
    } catch (err) {
      toast.error("Failed to create role");
    }
  };

  const handlePermissionChange = (screen, type, value) => {
    if (!currentRole) return;
    
    // Create new permissions object
    const updatedRole = { ...currentRole };
    
    // If the screen permissions object doesn't exist, create it
    if (!updatedRole.permissions[screen]) {
      updatedRole.permissions[screen] = { view: false, edit: false };
    }
    
    updatedRole.permissions[screen][type] = value;
    
    // If setting Edit to true, automatically set View to true
    if (type === 'edit' && value) {
      updatedRole.permissions[screen].view = true;
    }
    // If setting View to false, automatically set Edit to false
    if (type === 'view' && !value) {
      updatedRole.permissions[screen].edit = false;
    }

    setCurrentRole(updatedRole);
  };

  const handleSavePermissions = async () => {
    try {
      await rolesService.updateRole(currentRole._id, currentRole);
      toast.success("Permissions updated successfully");
      fetchRoles();
    } catch (err) {
      toast.error("Failed to update permissions");
    }
  };

  if (loading && roles.length === 0) return <PageContainer><p>Loading...</p></PageContainer>;

  return (
    <PageContainer>
      <PageHeader title="Roles & Permissions" subtitle="Manage access across system screens" />

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <SelectField 
              label="Select Role" 
              options={roles.map(r => ({ value: r._id, label: r.name }))} 
              value={selectedRoleId}
              onChange={handleRoleSelect}
            />
          </div>
          <div className="flex gap-2">
            {!isAdding ? (
              <button onClick={() => setIsAdding(true)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                + Add Role
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-40" 
                  placeholder="Role Name" 
                  value={newRoleName} 
                  onChange={e => setNewRoleName(e.target.value)} 
                />
                <button onClick={handleAddRole} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Save</button>
                <button onClick={() => setIsAdding(false)} className="px-3 py-2 border rounded-lg text-sm text-slate-500">Cancel</button>
              </div>
            )}
          </div>
        </div>

        {currentRole && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Screens & Permissions</h3>
                <p className="text-sm text-slate-500 mt-1">Configure access for <span className="font-semibold text-slate-700">{currentRole.name}</span></p>
                {currentRole.isSystem && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded mt-2 inline-block">System Role</span>}
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-3 sm:grid-cols-4 px-6 py-3 bg-white text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-1 sm:col-span-2">Screen Module</div>
                <div className="text-center">View Access</div>
                <div className="text-center">Edit Access</div>
              </div>

              {AVAILABLE_SCREENS.map(screen => {
                const perms = currentRole.permissions[screen] || { view: false, edit: false };
                return (
                  <div key={screen} className="grid grid-cols-3 sm:grid-cols-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-1 sm:col-span-2 font-medium text-slate-700">
                      {screen}
                    </div>
                    <div className="text-center flex justify-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
                        checked={perms.view}
                        onChange={(e) => handlePermissionChange(screen, 'view', e.target.checked)}
                      />
                    </div>
                    <div className="text-center flex justify-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer disabled:opacity-50"
                        checked={perms.edit}
                        onChange={(e) => handlePermissionChange(screen, 'edit', e.target.checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <PrimaryButton onClick={handleSavePermissions}>Save Configuration</PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default RoleConfig;
