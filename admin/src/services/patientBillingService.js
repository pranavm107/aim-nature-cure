import { mockInvoices, mockPayments } from '../mocks/mockData';
import { patientActivityService } from './patientActivityService';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const patientBillingService = {
  getPatientBillingSummary: async (patientId) => {
    await delay();
    
    const invoices = mockInvoices.filter(i => i.patientId === patientId);
    const payments = mockPayments.filter(p => p.patientId === patientId);

    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Refunds logic if refund payments exist (e.g. negative amount or specific type)
    const refunded = payments.filter(p => p.amount < 0 || p.type === 'Refund').reduce((sum, p) => sum + Math.abs(p.amount), 0);
    
    const outstandingBalance = totalBilled - totalPaid + refunded;

    return {
      success: true,
      summary: {
        totalBilled,
        totalPaid,
        pending: outstandingBalance,
        refunded
      }
    };
  },

  getPatientInvoices: async (patientId) => {
    await delay();
    const invoices = mockInvoices.filter(i => i.patientId === patientId);
    
    // Calculate balance for each invoice
    const enrichedInvoices = invoices.map(inv => {
      const invPayments = mockPayments.filter(p => p.invoiceId === inv._id);
      const paid = invPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = inv.totalAmount - paid;
      
      // Sync status based on actual payments
      let status = inv.status;
      if (balance <= 0) status = 'Paid';
      else if (paid > 0) status = 'Partial';
      else if (new Date(inv.dueDate) < new Date()) status = 'Overdue';
      else status = 'Pending';
      
      return {
        ...inv,
        paidAmount: paid,
        balance: balance,
        status: status
      };
    });
    
    return { success: true, invoices: enrichedInvoices.sort((a, b) => b.date - a.date) };
  },

  getPatientPayments: async (patientId) => {
    await delay();
    const payments = mockPayments.filter(p => p.patientId === patientId).sort((a, b) => b.date - a.date);
    return { success: true, payments };
  },

  recordPatientPayment: async (data) => {
    await delay();
    const { patientId, invoiceId, amount, mode, date, transactionId, notes } = data;
    
    const invoiceIndex = mockInvoices.findIndex(i => i._id === invoiceId);
    if (invoiceIndex === -1) throw new Error("Invoice not found");

    const newPayment = {
      _id: "pay" + Date.now(),
      invoiceId,
      patientId,
      amount: parseFloat(amount),
      mode,
      date: date || Date.now(),
      transactionId: transactionId || "TXN" + Math.floor(Math.random() * 1000000000),
      notes
    };
    
    mockPayments.push(newPayment);
    
    return { success: true, payment: newPayment };
  }
};
