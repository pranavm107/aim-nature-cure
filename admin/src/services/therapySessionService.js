import { mockTherapySessions, mockPackages, mockTherapies, mockDoctors } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const therapySessionService = {
  assignToPatient: async (patientId, assignmentData) => {
    await delay();
    const { type, itemId, assignedDocId } = assignmentData;
    const docId = assignedDocId || 'doc1';
    
    let generatedSessions = [];
    const sessionBase = { 
      patientId, 
      docId, 
      scheduledDate: new Date().toISOString().split('T')[0], 
      status: 'Pending', 
      notes: '', 
      date: Date.now() 
    };
    
    // FR-050 Fix: Check for duplicate assignment
    // (A patient shouldn't be assigned the same therapy/package twice while one is pending)
    if (type === 'package') {
      const pkg = mockPackages.find(p => p._id === itemId);
      if (!pkg) throw new Error("Package not found");

      // Simple deduplication: Check if there are already pending sessions for this patient from this package
      // In a real DB, patientPackage model tracks this, but here we check therapy matching
      const hasPendingForPackage = mockTherapySessions.some(s => 
        s.patientId === patientId && s.status === 'Pending' && pkg.therapies.some(t => t.therapyId === s.therapyId)
      );

      if (hasPendingForPackage) {
        throw new Error("Patient already has pending sessions from this package or identical therapies.");
      }

      pkg.therapies.forEach(tItem => {
        for(let i = 0; i < tItem.count; i++) {
          generatedSessions.push({ 
            _id: "sess" + Date.now() + Math.random(), 
            therapyId: tItem.therapyId, 
            ...sessionBase 
          });
        }
      });
    } else if (type === 'therapy') {
      const hasPendingTherapy = mockTherapySessions.some(s => 
        s.patientId === patientId && s.status === 'Pending' && s.therapyId === itemId
      );

      if (hasPendingTherapy) {
        throw new Error("Patient already has a pending session for this therapy.");
      }

      generatedSessions.push({ 
        _id: "sess" + Date.now(), 
        therapyId: itemId, 
        ...sessionBase 
      });
    }

    mockTherapySessions.push(...generatedSessions);
    return { 
      sessions: generatedSessions, 
      message: `Assigned successfully. Generated ${generatedSessions.length} sessions.` 
    };
  },

  getPatientSessions: async (patientId) => {
    await delay();
    const sessions = mockTherapySessions.filter(s => s.patientId === patientId);
    return sessions;
  },

  getPatientTherapyHistory: async (patientId) => {
    await delay();
    const rawSessions = mockTherapySessions.filter(s => s.patientId === patientId);
    
    // Enrich with therapy and doctor details
    const enrichedSessions = rawSessions.map(s => {
      const therapy = mockTherapies.find(t => t._id === s.therapyId);
      const doc = mockDoctors.find(d => d._id === s.docId);
      return {
        ...s,
        therapyName: therapy ? therapy.name : 'Unknown Therapy',
        duration: therapy ? therapy.duration : 0,
        doctorName: doc ? doc.name : 'Unknown Doctor'
      };
    }).sort((a, b) => b.date - a.date);

    // Compute stats
    const stats = {
      total: enrichedSessions.length,
      completed: enrichedSessions.filter(s => s.status === 'Completed').length,
      upcoming: enrichedSessions.filter(s => s.status === 'Pending').length,
      cancelled: enrichedSessions.filter(s => s.status === 'Cancelled' || s.status === 'No Show').length
    };

    return { success: true, sessions: enrichedSessions, stats };
  },

  getAllSessions: async () => {
    await delay();
    const role = localStorage.getItem('userRole');
    const docId = 'doc1';
    
    if (role === 'doctor') {
       return mockTherapySessions.filter(s => s.docId === docId);
    }
    return mockTherapySessions;
  },

  completeSession: async (id, notes) => {
    await delay();
    const idx = mockTherapySessions.findIndex(s => s._id === id);
    if (idx === -1) throw new Error("Session not found");
    
    mockTherapySessions[idx].status = 'Completed';
    mockTherapySessions[idx].notes = notes || '';
    
    return mockTherapySessions[idx];
  },

  rescheduleSession: async (id, date) => {
    await delay();
    const idx = mockTherapySessions.findIndex(s => s._id === id);
    if (idx === -1) throw new Error("Session not found");
    
    mockTherapySessions[idx].scheduledDate = date;
    
    return mockTherapySessions[idx];
  },

  markSessionMissed: async (id, notes) => {
    await delay();
    const idx = mockTherapySessions.findIndex(s => s._id === id);
    if (idx === -1) throw new Error("Session not found");
    
    mockTherapySessions[idx].status = 'Missed';
    mockTherapySessions[idx].notes = notes || '';
    
    return mockTherapySessions[idx];
  }
};

export default therapySessionService;
