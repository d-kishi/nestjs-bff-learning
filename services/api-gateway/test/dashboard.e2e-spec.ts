/**
 * Dashboard E2Eテスト
 *
 * US014: ダッシュボード機能のE2Eテスト
 * nockでuser-service, task-serviceをモック
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import nock from 'nock';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';

describe('Dashboard (e2e)', () => {
  let app: INestApplication<App>;
  const USER_SERVICE_URL = 'http://localhost:3002';
  const TASK_SERVICE_URL = 'http://localhost:3001';
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

  describe('GET /api/dashboard', () => {
    it('should return aggregated dashboard data when all services succeed', async () => {
      const token = generateToken({
        sub: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      });

      // user-service mock
      nock(USER_SERVICE_URL)
        .get('/users/1')
        .matchHeader('x-user-id', '1')
        .reply(200, {
          data: {
            id: 1,
            email: 'test@example.com',
            profile: { displayName: 'Test User', avatarUrl: null },
          },
        });

      // task-service tasks mock
      nock(TASK_SERVICE_URL)
        .get('/tasks')
        .query({ assigneeId: 1 })
        .matchHeader('x-user-id', '1')
        .reply(200, {
          data: [
            {
              id: 1,
              title: 'Task 1',
              status: 'TODO',
              priority: 'HIGH',
              projectId: 1,
              project: { name: 'P1' },
              updatedAt: '2025-01-15T10:00:00Z',
            },
            {
              id: 2,
              title: 'Task 2',
              status: 'IN_PROGRESS',
              priority: 'MEDIUM',
              projectId: 1,
              project: { name: 'P1' },
              updatedAt: '2025-01-14T10:00:00Z',
            },
            {
              id: 3,
              title: 'Task 3',
              status: 'DONE',
              priority: 'LOW',
              projectId: 2,
              project: { name: 'P2' },
              updatedAt: '2025-01-13T10:00:00Z',
            },
          ],
          meta: { total: 3 },
        });

      // task-service projects mock
      nock(TASK_SERVICE_URL)
        .get('/projects')
        .query({ ownerId: 1 })
        .matchHeader('x-user-id', '1')
        .reply(200, {
          data: [
            { id: 1, name: 'Project 1', ownerId: 1 },
            { id: 2, name: 'Project 2', ownerId: 1 },
          ],
          meta: { total: 2 },
        });

      const response = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.taskSummary).toEqual({
        total: 3,
        todo: 1,
        inProgress: 1,
        done: 1,
      });
      expect(response.body.data.projectSummary).toEqual({ total: 2, owned: 2 });
      expect(response.body.data.recentTasks).toHaveLength(3);
      expect(response.body.data._errors).toBeUndefined();
    });

    it('should return partial data with _errors when user-service fails', async () => {
      const token = generateToken({
        sub: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      });

      // user-service fails
      nock(USER_SERVICE_URL)
        .get('/users/1')
        .matchHeader('x-user-id', '1')
        .replyWithError('Connection refused');

      // task-service succeeds
      nock(TASK_SERVICE_URL)
        .get('/tasks')
        .query({ assigneeId: 1 })
        .reply(200, { data: [{ id: 1, status: 'TODO' }], meta: { total: 1 } });

      nock(TASK_SERVICE_URL)
        .get('/projects')
        .query({ ownerId: 1 })
        .reply(200, { data: [{ id: 1, ownerId: 1 }], meta: { total: 1 } });

      const response = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.user).toBeNull();
      expect(response.body.data.taskSummary.total).toBe(1);
      expect(response.body.data.projectSummary.total).toBe(1);
      expect(response.body.data._errors).toContain('user-service unavailable');
    });

    it('should return partial data with _errors when task-service fails', async () => {
      const token = generateToken({
        sub: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      });

      // user-service succeeds
      nock(USER_SERVICE_URL)
        .get('/users/1')
        .matchHeader('x-user-id', '1')
        .reply(200, {
          data: {
            id: 1,
            email: 'test@example.com',
            profile: { displayName: 'Test' },
          },
        });

      // task-service fails
      nock(TASK_SERVICE_URL)
        .get('/tasks')
        .query({ assigneeId: 1 })
        .replyWithError('Connection refused');

      nock(TASK_SERVICE_URL)
        .get('/projects')
        .query({ ownerId: 1 })
        .replyWithError('Connection refused');

      const response = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.user).not.toBeNull();
      expect(response.body.data.taskSummary).toEqual({
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
      });
      expect(response.body.data.projectSummary).toEqual({ total: 0, owned: 0 });
      expect(response.body.data._errors).toContain('task-service unavailable');
    });

    it('should return HTTP 200 even when all services fail', async () => {
      const token = generateToken({
        sub: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      });

      // All services fail
      nock(USER_SERVICE_URL)
        .get('/users/1')
        .replyWithError('Connection refused');

      nock(TASK_SERVICE_URL)
        .get('/tasks')
        .query({ assigneeId: 1 })
        .replyWithError('Connection refused');

      nock(TASK_SERVICE_URL)
        .get('/projects')
        .query({ ownerId: 1 })
        .replyWithError('Connection refused');

      const response = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.user).toBeNull();
      expect(response.body.data.taskSummary).toEqual({
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
      });
      expect(response.body.data._errors).toContain('user-service unavailable');
      expect(response.body.data._errors).toContain('task-service unavailable');
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer()).get('/api/dashboard').expect(401);
    });

    it('should deduplicate errors in _errors array', async () => {
      const token = generateToken({
        sub: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      });

      // user-service succeeds
      nock(USER_SERVICE_URL)
        .get('/users/1')
        .reply(200, {
          data: { id: 1, email: 'test@example.com', profile: {} },
        });

      // task-service fails twice (tasks and projects)
      nock(TASK_SERVICE_URL)
        .get('/tasks')
        .query({ assigneeId: 1 })
        .replyWithError('Connection refused');

      nock(TASK_SERVICE_URL)
        .get('/projects')
        .query({ ownerId: 1 })
        .replyWithError('Connection refused');

      const response = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Error should appear only once
      const taskServiceErrors = response.body.data._errors.filter(
        (e: string) => e === 'task-service unavailable',
      );
      expect(taskServiceErrors.length).toBe(1);
    });

    it('should return recentTasks sorted by updatedAt descending', async () => {
      const token = generateToken({
        sub: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      });

      nock(USER_SERVICE_URL)
        .get('/users/1')
        .reply(200, {
          data: { id: 1, email: 'test@example.com', profile: {} },
        });

      nock(TASK_SERVICE_URL)
        .get('/tasks')
        .query({ assigneeId: 1 })
        .reply(200, {
          data: [
            {
              id: 1,
              title: 'Old',
              status: 'TODO',
              priority: 'LOW',
              projectId: 1,
              project: { name: 'P' },
              updatedAt: '2025-01-01T10:00:00Z',
            },
            {
              id: 2,
              title: 'New',
              status: 'TODO',
              priority: 'LOW',
              projectId: 1,
              project: { name: 'P' },
              updatedAt: '2025-01-15T10:00:00Z',
            },
            {
              id: 3,
              title: 'Mid',
              status: 'TODO',
              priority: 'LOW',
              projectId: 1,
              project: { name: 'P' },
              updatedAt: '2025-01-10T10:00:00Z',
            },
          ],
          meta: { total: 3 },
        });

      nock(TASK_SERVICE_URL)
        .get('/projects')
        .query({ ownerId: 1 })
        .reply(200, { data: [], meta: { total: 0 } });

      const response = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.recentTasks[0].title).toBe('New');
      expect(response.body.data.recentTasks[1].title).toBe('Mid');
      expect(response.body.data.recentTasks[2].title).toBe('Old');
    });
  });
});
