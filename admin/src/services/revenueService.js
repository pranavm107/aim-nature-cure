import apiClient from './apiClient';
import { adminService } from './adminService';

const isValidUUID = (str) => {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(str);
};

export const normalizeDoctorPeriod = (period) => {
  const p = (period || 'this_month').toLowerCase();
  if (p === 'today') return 'today';
  if (p === 'week' || p === 'this_week') return 'this_week';
  if (p === 'month' || p === 'this_month') return 'this_month';
  return p;
};

export const normalizeComparisonPeriod = (period) => {
  const p = (period || 'month').toLowerCase();
  if (p === 'today') return 'today';
  if (p === 'week' || p === 'this_week') return 'week';
  if (p === 'month' || p === 'this_month') return 'month';
  return p;
};

export const normalizeOverallPeriod = (period) => {
  const p = (period || 'all').toLowerCase();
  if (p === 'today') return 'today';
  if (p === 'week' || p === 'this_week') return 'week';
  if (p === 'month' || p === 'this_month') return 'month';
  if (p === 'all') return 'all';
  return p;
};

export const revenueService = {
  /**
   * Helper to resolve the authenticated doctor's real doctor UUID
   * (maps user.uuid/email to doctor.uuid)
   */
  resolveDoctorId: async () => {
    const cachedDoctorId = localStorage.getItem('doctorId');
    const userRole = (localStorage.getItem('userRole') || '').toLowerCase();
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');

    try {
      const res = await adminService.getAllDoctors();
      if (res.success && Array.isArray(res.doctors)) {
        // Find doctor record where email or userId matches
        const matched = res.doctors.find(d => 
          (userEmail && d.email && d.email.toLowerCase() === userEmail.toLowerCase()) ||
          (userId && (d.userId === userId || d.uuid === userId))
        );
        if (matched && matched.uuid) {
          localStorage.setItem('doctorId', matched.uuid);
          document.cookie = `doctorId=${matched.uuid}; path=/; max-age=86400`;
          return matched.uuid;
        }
      }
    } catch (e) {
      console.warn("Could not map doctor ID:", e);
    }

    return isValidUUID(cachedDoctorId) ? cachedDoctorId : null;
  },

  /**
   * Doctor revenue endpoint: GET /revenue/doctor
   * Query params:
   *   doctorId: optional for all doctors, required for individual doctor
   *   period: today, this_week, this_month
   */
  getDoctorRevenue: async (doctorId = null, period = 'this_month') => {
    try {
      const normalizedPeriod = normalizeDoctorPeriod(period);
      const params = { period: normalizedPeriod };

      if (doctorId && typeof doctorId === 'string' && doctorId !== 'undefined' && doctorId !== 'null' && doctorId !== 'ALL') {
        params.doctorId = doctorId.trim();
      }

      const response = await apiClient.get('/revenue/doctor', { params });
      const data = response.data;
      const list = Array.isArray(data?.result)
        ? data.result
        : (Array.isArray(data?.content) ? data.content : (data?.result ? [data.result] : []));

      // If specific doctor was requested, find matching or take first
      let item = null;
      if (params.doctorId) {
        item = list.find(d => d.doctorId === params.doctorId) || list[0] || null;
      } else {
        item = list[0] || null;
      }

      if (item) {
        const rev = Number(item.revenue !== undefined ? item.revenue : (item.totalRevenue !== undefined ? item.totalRevenue : 0));
        return {
          success: true,
          revenue: rev,
          totalRevenue: rev,
          completedAppointments: Number(item.completedAppointments || 0),
          doctorId: item.doctorId || params.doctorId,
          doctorName: item.doctorName || '',
          period: item.period || normalizedPeriod,
          attributionNote: item.attributionNote || "TBD: Revenue currently attributed entirely to the assigning doctor of the invoice.",
          rawData: item
        };
      }

      // Empty response from backend
      return {
        success: true,
        revenue: 0,
        totalRevenue: 0,
        completedAppointments: 0,
        doctorId: params.doctorId || '',
        doctorName: '',
        period: normalizedPeriod,
        attributionNote: "No revenue records found for this period.",
        rawData: null
      };
    } catch (error) {
      console.error("Failed to fetch doctor revenue:", error);
      return {
        success: false,
        revenue: 0,
        totalRevenue: 0,
        completedAppointments: 0,
        message: error.response?.data?.message || error.message || 'Failed to fetch doctor revenue'
      };
    }
  },

  /**
   * All doctors revenue endpoint: GET /revenue/doctor (without doctorId param)
   * Query params:
   *   period: today, this_week, this_month
   */
  getAllDoctorsRevenue: async (period = 'this_month') => {
    try {
      const normalizedPeriod = normalizeDoctorPeriod(period);
      const response = await apiClient.get('/revenue/doctor', {
        params: { period: normalizedPeriod }
      });
      const data = response.data;
      const list = Array.isArray(data?.result)
        ? data.result
        : (Array.isArray(data?.content) ? data.content : []);

      const doctors = list.map(item => {
        const rev = Number(item.revenue !== undefined ? item.revenue : (item.totalRevenue !== undefined ? item.totalRevenue : 0));
        return {
          doctorId: item.doctorId,
          doctorName: item.doctorName || 'Doctor',
          period: item.period || normalizedPeriod,
          revenue: rev,
          totalRevenue: rev,
          completedAppointments: Number(item.completedAppointments || 0),
          attributionNote: item.attributionNote || ''
        };
      });

      const totalRevenue = doctors.reduce((sum, d) => sum + d.revenue, 0);

      return {
        success: true,
        doctors,
        totalRevenue,
        period: normalizedPeriod,
        totalElements: data?.totalElements ?? doctors.length
      };
    } catch (error) {
      console.error("Failed to fetch all doctors revenue:", error);
      return {
        success: false,
        doctors: [],
        totalRevenue: 0,
        message: error.response?.data?.message || error.message || 'Failed to fetch all doctors revenue'
      };
    }
  },

  /**
   * Doctor revenue comparison endpoint: GET /revenue/comparison
   * Query params:
   *   period: today, week, month
   */
  getDoctorRevenueComparison: async (period = 'month') => {
    try {
      const normalizedPeriod = normalizeComparisonPeriod(period);
      const response = await apiClient.get('/revenue/comparison', {
        params: { period: normalizedPeriod }
      });
      const data = response.data;
      const list = Array.isArray(data?.result)
        ? data.result
        : (Array.isArray(data?.content) ? data.content : []);

      const comparison = list.map((item, index) => {
        const rev = Number(item.generatedRevenue !== undefined ? item.generatedRevenue : (item.revenue !== undefined ? item.revenue : 0));
        return {
          rank: item.rank !== undefined ? item.rank : index + 1,
          doctorId: item.doctorId,
          doctorName: item.doctorName || 'Doctor',
          generatedRevenue: rev,
          revenue: rev,
          completedAppointments: Number(item.completedAppointments || 0)
        };
      });

      return {
        success: true,
        comparison,
        period: normalizedPeriod,
        totalElements: data?.totalElements ?? comparison.length
      };
    } catch (error) {
      console.error("Failed to fetch doctor revenue comparison:", error);
      return {
        success: false,
        comparison: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch doctor revenue comparison'
      };
    }
  },

  // Alias for backward compatibility
  getDoctorComparison: async (period = 'month') => {
    return revenueService.getDoctorRevenueComparison(period);
  },

  /**
   * Overall clinic revenue endpoint: GET /revenue/overall
   * Query params:
   *   period: all, today, week, month
   */
  getOverallRevenue: async (period = 'all') => {
    try {
      const normalizedPeriod = normalizeOverallPeriod(period);
      const response = await apiClient.get('/revenue/overall', {
        params: { period: normalizedPeriod }
      });
      const data = response.data;
      const result = data?.result || data;

      const totalRevenue = Number(result?.totalRevenue || 0);
      const pendingPayments = Number(result?.pendingPayments || 0);

      return {
        success: true,
        totalRevenue,
        pendingPayments,
        totalPatients: result?.totalPatients,
        pendingFollowUps: result?.pendingFollowUps,
        period: result?.period || normalizedPeriod,
        raw: result
      };
    } catch (error) {
      console.error("Failed to fetch overall clinic revenue:", error);
      return {
        success: false,
        totalRevenue: 0,
        pendingPayments: 0,
        message: error.response?.data?.message || error.message || 'Failed to fetch overall revenue'
      };
    }
  },

  /**
   * Summary method: Fetches overall clinic revenue across all 4 key periods in parallel
   */
  getOverallRevenueSummary: async () => {
    try {
      const [allRes, todayRes, weekRes, monthRes] = await Promise.allSettled([
        revenueService.getOverallRevenue('all'),
        revenueService.getOverallRevenue('today'),
        revenueService.getOverallRevenue('week'),
        revenueService.getOverallRevenue('month')
      ]);

      return {
        success: true,
        allTime: allRes.status === 'fulfilled' && allRes.value.success ? allRes.value.totalRevenue : 0,
        pendingPayments: allRes.status === 'fulfilled' && allRes.value.success ? allRes.value.pendingPayments : 0,
        today: todayRes.status === 'fulfilled' && todayRes.value.success ? todayRes.value.totalRevenue : 0,
        week: weekRes.status === 'fulfilled' && weekRes.value.success ? weekRes.value.totalRevenue : 0,
        month: monthRes.status === 'fulfilled' && monthRes.value.success ? monthRes.value.totalRevenue : 0
      };
    } catch (error) {
      console.error("Failed to fetch overall revenue summary:", error);
      return {
        success: false,
        allTime: 0,
        pendingPayments: 0,
        today: 0,
        week: 0,
        month: 0
      };
    }
  }
};

export default revenueService;