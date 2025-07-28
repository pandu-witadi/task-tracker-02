import api from './api';

const taskApi = {
  // Get all tasks with optional query parameters
  getTasks: async (params = {}) => {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single task by ID
  getTask: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update an existing task
  updateTask: async (id, taskData) => {
    try {
      const response = await api.patch(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a task
  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update task status
  updateTaskStatus: async (id, status) => {
    try {
      const response = await api.patch(`/tasks/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default taskApi;
