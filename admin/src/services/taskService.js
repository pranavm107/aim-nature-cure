import { mockTasks } from '../mocks/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  getTasks: async (docId) => {
    await delay();
    return { success: true, tasks: mockTasks.filter(t => t.docId === docId) };
  },

  createTask: async (data) => {
    await delay();
    const newTask = {
      _id: 't' + Date.now(),
      date: Date.now(),
      status: 'Pending',
      ...data
    };
    mockTasks.push(newTask);
    return { success: true, task: newTask };
  },

  updateTaskStatus: async (id, status) => {
    await delay();
    const idx = mockTasks.findIndex(t => t._id === id);
    if (idx > -1) mockTasks[idx].status = status;
    return { success: true };
  }
};
