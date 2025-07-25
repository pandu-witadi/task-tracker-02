const taskService = require('../services/task.service');
const AppError = require('../utils/appError');

const getAllTasks = async (request, reply) => {
  const { status, priority, sort, limit, page } = request.query;
  const userId = request.user._id;
  
  const tasks = await taskService.getAllTasks(userId, {
    status,
    priority,
    sort,
    limit: parseInt(limit, 10),
    page: parseInt(page, 10) || 1,
  });
  
  return {
    status: 'success',
    results: tasks.results,
    data: {
      tasks: tasks.data,
    },
    pagination: {
      total: tasks.total,
      totalPages: tasks.totalPages,
      currentPage: tasks.currentPage,
    },
  };
};

const getTask = async (request, reply) => {
  const task = await taskService.getTask(request.params.id, request.user._id);
  
  return {
    status: 'success',
    data: {
      task,
    },
  };
};

const createTask = async (request, reply) => {
  const newTask = await taskService.createTask(
    request.body,
    request.user._id
  );
  
  reply.status(201);
  
  return {
    status: 'success',
    data: {
      task: newTask,
    },
  };
};

const updateTask = async (request, reply) => {
  const task = await taskService.updateTask(
    request.params.id,
    request.body,
    request.user._id
  );
  
  return {
    status: 'success',
    data: {
      task,
    },
  };
};

const deleteTask = async (request, reply) => {
  await taskService.deleteTask(request.params.id, request.user._id);
  
  return {
    status: 'success',
    data: null,
  };
};

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
