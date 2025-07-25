const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().iso(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(2).max(100),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().iso(),
}).min(1);

const getTasksQuerySchema = Joi.object({
  status: Joi.string().valid('todo', 'in_progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  sort: Joi.string(),
  limit: Joi.number().integer().min(1).max(100),
  page: Joi.number().integer().min(1),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
};
