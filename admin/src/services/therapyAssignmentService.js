import apiClient from './apiClient';

export const therapyAssignmentService = {
  /**
   * Assign single or multiple therapies / packages to a patient with Date & Time
   * Calls: POST /api/v1/therapy-assignments/assign
   */
  assign: async ({
    patientId,
    assignmentType = 'Standalone',
    therapyId = null,
    items = [],
    packageId = null,
    assignedDate = new Date().toISOString().split('T')[0],
    assignedTime = new Date().toTimeString().slice(0, 5) + ':00',
    userId = null
  }) => {
    try {
      const doctorId = userId || localStorage.getItem('userId') || localStorage.getItem('doctorId');
      const formattedTime = assignedTime && assignedTime.length === 5 ? `${assignedTime}:00` : assignedTime;

      if (assignmentType === 'Package') {
        const payload = {
          patientId,
          assignmentType: 'Package',
          packageId,
          assignedDate,
          assignedTime: formattedTime,
          userId: doctorId
        };
        const response = await apiClient.post('/therapy-assignments/assign', payload);
        return {
          success: true,
          data: response.data?.result || response.data,
          message: response.data?.message || 'Package assigned successfully'
        };
      }

      // Standalone Therapies assignment
      const itemsToAssign = items.length > 0 
        ? items.map(item => ({
            therapyId: item.therapyId || item._id || item.uuid,
            sessions: Number(item.sessions || 1),
            price: Number(item.price || 0)
          }))
        : (therapyId ? [{ therapyId, sessions: 1, price: 0 }] : []);

      const payload = {
        patientId,
        assignmentType: 'Standalone',
        therapyId: itemsToAssign[0]?.therapyId || therapyId,
        items: itemsToAssign,
        therapyIds: itemsToAssign.map(i => i.therapyId),
        assignedDate,
        assignedTime: formattedTime,
        userId: doctorId
      };

      const response = await apiClient.post('/therapy-assignments/assign', payload);
      return {
        success: true,
        data: response.data?.result || response.data,
        message: response.data?.message || `Successfully assigned ${itemsToAssign.length} ${itemsToAssign.length === 1 ? 'therapy' : 'therapies'}`
      };
    } catch (error) {
      console.error("Error assigning therapies:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to assign therapy'
      };
    }
  },

  /**
   * Get All Therapy Assignments for a patient (or filtered by userId for non-admins)
   * Calls: GET /api/v1/therapy-assignments/all?patientId={patientId}&page={page}&size={size}&userId={userId}
   */
  getPatientAssignments: async (patientId, page = 0, size = 10, userId = null) => {
    try {
      const params = { page, size };
      if (patientId) params.patientId = patientId;
      const effectiveUserId = userId || localStorage.getItem('userId') || localStorage.getItem('doctorId');
      const role = (localStorage.getItem('userRole') || '').toLowerCase();
      if (role !== 'admin' && effectiveUserId) {
        params.userId = effectiveUserId;
      }

      const response = await apiClient.get('/therapy-assignments/all', { params });
      const data = response.data;
      const list = Array.isArray(data?.result)
        ? data.result
        : (Array.isArray(data?.content) ? data.content : []);
      return {
        success: true,
        assignments: list,
        totalElements: data?.totalElements || list.length
      };
    } catch (error) {
      console.error("Error fetching patient therapy assignments:", error);
      return {
        success: false,
        assignments: [],
        message: error.response?.data?.message || 'Failed to fetch assignments'
      };
    }
  },

  /**
   * Get Assignment By ID
   * Calls: GET /api/v1/therapy-assignments/{assignmentId}
   */
  getAssignmentById: async (assignmentId) => {
    try {
      const response = await apiClient.get(`/therapy-assignments/${assignmentId}`);
      return {
        success: true,
        data: response.data?.result || response.data
      };
    } catch (error) {
      console.error("Error fetching assignment details:", error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch assignment details'
      };
    }
  },

  /**
   * Get Generated Therapy Sessions for Patient (filtered by userId for doctors)
   * Calls: GET /api/v1/therapy-sessions/all?patientId={patientId}&page={page}&size={size}&userId={userId}
   */
  getPatientSessions: async (patientId, page = 0, size = 20, userId = null) => {
    try {
      const params = { page, size };
      if (patientId) params.patientId = patientId;
      const effectiveUserId = userId || localStorage.getItem('userId') || localStorage.getItem('doctorId');
      const role = (localStorage.getItem('userRole') || '').toLowerCase();
      if (role !== 'admin' && effectiveUserId) {
        params.userId = effectiveUserId;
      }

      const response = await apiClient.get('/therapy-sessions/all', { params });
      const data = response.data;
      const list = Array.isArray(data?.result)
        ? data.result
        : (Array.isArray(data?.content) ? data.content : []);
      return {
        success: true,
        sessions: list,
        totalElements: data?.totalElements || list.length
      };
    } catch (error) {
      console.error("Error fetching therapy sessions:", error);
      return {
        success: false,
        sessions: [],
        message: error.response?.data?.message || 'Failed to fetch sessions'
      };
    }
  },

  /**
   * Update Session Status (Completed / Missed / In-Progress)
   * Calls: PATCH /api/v1/therapy-sessions/{sessionId}/status?status={status}&remarks={remarks}&date={date}
   */
  updateSessionStatus: async (sessionId, status = 'Completed', remarks = '', date = new Date().toISOString().split('T')[0]) => {
    try {
      const response = await apiClient.patch(`/therapy-sessions/${sessionId}/status`, null, {
        params: { status, remarks, date }
      });
      return {
        success: true,
        data: response.data?.result || response.data,
        message: response.data?.message || `Session marked as ${status}`
      };
    } catch (error) {
      console.error("Error updating session status:", error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update session status'
      };
    }
  }
};

export default therapyAssignmentService;
