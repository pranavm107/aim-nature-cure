import React from 'react';
import Modal from '../common/Modal';
import { InputField, PrimaryButton } from '../common/FormFields';
import { AVAILABLE_SCREENS } from '../../services/rolesService';

const RoleModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingRole }) => {
  const handlePermissionChange = (screen, type, value) => {
    setFormData(prev => {
      const perms = prev.permissions || {};
      const screenPerms = perms[screen] || { view: false, edit: false };
      
      const newScreenPerms = { ...screenPerms, [type]: value };
      
      if (type === 'edit' && value) newScreenPerms.view = true;
      if (type === 'view' && !value) newScreenPerms.edit = false;

      return {
        ...prev,
        permissions: {
          ...perms,
          [screen]: newScreenPerms
        }
      };
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
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase rounded-t-lg">
              <div>Screen</div>
              <div className="text-center">View</div>
              <div className="text-center">Edit</div>
            </div>
            {AVAILABLE_SCREENS.map((screen) => {
              const perms = (formData.permissions && formData.permissions[screen]) || { view: false, edit: false };
              return (
                <div key={screen} className="grid grid-cols-3 gap-2 px-3 py-2 border-b border-slate-100 items-center">
                  <div className="text-sm text-slate-700 font-medium">{screen}</div>
                  <div className="flex justify-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-slate-300"
                      checked={perms.view}
                      onChange={(e) => handlePermissionChange(screen, 'view', e.target.checked)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-slate-300"
                      checked={perms.edit}
                      onChange={(e) => handlePermissionChange(screen, 'edit', e.target.checked)}
                    />
                  </div>
                </div>
              );
            })}
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
