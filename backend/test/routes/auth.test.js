const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const buildApp = require('../../src/app');
const { User } = require('../../src/models/user.model');
const request = require('supertest');
const bcrypt = require('bcryptjs');

let mongoServer;
let app;
let server;

// Helper function to get the server URL
const getServerUrl = (fastifyInstance) => {
  const address = fastifyInstance.server.address();
  return `http://${address.address}:${address.port}`;
};

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Initialize Fastify app with test database
    app = buildApp({
      logger: false,
      mongodb: {
        uri: mongoUri,
      },
    });
    
    // Start the server
    server = await app.listen({ port: 0 }); // Use random available port
    appUrl = getServerUrl(app);
  });

  afterAll(async () => {
    // Close the connection and stop MongoDB
    await mongoose.disconnect();
    await mongoServer.stop();
    await app.close();
  });
  
  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
      };

      const response = await request(server)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data).toHaveProperty('token');
    });

    test('should return 400 with invalid email format', async () => {
      const response = await request(server)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!',
          passwordConfirm: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.code).toBe('FST_ERR_VALIDATION');
      expect(response.body.message).toContain('body/email must match format "email"');
    });

    test('should return 400 with weak password', async () => {
      const response = await request(server)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          password: 'weak',
          passwordConfirm: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.code).toBe('FST_ERR_VALIDATION');
      expect(response.body.message).toContain('body/password must match pattern');
    });

    test('should return 400 with mismatched passwords', async () => {
      const response = await request(server)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test3@example.com',
          password: 'Password123!',
          passwordConfirm: 'Different123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.code).toBe('FST_ERR_VALIDATION');
      expect(response.body.message).toContain('body/passwordConfirm must be equal to constant');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const testUser = {
      name: 'Login Test User',
      email: 'login@example.com',
      password: 'Login123!',
    };

    beforeEach(async () => {
      // Create a test user for login tests
      await User.create({
        ...testUser,
        password: await User.encryptPassword(testUser.password),
        passwordConfirm: undefined,
      });
    });

    test('should login with valid credentials', async () => {
      const response = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data).toHaveProperty('token');
    });

    test('should return 400 with invalid email format', async () => {
      const response = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.code).toBe('FST_ERR_VALIDATION');
      expect(response.body.message).toContain('body/email must match format "email"');
    });

    test('should return 400 with missing password', async () => {
      const response = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.code).toBe('FST_ERR_VALIDATION');
      expect(response.body.message).toContain('body must have required property \'password\'');
    });
  });
});
