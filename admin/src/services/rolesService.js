const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Available screens in the system
export const AVAILABLE_SCREENS = [
  'Dashboard',
  'Doctors',
  'Patients',
  'Appointments',
  'Therapies',
  'Packages',
  'Follow-Ups',
  'Reports'
];

// Helper to generate the default permissions object (View: false, Edit: false for all)
const generateDefaultPermissions = () => {
  const perms = {};
  AVAILABLE_SCREENS.forEach(screen => {
    perms[screen] = { view: false, edit: false };
  });
  return perms;
};

// Seed mock roles
let mockRoles = [
  { 
    _id: 'role1', 
    name: 'Super Admin', 
    permissions: AVAILABLE_SCREENS.reduce((acc, screen) => {
      acc[screen] = { view: true, edit: true };
      return acc;
    }, {}),
    isSystem: true
  },
  { 
    _id: 'role2', 
    name: 'Receptionist', 
    permissions: AVAILABLE_SCREENS.reduce((acc, screen) => {
      // Example restricted permissions
      if (['Dashboard', 'Patients', 'Appointments'].includes(screen)) {
        acc[screen] = { view: true, edit: true };
      } else if (screen === 'Doctors' || screen === 'Therapies' || screen === 'Packages') {
        acc[screen] = { view: true, edit: false };
      } else {
        acc[screen] = { view: false, edit: false };
      }
      return acc;
    }, {}),
    isSystem: false
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
      permissions: roleData.permissions || generateDefaultPermissions(),
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
