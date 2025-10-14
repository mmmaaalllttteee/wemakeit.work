import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      const email = `test-${Date.now()}@example.com`;

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Test123!@#',
          name: 'Test User',
          orgName: 'Test Organization',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('user');
          expect(response.body).toHaveProperty('tokens');
          expect(response.body.user.email).toBe(email);
          userId = response.body.user.id;
        });
    });

    it('should reject registration with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
          orgName: 'Test Organization',
        })
        .expect(400);
    });

    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!@#',
          name: 'Test User',
          orgName: 'Test Organization',
        })
        .expect(400);
    });

    it('should reject duplicate email registration', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Test123!@#',
          name: 'Test User',
          orgName: 'Test Organization',
        })
        .expect(201);

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Test123!@#',
          name: 'Test User 2',
          orgName: 'Test Organization 2',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';

    beforeAll(async () => {
      // Create test user
      await request(app.getHttpServer()).post('/auth/register').send({
        email: testEmail,
        password: testPassword,
        name: 'Login Test User',
        orgName: 'Login Test Org',
      });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('tokens');
          expect(response.body.tokens).toHaveProperty('accessToken');
          expect(response.body.tokens).toHaveProperty('refreshToken');
          authToken = response.body.tokens.accessToken;
        });
    });

    it('should reject login with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should get current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('email');
          expect(response.body).toHaveProperty('id');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `refresh-test-${Date.now()}@example.com`,
          password: 'Test123!@#',
        });

      refreshToken = response.body.tokens.refreshToken;
    });

    it('should refresh tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('accessToken');
          expect(response.body).toHaveProperty('refreshToken');
        });
    });

    it('should reject refresh with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Password Reset Flow', () => {
    const resetEmail = `reset-${Date.now()}@example.com`;

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: resetEmail,
        password: 'Test123!@#',
        name: 'Reset Test User',
        orgName: 'Reset Test Org',
      });
    });

    it('should request password reset', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: resetEmail })
        .expect(200);
    });

    it('should accept non-existent email for security', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
    });
  });
});
