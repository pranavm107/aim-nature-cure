import { mockInvoices, mockPayments, mockDoctors } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const revenueService = {
  // BR-09: Revenue calculations use PAID amounts only
  getDoctorRevenue: async (doctorId, period = 'month') => {
    await delay();
    
    // In a real app, this would filter mockPayments by date and join with invoices to check docId.
    // Here we'll just mock a static response based on mock data.
    
    const docInvoices = mockInvoices.filter(i => i.docId === doctorId);
    const docInvoiceIds = docInvoices.map(i => i._id);
    const docPayments = mockPayments.filter(p => docInvoiceIds.includes(p.invoiceId));
    
    const totalPaidRevenue = docPayments.reduce((sum, p) => sum + p.amount, 0);

    return { 
      success: true, 
      revenue: totalPaidRevenue,
      attributionNote: "TBD: Revenue currently attributed entirely to the assigning doctor of the invoice."
    };
  },

  getDoctorComparison: async (period = 'month') => {
    await delay();
    
    // Mock comparative data
    const comparison = mockDoctors.map(doc => {
      const docInvoices = mockInvoices.filter(i => i.docId === doc._id);
      const docInvoiceIds = docInvoices.map(i => i._id);
      const docPayments = mockPayments.filter(p => docInvoiceIds.includes(p.invoiceId));
      const rev = docPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        doctorId: doc._id,
        doctorName: doc.name,
        revenue: rev
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return { 
      success: true, 
      comparison 
    };
  }
};
