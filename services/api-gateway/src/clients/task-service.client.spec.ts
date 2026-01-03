/**
 * TaskServiceClientのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError, AxiosHeaders } from 'axios';
import { TaskServiceClient } from './task-service.client';
import {
  BffServiceUnavailableException,
  BffTimeoutException,
} from '../common/exceptions/bff.exception';

describe('TaskServiceClient', () => {
  let client: TaskServiceClient;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskServiceClient,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: string) => {
              if (key === 'TASK_SERVICE_URL') return 'http://localhost:3001';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    client = module.get<TaskServiceClient>(TaskServiceClient);
    httpService = module.get(HttpService);
  });

  const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

  describe('getProjects', () => {
    it('should call task-service and return response', async () => {
      const userId = 1;
      const roles = ['MEMBER'];
      const query = { page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, name: 'Project A' }],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          timestamp: new Date().toISOString(),
        },
      };
      httpService.get.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.getProjects(userId, roles, query);

      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3001/projects',
        {
          headers: { 'X-User-Id': '1', 'X-User-Roles': 'MEMBER' },
          params: query,
        },
      );
    });

    it('should throw BffTimeoutException on timeout', async () => {
      const error = new AxiosError('timeout', 'ECONNABORTED');
      error.code = 'ECONNABORTED';
      httpService.get.mockReturnValue(throwError(() => error));

      await expect(client.getProjects(1, ['MEMBER'])).rejects.toThrow(
        BffTimeoutException,
      );
    });

    it('should throw BffServiceUnavailableException on connection error', async () => {
      const error = new AxiosError('connection refused', 'ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      httpService.get.mockReturnValue(throwError(() => error));

      await expect(client.getProjects(1, ['MEMBER'])).rejects.toThrow(
        BffServiceUnavailableException,
      );
    });
  });

  describe('getProject', () => {
    it('should call task-service with path parameter', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Project A' },
        meta: { timestamp: new Date().toISOString() },
      };
      httpService.get.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.getProject(1, 1, ['MEMBER']);

      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3001/projects/1',
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    it('should pass through downstream 404 error', async () => {
      const error = new AxiosError('Not Found');
      error.response = {
        status: 404,
        statusText: 'Not Found',
        data: {
          error: {
            code: 'TASK_PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        },
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      httpService.get.mockReturnValue(throwError(() => error));

      await expect(client.getProject(999, 1, ['MEMBER'])).rejects.toThrow();
    });
  });

  describe('getTasks', () => {
    it('should call task-service with query parameters', async () => {
      const query = { assigneeId: 1, status: 'TODO' };
      const mockResponse = {
        data: [{ id: 1, title: 'Task A', status: 'TODO' }],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          timestamp: new Date().toISOString(),
        },
      };
      httpService.get.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.getTasks(1, ['MEMBER'], query);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createProject', () => {
    it('should send POST request with body', async () => {
      const dto = { name: 'New Project', description: 'Description' };
      const mockResponse = {
        data: { id: 1, ...dto },
        meta: { timestamp: new Date().toISOString() },
      };
      httpService.post.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.createProject(dto, 1, ['MEMBER']);

      expect(result).toEqual(mockResponse);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3001/projects',
        dto,
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });

  describe('updateProject', () => {
    it('should send PATCH request with body', async () => {
      const dto = { name: 'Updated Project' };
      const mockResponse = {
        data: { id: 1, name: 'Updated Project' },
        meta: { timestamp: new Date().toISOString() },
      };
      httpService.patch.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.updateProject(1, dto, 1, ['MEMBER']);

      expect(result).toEqual(mockResponse);
      expect(httpService.patch).toHaveBeenCalledWith(
        'http://localhost:3001/projects/1',
        dto,
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });

  describe('deleteProject', () => {
    it('should send DELETE request', async () => {
      httpService.delete.mockReturnValue(of(createMockResponse(null)));

      await client.deleteProject(1, 1, ['MEMBER']);

      expect(httpService.delete).toHaveBeenCalledWith(
        'http://localhost:3001/projects/1',
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });

  describe('header propagation', () => {
    it('should propagate X-User-Id and X-User-Roles', async () => {
      const mockResponse = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          timestamp: new Date().toISOString(),
        },
      };
      httpService.get.mockReturnValue(of(createMockResponse(mockResponse)));

      await client.getProjects(42, ['ADMIN', 'MEMBER']);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'X-User-Id': '42',
            'X-User-Roles': 'ADMIN,MEMBER',
          },
        }),
      );
    });
  });
});
