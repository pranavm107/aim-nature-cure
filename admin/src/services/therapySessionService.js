import apiClient from './apiClient';
import { mockTherapySessions, mockPackages, mockInvoices, mockPayments, mockPatients } from '../mocks/mockData';
import { getStore, setStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const therapySessionService = {
  // Enhanced to support multi-therapy assignment, revenue recording, date, time and user attribution
  assignTherapyPackage: async (patientId, type, itemId, docId, items = [], assignmentDate = null, assignmentTime = null) => {
    await delay();
    
    let generatedSessions = [];
    const therapyItemsToAssign = items.length > 0 ? items : (itemId ? [{ therapyId: itemId, sessions: 1, price: 500 }] : []);
    const assignedDate = assignmentDate || new Date().toISOString().split('T')[0];
    const assignedTime = assignmentTime || (new Date().toTimeString().slice(0, 5) + ':00');
    
    const sessionBase = {
      patientId,
      docId,
      userId: docId,
      scheduledDate: assignedDate,
      scheduledTime: assignedTime,
      sessionDate: assignedDate,
      sessionTime: assignedTime,
      status: 'Pending',
      notes: '',
      date: new Date(`${assignedDate}T${assignedTime.slice(0, 5)}`).getTime() || Date.now()
    };

    let totalRevenue = 0;
    let invoiceItems = [];

    const existingSessions = getStore('mockTherapySessions', mockTherapySessions);

    if (type === 'package') {
      const allPkgs = getStore('mockPackages', mockPackages);
      const pkg = allPkgs.find(p => p._id === itemId || p.uuid === itemId);
      if (!pkg) throw new Error("Package not found");

      totalRevenue = Number(pkg.price) || 0;
      invoiceItems.push({
        type: 'Package',
        description: pkg.name || pkg.packageName || 'Treatment Package',
        amount: totalRevenue
      });

      if (pkg.therapies && Array.isArray(pkg.therapies)) {
        pkg.therapies.forEach(tItem => {
          const count = tItem.count || 1;
          for (let i = 0; i < count; i++) {
            generatedSessions.push({ 
              _id: "sess" + Date.now() + Math.random(), 
              therapyId: tItem.therapyId, 
              ...sessionBase 
            });
          }
        });
      }
    } else if (type === 'therapy') {
      therapyItemsToAssign.forEach(item => {
        const count = Number(item.sessions) || 1;
        const price = Number(item.price) || 0;
        const lineTotal = price * count;
        totalRevenue += lineTotal;

        invoiceItems.push({
          type: 'Therapy',
          description: `${item.name || 'Therapy'} (${count} session${count > 1 ? 's' : ''})`,
          amount: lineTotal
        });

        for (let i = 0; i < count; i++) {
          generatedSessions.push({ 
            _id: "sess" + Date.now() + Math.random(), 
            therapyId: item.therapyId, 
            ...sessionBase 
          });
        }
      });
    }

    existingSessions.push(...generatedSessions);
    setStore('mockTherapySessions', existingSessions);

    // Record invoice and payment for revenue generation
    if (totalRevenue > 0) {
      const allPatients = getStore('mockPatients', mockPatients);
      const patient = allPatients.find(p => p._id === patientId || p.uuid === patientId);
      const effectiveDocId = patient?.assignedDoctor || docId || 'doc1';

      const allInvoices = getStore('mockInvoices', mockInvoices);
      const invoiceId = 'INV' + Date.now();
      const newInvoice = {
        _id: invoiceId,
        patientId,
        docId: effectiveDocId,
        doctorId: effectiveDocId,
        userId: docId,
        date: Date.now(),
        items: invoiceItems,
        subtotal: totalRevenue,
        totalAmount: totalRevenue,
        paidAmount: totalRevenue,
        status: 'Paid',
        dueDate: assignedDate
      };
      allInvoices.push(newInvoice);
      setStore('mockInvoices', allInvoices);

      const allPayments = getStore('mockPayments', mockPayments);
      const newPayment = {
        _id: 'PAY_' + invoiceId,
        invoiceId,
        patientId,
        amount: totalRevenue,
        mode: 'UPI',
        date: Date.now(),
        status: 'COMPLETED',
        transactionId: 'TXN' + Math.floor(Math.random() * 10000000)
      };
      allPayments.push(newPayment);
      setStore('mockPayments', allPayments);
    }

    return { 
      success: true,
      sessions: generatedSessions, 
      totalRevenue,
      message: `Assigned successfully! Generated ${generatedSessions.length} session(s) and recorded ₹${totalRevenue} in paid revenue.` 
    };
  },

  getPatientSessions: async (patientId, userId = null) => {
    return await therapySessionService.getAllSessions(patientId, userId);
  },

  getPatientTherapyHistory: async (patientId, userId = null) => {
    const rawSessions = await therapySessionService.getAllSessions(patientId, userId);
    
    const enrichedSessions = rawSessions.map(s => ({
      ...s,
      therapyName: s.therapyName || 'Therapy',
      duration: s.duration || 45,
      doctorName: s.doctorName || 'Assigned Doctor'
    })).sort((a, b) => (b.date || 0) - (a.date || 0));

    const stats = {
      total: enrichedSessions.length,
      completed: enrichedSessions.filter(s => s.status === 'Completed').length,
      upcoming: enrichedSessions.filter(s => s.status === 'Pending').length,
      cancelled: enrichedSessions.filter(s => s.status === 'Cancelled' || s.status === 'No Show' || s.status === 'Missed').length
    };

    return { success: true, sessions: enrichedSessions, stats };
  },

  /**
   * Fetch sessions with user-based filtering:
   * Each userId sees only their own sessions (unless user is admin).
   */
  getAllSessions: async (patientId = null, userId = null) => {
    const currentUserId = userId || localStorage.getItem('userId') || localStorage.getItem('doctorId');
    const role = (localStorage.getItem('userRole') || '').toLowerCase();
    const isAdmin = role === 'admin';

    let backendSessions = [];
    try {
      const params = { page: 0, size: 100 };
      if (patientId) params.patientId = patientId;
      if (!isAdmin && currentUserId) {
        params.userId = currentUserId;
      }

      const res = await apiClient.get('/therapy-sessions/all', { params });
      const data = res.data;
      const list = Array.isArray(data?.result)
        ? data.result
        : (Array.isArray(data?.content) ? data.content : []);

      backendSessions = list.map(s => ({
        _id: s.uuid || s.id,
        uuid: s.uuid || s.id,
        patientId: s.patientId,
        patientName: s.patientName || '',
        therapyName: s.therapyName || '',
        docId: s.userId || currentUserId || '',
        userId: s.userId || '',
        therapyId: s.therapyId,
        sessionNumber: s.sessionNumber || 1,
        scheduledDate: s.sessionDate || '',
        scheduledTime: s.sessionTime || '',
        sessionDate: s.sessionDate || '',
        sessionTime: s.sessionTime || '',
        status: s.status || 'Pending',
        notes: s.remarks || '',
        date: new Date(s.createdAt || s.sessionDate || Date.now()).getTime()
      }));
    } catch (e) {
      console.warn("Could not fetch backend sessions, using local store:", e);
      const localStore = getStore('mockTherapySessions', mockTherapySessions);
      backendSessions = localStore.map(s => ({
        ...s,
        scheduledTime: s.scheduledTime || s.sessionTime || '',
        sessionTime: s.sessionTime || s.scheduledTime || ''
      }));
    }

    // Client-side user isolation: for non-admins, ensure they only see sessions for their userId
    if (!isAdmin && currentUserId) {
      return backendSessions.filter(s => 
        !s.userId || s.userId === currentUserId || s.docId === currentUserId
      );
    }
    return backendSessions;
  },

  completeSession: async (id, notes) => {
    // Sync with backend PATCH /therapy-sessions/{id}/status
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await apiClient.patch(`/therapy-sessions/${id}/status`, null, {
        params: {
          status: 'Completed',
          remarks: notes || 'Completed successfully',
          date: todayDate
        }
      });
    } catch (e) {
      console.warn("Backend session status patch skipped/failed:", e);
    }

    const sessions = getStore('mockTherapySessions', mockTherapySessions);
    const idx = sessions.findIndex(s => s._id === id);
    if (idx !== -1) {
      sessions[idx].status = 'Completed';
      sessions[idx].notes = notes || '';
      setStore('mockTherapySessions', sessions);
      const { patientService } = await import('./patientService');
      await patientService.incrementSessionCount(sessions[idx].patientId);
      return sessions[idx];
    }
    return { _id: id, status: 'Completed', notes };
  },

  rescheduleSession: async (id, date) => {
    const sessions = getStore('mockTherapySessions', mockTherapySessions);
    const idx = sessions.findIndex(s => s._id === id);
    if (idx !== -1) {
      sessions[idx].scheduledDate = date;
      sessions[idx].sessionDate = date;
      setStore('mockTherapySessions', sessions);
      return sessions[idx];
    }
    return { _id: id, scheduledDate: date };
  },

  markSessionMissed: async (id, notes) => {
    // Sync with backend PATCH /therapy-sessions/{id}/status
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await apiClient.patch(`/therapy-sessions/${id}/status`, null, {
        params: {
          status: 'Missed',
          remarks: notes || 'Missed session',
          date: todayDate
        }
      });
    } catch (e) {
      console.warn("Backend session status patch skipped/failed:", e);
    }

    const sessions = getStore('mockTherapySessions', mockTherapySessions);
    const idx = sessions.findIndex(s => s._id === id);
    if (idx !== -1) {
      sessions[idx].status = 'Missed';
      sessions[idx].notes = notes || '';
      setStore('mockTherapySessions', sessions);
      return sessions[idx];
    }
    return { _id: id, status: 'Missed', notes };
  }
};

export default therapySessionService;
