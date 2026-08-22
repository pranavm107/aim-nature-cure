const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const mockNotes = [
  { _id: 'n1', docId: 'doc1', title: 'Hydrotherapy Research', content: 'Look into new temperatures for standard sessions.', date: Date.now() - 86400000 },
  { _id: 'n2', docId: 'doc1', title: 'Personal Todo', content: 'Call clinic admin regarding schedule.', date: Date.now() }
];

export const noteService = {
  getNotes: async (docId) => {
    await delay();
    return { success: true, notes: mockNotes.filter(n => n.docId === docId) };
  },

  createNote: async (data) => {
    await delay();
    const newNote = {
      _id: 'n' + Date.now(),
      date: Date.now(),
      ...data
    };
    mockNotes.push(newNote);
    return { success: true, note: newNote };
  },

  deleteNote: async (id) => {
    await delay();
    const idx = mockNotes.findIndex(n => n._id === id);
    if (idx > -1) mockNotes.splice(idx, 1);
    return { success: true };
  }
};
