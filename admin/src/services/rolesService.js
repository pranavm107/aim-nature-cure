const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Available permissions in the system
export const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', name: 'View Dashboard', group: 'General' },
  { id: 'manage_users', name: 'Manage Users', group: 'Administration' },
  { id: 'manage_roles', name: 'Manage Roles', group: 'Administration' },
  { id: 'view_patients', name: 'View Patients', group: 'Clinical' },
  { id: 'edit_patients', name: 'Add/Edit Patients', group: 'Clinical' },
  { id: 'manage_appointments', name: 'Manage Appointments', group: 'Operations' },
  { id: 'manage_therapies', name: 'Manage Therapies & Packages', group: 'Operations' },
  { id: 'view_reports', name: 'View Reports', group: 'Analytics' },
  { id: 'manage_billing', name: 'Manage Billing & Invoices', group: 'Finance' },
];

let mockRoles = [
  { 
    _id: 'role1', 
    name: 'Super Admin', 
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    isSystem: true // Cannot be deleted
  },
  { 
    _id: 'role2', 
    name: 'Receptionist', 
    permissions: ['view_dashboard', 'view_patients', 'add_patients', 'manage_appointments', 'manage_billing'],
    isSystem: false
  },
  { 
    _id: 'role3', 
    name: 'Doctor', 
    permissions: ['view_dashboard', 'view_patients', 'edit_patients', 'view_reports'],
    isSystem: true
  }
];

export const rolesService = {
  getAllRoles: async () => {
    await delay();
    return { success: true, roles: [...mockRoles] };
  },

  getRoleById: async (id) => {
    await delay();
    const role = mockRoles.find(r => r._id === id);
    if (!role) throw new Error("Role not found");
    return { success: true, role };
  },

  createRole: async (roleData) => {
    await delay();
    const newRole = {
      _id: 'role_' + Date.now(),
      name: roleData.name,
      permissions: roleData.permissions || [],
      isSystem: false
    };
    mockRoles.push(newRole);
    return { success: true, role: newRole };
  },

  updateRole: async (id, roleData) => {
    await delay();
    const idx = mockRoles.findIndex(r => r._id === id);
    if (idx > -1) {
      if (mockRoles[idx].isSystem && roleData.name !== mockRoles[idx].name) {
        // Can only update permissions of system roles, not name
        mockRoles[idx].permissions = roleData.permissions;
      } else {
        mockRoles[idx] = { ...mockRoles[idx], ...roleData, _id: id };
      }
      return { success: true, role: mockRoles[idx] };
    }
    throw new Error("Role not found");
  },

  deleteRole: async (id) => {
    await delay();
    const idx = mockRoles.findIndex(r => r._id === id);
    if (idx > -1) {
      if (mockRoles[idx].isSystem) {
        throw new Error("Cannot delete a system role");
      }
      mockRoles.splice(idx, 1);
      return { success: true };
    }
    throw new Error("Role not found");
  }
};
