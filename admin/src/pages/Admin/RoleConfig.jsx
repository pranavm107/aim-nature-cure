import React, { useState, useEffect } from 'react';
import { rolesService } from '../../services/rolesService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-toastify';
import { SelectField, PrimaryButton, InputField } from '../../components/common/FormFields';

const RoleConfig = () => {
  const [roles, setRoles] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [currentRole, setCurrentRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());

  // Modal state for Add Role
  const [isAdding, setIsAdding] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, screensRes] = await Promise.all([
        rolesService.getRoles(),
        rolesService.getScreensWithPermissions()
      ]);

      if (screensRes.success) {
        setScreens(screensRes.screens || []);
      }

      if (rolesRes.success) {
        setRoles(rolesRes.roles || []);
        if (!selectedRoleId && rolesRes.roles?.length > 0) {
          const firstRole = rolesRes.roles[0];
          setSelectedRoleId(firstRole.uuid || firstRole._id || firstRole.id);
        } else if (selectedRoleId) {
          const updated = rolesRes.roles.find(r => (r.uuid || r._id || r.id) === selectedRoleId);
          if (updated) setCurrentRole(updated);
        }
      }
    } catch (err) {
      toast.error("Failed to load roles configuration data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When selectedRoleId changes, update currentRole and fetch its permissions
  useEffect(() => {
    const loadRoleDetails = async () => {
      if (!selectedRoleId || isAdding) return;

      const role = roles.find(r => (r.uuid || r._id || r.id) === selectedRoleId);
      setCurrentRole(role ? JSON.parse(JSON.stringify(role)) : null);

      try {
        const permsRes = await rolesService.getPermissionsByRole(selectedRoleId);
        if (permsRes.success) {
          const permIds = permsRes.permissions.map(p => p.uuid || p._id || p.id);
          setSelectedPermissionIds(new Set(permIds));
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load assigned permissions");
      }
    };

    loadRoleDetails();
  }, [selectedRoleId, roles, isAdding]);

  const handleRoleSelect = (e) => {
    const id = e.target.value;
    setSelectedRoleId(id);
    setIsAdding(false);
  };

  const startAddingRole = () => {
    setIsAdding(true);
    setCurrentRole(null);
    setNewRoleName('');
    setNewRoleDesc('');
    setSelectedPermissionIds(new Set());
  };

  const handleSaveRole = async () => {
    if (isAdding) {
      if (!newRoleName.trim()) return toast.error("Role name is required");

      const payload = {
        roleName: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permissionIds: Array.from(selectedPermissionIds)
      };

      try {
        const res = await rolesService.createRole(payload);
        if (res.success) {
          toast.success("Role created successfully");
          setIsAdding(false);
          setNewRoleName('');
          setNewRoleDesc('');
          const newRoleId = res.role?.uuid || res.role?._id || res.role?.id;
          if (newRoleId) setSelectedRoleId(newRoleId);
          fetchData();
        } else {
          toast.error(res.message);
        }
      } catch (err) {
        toast.error("Failed to create role");
      }
    } else {
      if (!currentRole) return;

      const payload = {
        uuid: currentRole.uuid || currentRole._id || currentRole.id,
        roleName: currentRole.roleName || currentRole.name,
        description: currentRole.description,
        permissionIds: Array.from(selectedPermissionIds)
      };

      try {
        const res = await rolesService.updateRole(payload);
        if (res.success) {
          toast.success("Role updated successfully");
          fetchData();
        } else {
          toast.error(res.message);
        }
      } catch (err) {
        toast.error("Failed to update role");
      }
    }
  };

  const handlePermissionToggle = (permId) => {
    setSelectedPermissionIds(prev => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  if (loading && roles.length === 0) return <PageContainer><p>Loading...</p></PageContainer>;

  return (
    <PageContainer>
      <PageHeader title="Roles & Permissions" subtitle="Manage access across system screens" />

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            {!isAdding && (
              <SelectField
                label="Select Role"
                options={roles.map(r => ({ value: r.uuid || r._id || r.id, label: r.roleName || r.name }))}
                value={selectedRoleId}
                onChange={handleRoleSelect}
              />
            )}
          </div>
          <div className="flex gap-2">
            {!isAdding ? (
              <button onClick={startAddingRole} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                + Add Role
              </button>
            ) : (
              <button onClick={() => { setIsAdding(false); setSelectedRoleId(roles[0]?.uuid || ''); }} className="px-3 py-2 border rounded-lg text-sm text-slate-500 hover:bg-slate-50">
                Cancel Adding
              </button>
            )}
          </div>
        </div>

        {(currentRole || isAdding) && (
          <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col sm:flex-row">

            <div className="sm:w-1/3 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-4">{isAdding ? 'New Role Details' : 'Edit Role Details'}</h3>
              </div>

              {isAdding ? (
                <>
                  <InputField
                    label="Role Name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. RECEPTIONIST"
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Description</label>
                    <textarea
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
                      rows="3"
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      placeholder="Role description"
                    />
                  </div>
                </>
              ) : (
                <>
                  <InputField
                    label="Role Name"
                    value={currentRole.roleName || currentRole.name || ''}
                    onChange={(e) => setCurrentRole({ ...currentRole, roleName: e.target.value })}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Description</label>
                    <textarea
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
                      rows="3"
                      value={currentRole.description || ''}
                      onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="sm:w-2/3 bg-white p-6">
              <div className="mb-4 flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800">Permissions</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{selectedPermissionIds.size} selected</span>
              </div>

              <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2">
                {screens.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No screens/permissions defined in system.</p>
                ) : (
                  screens.map(screen => (
                    <div key={screen.uuid || screen.id || screen.screenName} className="border border-slate-100 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 font-medium text-slate-700 text-sm border-b border-slate-100">
                        {screen.screenName || screen.name}
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(screen.permissions || []).map(perm => {
                          const permId = perm.uuid || perm.id || perm._id;
                          return (
                            <label key={permId} className="flex items-start gap-2 cursor-pointer group">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20"
                                checked={selectedPermissionIds.has(permId)}
                                onChange={() => handlePermissionToggle(permId)}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{perm.permissionName || perm.name}</span>
                                {perm.description && <span className="text-xs text-slate-500">{perm.description}</span>}
                              </div>
                            </label>
                          )
                        })}
                        {(!screen.permissions || screen.permissions.length === 0) && (
                          <span className="text-xs text-slate-400 italic">No permissions mapped</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <PrimaryButton onClick={handleSaveRole}>Save Role & Permissions</PrimaryButton>
              </div>
            </div>

          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default RoleConfig;
