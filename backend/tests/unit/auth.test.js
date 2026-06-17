jest.mock('bcrypt', () => {
  return {
    hash: (val) => Promise.resolve(`$2b$10$mocked_hash_${val}`),
    compare: (val, hash) => Promise.resolve(hash === `$2b$10$mocked_hash_${val}` || hash === val)
  };
});

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const jwt = require('jsonwebtoken');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Organization.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new doctor with valid data', async () => {
      const doctorData = {
        name: 'Dr. John Doe',
        orgName: 'Doe Cardiology Clinic',
        industry: 'healthcare',
        email: 'john.doe@example.com',
        password: 'SecurePass123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(doctorData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Signup successful');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', doctorData.name);
      expect(response.body.user).toHaveProperty('email', doctorData.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const user = await User.findOne({ email: doctorData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(doctorData.name);
    });

    it('should fail with duplicate email', async () => {
      const doctorData = {
        name: 'Dr. Jane Smith',
        orgName: 'Smith Neurology Clinic',
        industry: 'healthcare',
        email: 'jane.smith@example.com',
        password: 'SecurePass456'
      };

      // Create first user
      await request(app)
        .post('/api/auth/signup')
        .send(doctorData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/signup')
        .send(doctorData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email already exists');
    });

    it('should fail with invalid email format', async () => {
      const doctorData = {
        name: 'Dr. Invalid Email',
        orgName: 'Pediatrics Clinic',
        industry: 'healthcare',
        email: 'invalid-email',
        password: 'SecurePass789'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(doctorData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should fail with weak password', async () => {
      const doctorData = {
        name: 'Dr. Weak Password',
        orgName: 'Dermatology Clinic',
        industry: 'healthcare',
        email: 'weak.pass@example.com',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(doctorData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const incompleteData = {
        name: 'Dr. Incomplete',
        email: 'incomplete@example.com'
        // Missing orgName, industry, and password
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should hash the password before saving', async () => {
      const doctorData = {
        name: 'Dr. Hash Test',
        orgName: 'Oncology Clinic',
        industry: 'healthcare',
        email: 'hash.test@example.com',
        password: 'TestPassword123'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(doctorData);

      const user = await User.findOne({ email: doctorData.email });
      expect(user.password).not.toBe(doctorData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // Bcrypt hash pattern
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Dr. Login Test',
          orgName: 'Login Test Clinic',
          industry: 'healthcare',
          email: 'login.test@example.com',
          password: 'TestLogin123'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@example.com',
          password: 'TestLogin123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', 'Dr. Login Test');

      // Check if JWT token cookie is set
      expect(response.headers['set-cookie']).toBeDefined();
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toContain('token=');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@example.com',
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'SomePassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@example.com',
          password: 'TestLogin123'
        });

      const cookieHeader = response.headers['set-cookie'][0];
      const token = cookieHeader.split('token=')[1].split(';')[0];

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('exp');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear authentication cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');

      // Check if cookie is cleared
      const cookieHeader = response.headers['set-cookie'];
      if (cookieHeader) {
        expect(cookieHeader[0]).toContain('token=');
      }
    });

    it('should work even without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });
});
