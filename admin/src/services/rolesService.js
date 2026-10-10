import apiClient from './apiClient';

export const rolesService = {
  getRoles: async () => {
    try {
      const response = await apiClient.get('/roles/all');
      let roles = response.data;
      if (roles.result) roles = roles.result;
      if (roles.roles) roles = roles.roles;

      if (!Array.isArray(roles)) {
        roles = [roles];
      }
      return { success: true, roles };
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to load roles' };
    }
  },

  getAllRoles: async () => {
    // Alias for backward compatibility if any components use it
    return rolesService.getRoles();
  },

  getRoleById: async (roleId) => {
    try {
      const response = await apiClient.get(`/roles/${roleId}`);
      let role = response.data;
      if (role.result) role = role.result;
      if (role.role) role = role.role;
      return { success: true, role };
    } catch (error) {
      console.error("Failed to get role by ID:", error);
      return { success: false, message: error.response?.data?.message || 'Role not found' };
    }
  },

  createRole: async (payload) => {
    try {
      const response = await apiClient.post('/roles/create', payload);
      let role = response.data;
      if (role.result) role = role.result;
      return { success: true, role, message: response.data?.message || 'Role created successfully' };
    } catch (error) {
      console.error("Failed to create role:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to create role' };
    }
  },

  updateRole: async (payload) => {
    try {
      const response = await apiClient.put('/roles/update', payload);
      let role = response.data;
      if (role.result) role = role.result;
      return { success: true, role, message: response.data?.message || 'Role updated successfully' };
    } catch (error) {
      console.error("Failed to update role:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to update role' };
    }
  },

  getScreensWithPermissions: async () => {
    try {
      const response = await apiClient.get('/screens/all-with-permissions');
      let screens = response.data;
      if (screens.result) screens = screens.result;
      if (!Array.isArray(screens)) {
        screens = screens ? [screens] : [];
      }
      return { success: true, screens };
    } catch (error) {
      console.error("Failed to fetch screens and permissions:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to load permissions' };
    }
  },

  getPermissionsByRole: async (roleId) => {
    try {
      const response = await apiClient.get(`/permissions/role/${roleId}`);
      let permissions = response.data;
      if (permissions.result) permissions = permissions.result;
      if (!Array.isArray(permissions)) {
        permissions = permissions ? [permissions] : [];
      }
      return { success: true, permissions };
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to load assigned permissions' };
    }
  },

  getPermissionsByUser: async (userId) => {
    try {
      const response = await apiClient.get(`/permissions/user/${userId}`);
      let permissions = response.data;
      if (permissions.result) permissions = permissions.result;
      if (!Array.isArray(permissions)) {
        permissions = permissions ? [permissions] : [];
      }
      return { success: true, permissions };
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      return { success: false, message: error.response?.data?.message || 'Failed to load user permissions' };
    }
  }
};
