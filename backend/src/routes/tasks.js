const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../controllers/auth.controller');
const {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
} = require('../validations/task.validation');

async function taskRoutes(fastify, options) {
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
