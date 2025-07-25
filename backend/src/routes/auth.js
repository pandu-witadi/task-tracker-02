const { register, login, protect, restrictTo } = require('../controllers/auth.controller');

// Register schema
const registerSchema = {
  type: 'object',
  required: ['name', 'email', 'password', 'passwordConfirm'],
  properties: {
    name: { 
      type: 'string',
      minLength: 2,
      maxLength: 50,
      description: 'User\'s full name (2-50 characters)'
    },
    email: { 
      type: 'string',
      format: 'email',
      description: 'User\'s email address'
    },
    password: {
      type: 'string',
      // minLength: 8,
      // pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
      // description: 'Password (min 8 chars, must include uppercase, lowercase, number, and special character)'
    },
    passwordConfirm: {
      type: 'string',
      description: 'Must match the password field'
    }
  },
  additionalProperties: false
};

// Custom validator for password confirmation
function validatePasswordConfirmation(request, reply, done) {
  if (request.body.password !== request.body.passwordConfirm) {
    reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Passwords do not match'
    });
    return;
  }
  done();
}

// Login schema
const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { 
      type: 'string',
      format: 'email',
      description: 'User\'s email address'
    },
    password: {
      type: 'string',
      minLength: 1,
      description: 'User\'s password'
    }
  },
  additionalProperties: false
};

async function authRoutes(fastify, options) {
  fastify.route({
    method: 'POST',
    url: '/register',
    preHandler: [validatePasswordConfirmation],
    schema: {
      description: 'Register a new user',
      body: registerSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            token: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                  },
                },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Validation error' },
            errors: { type: 'object' },
          },
        },
      },
    },
    handler: register,
  });

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: {
      description: 'Login user',
      body: loginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            token: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                  },
                },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Invalid email or password' },
          },
        },
        401: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Please provide email and password' },
          },
        },
      },
    },
    handler: login,
  });

  // Protected route example
  fastify.get(
    '/me',
    {
      preHandler: [protect],
      schema: {
        tags: ['auth'],
        description: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string', enum: ['user', 'admin'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return {
        status: 'success',
        data: {
          user: request.user,
        },
      };
    }
  );
}

module.exports = authRoutes;
