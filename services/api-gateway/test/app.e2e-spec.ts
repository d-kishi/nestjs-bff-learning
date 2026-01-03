/**
 * AppController E2Eテスト
 *
 * ヘルスチェックエンドポイントのテスト。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) should return Hello World with standard response format', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.body.data).toBe('Hello World!');
    expect(response.body.meta).toBeDefined();
    expect(response.body.meta.timestamp).toBeDefined();
  });
});
