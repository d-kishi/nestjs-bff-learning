/**
 * Auth E2Eテスト
 *
 * US013: 認証機能のE2Eテスト
 * nockでuser-serviceをモック
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import nock from 'nock';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const USER_SERVICE_URL = 'http://localhost:3002';
  const JWT_SECRET = 'dev-secret-key';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    nock.cleanAll();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  /**
   * JWTトークン生成ヘルパー
   */
  function generateToken(payload: {
    sub: number;
    email: string;
    roles: string[];
  }) {
    return jwt.sign(
      { ...payload, iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: '1h' },
    );
  }

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      nock(USER_SERVICE_URL)
        .post('/auth/register', registerDto)
        .reply(201, {
          data: {
            user: { id: 1, email: 'test@example.com' },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.data).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      nock(USER_SERVICE_URL)
        .post('/auth/register', registerDto)
        .reply(409, {
          error: {
            code: 'USER_AUTH_EMAIL_EXISTS',
            message: 'Email already exists',
          },
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(409);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      nock(USER_SERVICE_URL)
        .post('/auth/login', loginDto)
        .reply(200, {
          data: {
            user: { id: 1, email: 'test@example.com' },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      nock(USER_SERVICE_URL)
        .post('/auth/login', loginDto)
        .reply(401, {
          error: {
            code: 'USER_AUTH_INVALID_CREDENTIALS',
            message: 'Invalid credentials',
          },
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshDto = { refreshToken: 'valid-refresh-token' };

      nock(USER_SERVICE_URL)
        .post('/auth/refresh', refreshDto)
        .reply(200, {
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send(refreshDto)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should return 401 for invalid refresh token', async () => {
      const refreshDto = { refreshToken: 'invalid-token' };

      nock(USER_SERVICE_URL)
        .post('/auth/refresh', refreshDto)
        .reply(401, {
          error: {
            code: 'USER_AUTH_INVALID_TOKEN',
            message: 'Invalid refresh token',
          },
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send(refreshDto)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const token = generateToken({
        sub: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      });
      const logoutDto = { refreshToken: 'valid-refresh-token' };

      nock(USER_SERVICE_URL)
        .post('/auth/logout', logoutDto)
        .matchHeader('x-user-id', '1')
        .reply(200, { message: 'Logged out successfully' });

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send(logoutDto)
        .expect(200);
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .send({ refreshToken: 'token' })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info with valid token', async () => {
      const token = generateToken({
        sub: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      });

      nock(USER_SERVICE_URL)
        .get('/auth/me')
        .matchHeader('x-user-id', '1')
        .reply(200, {
          data: {
            id: 1,
            email: 'test@example.com',
            profile: { displayName: 'Test User' },
          },
        });

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwt.sign(
        { sub: 1, email: 'test@example.com', roles: ['MEMBER'], iat: 0 },
        JWT_SECRET,
        { expiresIn: '-1h' },
      );

      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
