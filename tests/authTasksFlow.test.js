const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;

beforeAll(async () => {
  // Ensure JWT secret exists for auth controller during tests
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret';
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

describe('Auth and Tasks flow', () => {
  it('registers, logs in, and performs full task CRUD flow', async () => {
    // Register
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty('token');

    // Login
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');

    const token = loginRes.body.token;

    // Create Task
    const createTaskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'Test description',
        priority: 'High',
        status: 'Pending',
      });

    expect(createTaskRes.statusCode).toBe(201);
    expect(createTaskRes.body).toHaveProperty('task');
    const taskId = createTaskRes.body.task._id;

    // Get all tasks
    const getTasksRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(getTasksRes.statusCode).toBe(200);
    expect(Array.isArray(getTasksRes.body.tasks)).toBe(true);
    expect(getTasksRes.body.tasks.length).toBe(1);

    // Update task
    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Task',
        description: 'Updated description',
        priority: 'Medium',
        status: 'In Progress',
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.task.title).toBe('Updated Task');
    expect(updateRes.body.task.status).toBe('In Progress');

    // Delete task
    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);

    // Ensure no tasks remain
    const getTasksAfterDelete = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(getTasksAfterDelete.statusCode).toBe(200);
    expect(getTasksAfterDelete.body.tasks.length).toBe(0);
  });
});


