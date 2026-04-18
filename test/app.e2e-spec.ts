import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET / redirects toward operator GUI', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(302);
    expect(res.headers.location).toMatch(/gui/);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
