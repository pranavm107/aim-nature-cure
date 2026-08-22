import { mockInvoices, mockPayments } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const invoiceService = {
  getInvoices: async () => {
    await delay();
    return { success: true, invoices: mockInvoices };
  },

  getPatientInvoices: async (patientId) => {
    await delay();
    const invoices = mockInvoices.filter(i => i.patientId === patientId);
    return { success: true, invoices };
  },

  getInvoiceById: async (id) => {
    await delay();
    const invoice = mockInvoices.find(i => i._id === id);
    if (!invoice) throw new Error("Invoice not found");
    
    const payments = mockPayments.filter(p => p.invoiceId === id);
    
    return { success: true, invoice, payments };
  },

  createInvoice: async (invoiceData) => {
    await delay();
    const newInvoice = {
      _id: "inv" + Date.now(),
      date: Date.now(),
      paidAmount: 0,
      status: "Pending",
      ...invoiceData
    };
    mockInvoices.push(newInvoice);
    return { success: true, invoice: newInvoice };
  }
};
