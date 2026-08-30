import React from 'react';
import Modal from '../common/Modal';
import { InputField, PrimaryButton } from '../common/FormFields';
import { AVAILABLE_PERMISSIONS } from '../../services/rolesService';

const RoleModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingRole }) => {
  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.group]) acc[perm.group] = [];
    acc[perm.group].push(perm);
    return acc;
  }, {});

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingRole ? 'Edit Role' : 'Create New Role'}>
      <form onSubmit={onSubmit} className="space-y-6">
        <InputField 
          label="Role Name" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})}
          required
          disabled={editingRole?.isSystem}
        />
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">Assign Permissions</label>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {Object.entries(groupedPermissions).map(([group, perms]) => (
              <div key={group} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-2">{group}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {perms.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20"
                        checked={formData.permissions.includes(p.id)}
                        onChange={() => handleTogglePermission(p.id)}
                      />
                      <span className="text-sm text-slate-700 font-medium">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
          <PrimaryButton type="submit">Save Role</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;
