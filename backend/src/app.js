// 
// 
const path = require('path');

const fastifyCors = require('@fastify/cors');
const fastifySwagger = require('@fastify/swagger');
const fastifySwaggerUi = require('@fastify/swagger-ui');

const app = require('fastify')({ 
    logger: true,
    ajv: {
        customOptions: {
            removeAdditional: 'all',
            coerceTypes: true,
            useDefaults: true,
        },
    },
});


// Load environment variables
require('dotenv').config();

const ORIGIN = process.env.NODE_ENV === 'development' ? true : ['http://localhost:5173']
const CREDENTIALS = process.env.NODE_ENV === 'development' ? true : false
const API_URL = process.env.NODE_ENV === 'development' ? ('localhost' + ':' + process.env.PORT.toString() ) : (process.env.HOST.toString() + ':' + process.env.PORT.toString() )


// Register plugins
app.register(fastifyCors, {
    origin: ORIGIN,
    credentials: CREDENTIALS,
});


// Swagger documentation
app.register(fastifySwagger, {
    routePrefix: '/documentation',
    swagger: {
        info: {
            title: 'Task Tracker API',
            description: 'API documentation for Task Tracker application',
            version: '1.0.0',
        },
        host: API_URL,
        schemes: [process.env.NODE_ENV === 'production' ? 'https' : 'http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        securityDefinitions: {
            bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        definitions: {
            Task: {
                type: 'object',
                required: ['title'],
                properties: {
                    _id: { type: 'string', format: 'uuid' },
                    title: { type: 'string', minLength: 2, maxLength: 100 },
                    description: { type: 'string', maxLength: 1000 },
                    status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    dueDate: { type: 'string', format: 'date-time' },
                    user: { type: 'string', format: 'uuid' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    },
    exposeRoute: true,
});

app.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
    },
    uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
});

// // Register routes
app.register(require('./routes/health'), { prefix: '/api/health' });
app.register(require('./routes/auth'), { prefix: '/api/v1/auth' });
app.register(require('./routes/tasks'), { prefix: '/api/v1/tasks' });

// Root route
// app.get('/', async (request, reply) => {
//   return { 
//     name: 'Task Tracker API',
//     version: '1.0.0',
//     documentation: '/documentation',
//     environment: process.env.NODE_ENV || 'development',
//   };
// });

// Set up error handling
app.setErrorHandler(require('./utils/errorHandler'));

// Handle 404
app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ 
        status: 'error',
        message: `Route ${request.method}:${request.url} not found`,
    });
});


module.exports = app