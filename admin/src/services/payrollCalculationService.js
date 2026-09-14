import { getStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Get month date boundaries
const getMonthBounds = (monthString) => {
  // Assuming monthString is like "September 2026"
  const date = new Date(`${monthString} 1`);
  const start = new Date(date.getFullYear(), date.getMonth(), 1).setHours(0,0,0,0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
};

// Helper: Resolve the active rule for a specific category at a given date
const resolveApplicableRule = (rules, type, category, transactionDate) => {
  // transactionDate is a timestamp
  // Filter for active rules of the correct type and category
  // Status MUST NOT be Inactive
  const applicableRules = rules
    .filter(r => r.type === type && r.category === category && r.status !== 'Inactive')
    .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
  
  // Find the first rule where effectiveFrom <= transactionDate
  return applicableRules.find(r => new Date(r.effectiveFrom).getTime() <= transactionDate);
};

export const payrollCalculationService = {
  calculateMonthlyStatement: async (doctorId, monthString) => {
    await delay();
    
    // Fetch all required data
    const mockSalaries = getStore('mockSalaries');
    const mockInvoices = getStore('mockInvoices');
    const mockPayments = getStore('mockPayments');
    const mockIncentiveRules = getStore('mockIncentiveRules');
    const mockFollowUpActivities = getStore('mockFollowUpActivities');
    const mockSocialMediaActivities = getStore('mockSocialMediaActivities');
    const mockUsers = getStore('mockUsers');
    
    const doctor = mockUsers.find(u => u._id === doctorId);
    const doctorName = doctor ? doctor.name : 'Unknown Doctor';

    const { start, end } = getMonthBounds(monthString);

    // 1. Resolve Base Salary
    const docSalaries = mockSalaries
      .filter(s => s.doctorId === doctorId)
      .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
    const applicableSalary = docSalaries.find(s => new Date(s.effectiveFrom).getTime() <= end);
    const baseSalary = applicableSalary ? applicableSalary.salaryAmount : 0;

    // 2. Collect Paid Revenue & Calculate Incentives
    // Only consider payments within the month for this doctor
    const docPayments = mockPayments.filter(p => {
      // Find invoice to check doctorId
      const inv = mockInvoices.find(i => i._id === p.invoiceId);
      if (!inv || inv.doctorId !== doctorId) return false;
      return p.date >= start && p.date <= end;
    });

    let consultationRevenue = 0, treatmentRevenue = 0, packageRevenue = 0;
    let consultationIncentive = 0, treatmentIncentive = 0, packageIncentive = 0;
    
    // To preserve historical rule snapshot
    let consultationPercentage = 0, treatmentPercentage = 0, packagePercentage = 0;
    const paymentSourceIds = [];

    docPayments.forEach(payment => {
      const inv = mockInvoices.find(i => i._id === payment.invoiceId);
      // Determine category (Consultation, Treatment/Therapy, Package)
      // Usually the first item defines the invoice type in our mock data
      let category = 'Consultation';
      if (inv.items && inv.items.length > 0) {
        if (inv.items[0].type === 'Therapy' || inv.items[0].type === 'Treatment') category = 'Treatment';
        else if (inv.items[0].type === 'Package') category = 'Package';
      }

      const rule = resolveApplicableRule(mockIncentiveRules, 'Revenue', category, payment.date);
      const percentage = rule && rule.percentage ? rule.percentage : 0;
      const incentive = (payment.amount * percentage) / 100;

      if (category === 'Consultation') {
        consultationRevenue += payment.amount;
        consultationIncentive += incentive;
        if (percentage > 0) consultationPercentage = percentage;
      } else if (category === 'Treatment') {
        treatmentRevenue += payment.amount;
        treatmentIncentive += incentive;
        if (percentage > 0) treatmentPercentage = percentage;
      } else if (category === 'Package') {
        packageRevenue += payment.amount;
        packageIncentive += incentive;
        if (percentage > 0) packagePercentage = percentage;
      }

      paymentSourceIds.push(payment._id);
    });

    // 3. Activity Incentives (Follow-up)
    const approvedFollowUpsList = mockFollowUpActivities.filter(a => 
      a.doctorId === doctorId && 
      a.status === 'Approved' && 
      a.followUpDate && 
      new Date(a.followUpDate).getTime() >= start && 
      new Date(a.followUpDate).getTime() <= end
    );

    let followUpIncentive = 0;
    let followUpAmount = 0;
    const followUpSourceIds = [];

    approvedFollowUpsList.forEach(a => {
      const rule = resolveApplicableRule(mockIncentiveRules, 'Activity', 'Patient Follow-up', new Date(a.followUpDate).getTime());
      const amount = rule && rule.amount ? rule.amount : 0;
      followUpIncentive += amount;
      if (amount > 0) followUpAmount = amount;
      followUpSourceIds.push(a._id);
    });

    // 4. Activity Incentives (Social Media)
    const approvedSocialMediaList = mockSocialMediaActivities.filter(a => 
      a.doctorId === doctorId && 
      a.status === 'Approved' && 
      a.date >= start && 
      a.date <= end
    );

    let socialMediaIncentive = 0;
    let socialMediaAmount = 0;
    const socialMediaSourceIds = [];

    approvedSocialMediaList.forEach(a => {
      const rule = resolveApplicableRule(mockIncentiveRules, 'Activity', 'Social Media Activity', a.date);
      const amount = rule && rule.amount ? rule.amount : 0;
      socialMediaIncentive += amount;
      if (amount > 0) socialMediaAmount = amount;
      socialMediaSourceIds.push(a._id);
    });

    const totalRevenueIncentive = consultationIncentive + treatmentIncentive + packageIncentive;
    const totalActivityIncentive = followUpIncentive + socialMediaIncentive;
    const totalIncentive = totalRevenueIncentive + totalActivityIncentive;
    const grossEarnings = baseSalary + totalIncentive;

    // 5. Construct Statement
    const statement = {
      _id: 'stm_' + Date.now() + Math.floor(Math.random() * 1000),
      doctorId,
      doctorName,
      month: monthString,
      baseSalary,
      
      revenueIncentive: {
        consultationRevenue,
        consultationPercentage,
        consultationIncentive,
        treatmentRevenue,
        treatmentPercentage,
        treatmentIncentive,
        packageRevenue,
        packagePercentage,
        packageIncentive,
        total: totalRevenueIncentive
      },
      
      activityIncentive: {
        approvedFollowUps: approvedFollowUpsList.length,
        followUpAmount,
        followUpIncentive,
        approvedSocialMedia: approvedSocialMediaList.length,
        socialMediaAmount,
        socialMediaIncentive,
        total: totalActivityIncentive
      },

      totalIncentive,
      grossEarnings,
      status: 'Pending Review',
      
      calculationDetails: {
        paymentSourceIds,
        followUpSourceIds,
        socialMediaSourceIds
      },

      generatedAt: Date.now(),
      generatedBy: 'Admin',
      recalculatedAt: null,
      recalculatedBy: null
    };

    return { success: true, statement };
  }
};
