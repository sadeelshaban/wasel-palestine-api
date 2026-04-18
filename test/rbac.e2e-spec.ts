import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createConfiguredTestApp } from './create-test-app';

const incidentBody = () => ({
  type: 'closure',
  description: 'e2e incident',
  latitude: 32.22,
  longitude: 35.25,
  severity: 'LOW',
  status: 'OPEN',
});

const checkpointBody = () => ({
  name: 'E2E Checkpoint',
  latitude: 32.2,
  longitude: 35.2,
  status: 'OPEN',
});

const run = process.env.DATABASE_URL ? describe : describe.skip;

run('RBAC — incidents & checkpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createConfiguredTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/incidents is public (200)', async () => {
    await request(app.getHttpServer()).get('/api/v1/incidents').expect(200);
  });

  it('POST /api/v1/incidents without auth returns 401', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/incidents')
      .send(incidentBody())
      .expect(401);
  });

  it('POST /api/v1/incidents as USER returns 403', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `rbac_user_${suffix}@test.local`;
    const password = 'Password123!';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password,
        firstName: 'Rbac',
        lastName: 'User',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const token = login.body.accessToken as string;
    expect(token).toBeTruthy();

    await request(app.getHttpServer())
      .post('/api/v1/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send(incidentBody())
      .expect(403);
  });

  it('POST /api/v1/incidents as ADMIN succeeds when seeded', async () => {
    const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@wasel.local';
    const password =
      process.env.ADMIN_SEED_PASSWORD ?? 'ChangeMeAdmin123!';

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });

    if (login.status !== 200) {
      // eslint-disable-next-line no-console
      console.warn(
        'Skipping admin incident assertion: login failed (run npm run db:seed)',
      );
      return;
    }

    const token = login.body.accessToken as string;
    const res = await request(app.getHttpServer())
      .post('/api/v1/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...incidentBody(),
        type: `e2e-${Date.now()}`,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/v1/checkpoints is public (200)', async () => {
    await request(app.getHttpServer()).get('/api/v1/checkpoints').expect(200);
  });

  it('POST /api/v1/checkpoints without auth returns 401', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/checkpoints')
      .send(checkpointBody())
      .expect(401);
  });

  it('POST /api/v1/checkpoints as USER returns 403', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `rbac_cp_${suffix}@test.local`;
    const password = 'Password123!';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password,
        firstName: 'Cp',
        lastName: 'User',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/checkpoints')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send(checkpointBody())
      .expect(403);
  });

  it('POST /api/v1/checkpoints as ADMIN succeeds when seeded', async () => {
    const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@wasel.local';
    const password =
      process.env.ADMIN_SEED_PASSWORD ?? 'ChangeMeAdmin123!';

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });

    if (login.status !== 200) {
      // eslint-disable-next-line no-console
      console.warn(
        'Skipping admin checkpoint assertion: login failed (run npm run db:seed)',
      );
      return;
    }

    const res = await request(app.getHttpServer())
      .post('/api/v1/checkpoints')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({
        ...checkpointBody(),
        name: `E2E CP ${Date.now()}`,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
  });
});
