const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

import { mockDoctorNotes as mockNotes } from '../mocks/mockData';

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
