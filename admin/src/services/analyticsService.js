import { mockPatients, mockDoctors, mockInvoices, mockLeads, mockSocialSubmissions, mockFollowUps, mockConsultations, mockTherapySessions, mockPayments } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const analyticsService = {
  getDashboardData: async () => {
    await delay();
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Total Patients
    const totalPatients = mockPatients.length;
    const newPatients = mockPatients.filter(p => new Date(p.date) > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
    const totalDoctors = mockDoctors.length;
    
    // Revenue calculations (using actual mockPayments for paid revenue)
    const totalRevenue = mockPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    
    // Pending Payments (Invoices total - paid)
    const pendingPayments = mockInvoices.reduce((acc, inv) => {
      const paid = mockPayments.filter(p => p.invoiceId === inv._id).reduce((sum, p) => sum + p.amount, 0);
      return acc + (inv.totalAmount - paid);
    }, 0);
    
    // Leads & Social & Follow-ups
    const newLeadsCount = mockLeads.filter(l => l.status === 'New').length;
    const pendingSocial = mockSocialSubmissions.filter(s => s.status === 'Pending').length;
    const pendingFollowUps = mockFollowUps.filter(f => f.status === 'Pending').length;

    // Today's Operations
    // Using simple date matching. In real app, timezone handling is needed.
    const todaysConsultations = mockConsultations.filter(c => {
      return new Date(c.date).toISOString().split('T')[0] === todayStr || true; // Fallback to all for mock demo if none today
    }).length;

    const todaysTherapies = mockTherapySessions.filter(t => {
      return (t.scheduledDate && t.scheduledDate === todayStr) || true; // Fallback to all for mock demo
    }).length;

    const pendingDailyReports = 2; // Keep static as dailyReport mock doesn't exist in detail

    // Revenue trend (static mock but scaled to actual totalRevenue)
    const revenueTrend = [
      { month: 'Jan', revenue: Math.floor(totalRevenue * 0.1) },
      { month: 'Feb', revenue: Math.floor(totalRevenue * 0.15) },
      { month: 'Mar', revenue: Math.floor(totalRevenue * 0.2) },
      { month: 'Apr', revenue: Math.floor(totalRevenue * 0.25) },
      { month: 'May', revenue: Math.floor(totalRevenue * 0.3) },
    ];
    
    const leadSources = [
      { name: 'Instagram', value: 45 },
      { name: 'Google Ads', value: 30 },
      { name: 'Referral', value: 20 },
      { name: 'Walk-in', value: 5 },
    ];

    // Top Doctors ranked by Consultations count
    const topDoctors = mockDoctors.slice(0, 3).map(doc => {
      const docConsultations = mockConsultations.filter(c => c.doctorId === doc._id).length;
      return {
        name: doc.name,
        consultationCount: docConsultations,
        patients: mockPatients.filter(p => p.assignedDoctor === doc._id).length
      };
    }).sort((a, b) => b.consultationCount - a.consultationCount);

    return {
      success: true,
      data: {
        totalPatients,
        newPatients,
        totalDoctors,
        totalRevenue,
        pendingPayments,
        newLeadsCount,
        pendingSocial,
        pendingFollowUps,
        revenueTrend,
        leadSources,
        topDoctors,
        todaysConsultations: mockConsultations.length, // Using absolute length for demo purposes so it's not 0
        todaysTherapies: mockTherapySessions.length, // Using absolute length for demo purposes so it's not 0
        pendingDailyReports
      }
    };
  }
};
