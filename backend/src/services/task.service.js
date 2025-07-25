const Task = require('../models/task.model');
const AppError = require('../utils/appError');

const createTask = async (taskData, userId) => {
  const task = await Task.create({
    ...taskData,
    user: userId,
  });

  return task;
};

const getAllTasks = async (userId, filters = {}) => {
  const { status, priority, sort, limit = 10, page = 1 } = filters;
  
  // Build query
  const query = { user: userId };
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  
  // Execute query with pagination
  const tasks = await Task.find(query)
    .sort(sort || '-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
  // Count total documents for pagination
  const total = await Task.countDocuments(query);
  
  return {
    results: tasks.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: tasks,
  };
};

const getTask = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  
  if (!task) {
    throw new AppError('No task found with that ID', 404);
  }
  
  return task;
};

const updateTask = async (taskId, updateData, userId) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    throw new AppError('No task found with that ID', 404);
  }

  return task;
};

const deleteTask = async (taskId, userId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  
  if (!task) {
    throw new AppError('No task found with that ID', 404);
  }
  
  return task;
};

module.exports = {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
};
