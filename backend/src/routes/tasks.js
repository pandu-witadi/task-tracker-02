const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../controllers/auth.controller');

// Task schemas
const taskSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string', format: 'uuid' },
        title: { 
            type: 'string',
            minLength: 2,
            maxLength: 100,
            description: 'Title of the task (2-100 characters)'
        },
    description: {
      type: 'string',
      maxLength: 1000,
      description: 'Detailed description of the task (max 1000 characters)'
    },
    status: {
      type: 'string',
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
      description: 'Current status of the task'
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      description: 'Priority level of the task'
    },
    dueDate: {
      type: 'string',
      format: 'date-time',
      description: 'Due date of the task in ISO format'
    },
    user: {
      type: 'string',
      format: 'uuid',
      description: 'ID of the user who owns the task'
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

// Schema for creating a new task
const createTaskSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { 
      type: 'string',
      minLength: 2,
      maxLength: 100,
      description: 'Title of the task (2-100 characters)'
    },
    description: {
      type: 'string',
      maxLength: 1000,
      description: 'Detailed description of the task (max 1000 characters)'
    },
    status: {
      type: 'string',
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
      description: 'Initial status of the task'
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      description: 'Priority level of the task'
    },
    dueDate: {
      type: 'string',
      format: 'date-time',
      description: 'Due date of the task in ISO format'
    }
  },
  additionalProperties: false
};

// Schema for updating a task
const updateTaskSchema = {
  type: 'object',
  minProperties: 1, // At least one property must be provided
  properties: {
    title: { 
      type: 'string',
      minLength: 2,
      maxLength: 100,
      description: 'Updated title of the task (2-100 characters)'
    },
    description: {
      type: 'string',
      maxLength: 1000,
      description: 'Updated description of the task (max 1000 characters)'
    },
    status: {
      type: 'string',
      enum: ['todo', 'in_progress', 'done'],
      description: 'Updated status of the task'
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      description: 'Updated priority level of the task'
    },
    dueDate: {
      type: 'string',
      format: 'date-time',
      description: 'Updated due date of the task in ISO format'
    }
  },
  additionalProperties: false
};

// Schema for query parameters when getting tasks
const getTasksQuerySchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['todo', 'in_progress', 'done'],
      description: 'Filter tasks by status'
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      description: 'Filter tasks by priority'
    },
    sort: {
      type: 'string',
      description: 'Sort field and direction (e.g., "-createdAt" for newest first)'
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 10,
      description: 'Maximum number of tasks to return (1-100)'
    },
    page: {
      type: 'integer',
      minimum: 1,
      default: 1,
      description: 'Page number for pagination (1-based)'
    }
  },
  additionalProperties: false
};

async function taskRoutes(fastify, options) {
  // Add schema to Fastify instance for reference
  fastify.addSchema({
    $id: 'taskSchema',
    ...taskSchema
  });

  // Apply auth middleware to all task routes
  fastify.addHook('onRequest', protect);

  // Get all tasks
  fastify.get(
    '/',
    {
      schema: {
        tags: ['tasks'],
        description: 'Get all tasks for the authenticated user',
        security: [{ bearerAuth: [] }],
        querystring: getTasksQuerySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              results: { type: 'number', example: 5 },
              data: {
                type: 'object',
                properties: {
                  tasks: {
                    type: 'array',
                    items: {
                      $ref: 'taskSchema#',
                    },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 25 },
                  totalPages: { type: 'number', example: 5 },
                  currentPage: { type: 'number', example: 1 },
                },
              },
            },
          },
        },
      },
    },
    getAllTasks
  );

  // Get a single task
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['tasks'],
        description: 'Get a single task by ID',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', description: 'Task ID' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              data: {
                type: 'object',
                properties: {
                  task: {
                    $ref: 'taskSchema#',
                  },
                },
              },
            },
          },
        },
      },
    },
    getTask
  );

  // Create a new task
  fastify.post(
    '/',
    {
      schema: {
        body: createTaskSchema,
        tags: ['tasks'],
        description: 'Create a new task',
        security: [{ bearerAuth: [] }],
        response: {
          201: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              data: {
                type: 'object',
                properties: {
                  task: {
                    $ref: 'taskSchema#',
                  },
                },
              },
            },
          },
        },
      },
    },
    createTask
  );

  // Update a task
  fastify.patch(
    '/:id',
    {
      schema: {
        body: updateTaskSchema,
        tags: ['tasks'],
        description: 'Update a task by ID',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', description: 'Task ID' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              data: {
                type: 'object',
                properties: {
                  task: {
                    $ref: 'taskSchema#',
                  },
                },
              },
            },
          },
        },
      },
    },
    updateTask
  );

  // Delete a task
  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['tasks'],
        description: 'Delete a task by ID',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', description: 'Task ID' },
          },
        },
        response: {
          204: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              data: { type: 'null' },
            },
          },
        },
      },
    },
    deleteTask
  );
}

module.exports = taskRoutes;
