import { mockPayments, mockInvoices } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  getPayments: async () => {
    await delay();
    return { success: true, payments: mockPayments };
  },

  recordPayment: async (paymentData) => {
    await delay();
    // BR-08: Payment must have invoice
    const invoiceIndex = mockInvoices.findIndex(i => i._id === paymentData.invoiceId);
    if (invoiceIndex === -1) {
      return { success: false, message: "Invoice not found. Payment cannot be recorded." };
    }

    const newPayment = {
      _id: "pay" + Date.now(),
      date: Date.now(),
      transactionId: "TXN" + Math.floor(Math.random() * 1000000000),
      ...paymentData
    };
    mockPayments.push(newPayment);

    // Update invoice status (BR-15 partial payments)
    const invoice = mockInvoices[invoiceIndex];
    invoice.paidAmount += parseFloat(paymentData.amount);
    
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = "Paid";
    } else if (invoice.paidAmount > 0) {
      invoice.status = "Partial";
    }

    return { success: true, payment: newPayment };
  }
};
