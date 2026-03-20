import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp } from './helpers/create-test-app';
import { seedTestData, clearTestData, TestSeeds } from './helpers/seeds';

describe('ProducerController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeds: TestSeeds;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  beforeEach(async () => {
    await clearTestData(dataSource);
    seeds = await seedTestData(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/v1/producers ────────────────────────────────────────────────

  describe('GET /api/v1/producers', () => {
    it('returns 200 with an array of producers', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/producers');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('returned producers contain expected fields', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/producers');
      const producer = res.body[0];

      expect(producer).toHaveProperty('id');
      expect(producer).toHaveProperty('name');
      expect(producer).toHaveProperty('document');
      expect(producer).toHaveProperty('createdAt');
    });
  });

  // ─── GET /api/v1/producers/:id ────────────────────────────────────────────

  describe('GET /api/v1/producers/:id', () => {
    it('returns 200 with the correct producer', async () => {
      const { id, name, document } = seeds.producers[0];
      const res = await request(app.getHttpServer()).get(`/api/v1/producers/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe(name);
      expect(res.body.document).toBe(document);
    });

    it('returns 404 for a non-existent id', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/v1/producers/00000000-0000-0000-0000-000000000000',
      );
      expect(res.status).toBe(404);
    });

    it('returns 400 for an invalid UUID', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/producers/not-a-uuid');
      expect(res.status).toBe(400);
    });
  });

  // ─── POST /api/v1/producers ───────────────────────────────────────────────

  describe('POST /api/v1/producers', () => {
    it('returns 201 and the created producer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/producers')
        .send({ name: 'Maria Oliveira', document: '11144477735' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Maria Oliveira');
      expect(res.body.document).toBe('11144477735');
    });

    it('strips CPF formatting before persisting', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/producers')
        .send({ name: 'Formatted CPF', document: '111.444.777-35' });

      expect(res.status).toBe(201);
      expect(res.body.document).toBe('11144477735');
    });

    it('returns 409 when tax ID is already registered', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/producers')
        .send({ name: 'Duplicate', document: '52998224725' }); // already in seeds

      expect(res.status).toBe(409);
    });

    it('returns 422 for an invalid CPF', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/producers')
        .send({ name: 'Invalid CPF', document: '11111111111' });

      expect(res.status).toBe(422);
    });

    it('returns 422 for an invalid CNPJ', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/producers')
        .send({ name: 'Invalid CNPJ', document: '11111111111111' });

      expect(res.status).toBe(422);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/producers')
        .send({ document: '87748451902' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when document is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/producers')
        .send({ name: 'No Document' });

      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /api/v1/producers/:id ────────────────────────────────────────────

  describe('PUT /api/v1/producers/:id', () => {
    it('returns 200 and the updated producer name', async () => {
      const { id } = seeds.producers[0];
      const res = await request(app.getHttpServer())
        .put(`/api/v1/producers/${id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('returns 404 when updating a non-existent producer', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/producers/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
    });

    it('returns 409 when updating document to one already in use', async () => {
      const { id } = seeds.producers[0];
      const takenDocument = seeds.producers[1].document;

      const res = await request(app.getHttpServer())
        .put(`/api/v1/producers/${id}`)
        .send({ document: takenDocument });

      expect(res.status).toBe(409);
    });
  });

  // ─── DELETE /api/v1/producers/:id ─────────────────────────────────────────

  describe('DELETE /api/v1/producers/:id', () => {
    it('returns 204 on successful deletion', async () => {
      const { id } = seeds.producers[0];
      const res = await request(app.getHttpServer()).delete(`/api/v1/producers/${id}`);
      expect(res.status).toBe(204);
    });

    it('soft-deleted producer no longer appears in find-all', async () => {
      const { id } = seeds.producers[0];
      await request(app.getHttpServer()).delete(`/api/v1/producers/${id}`);

      const res = await request(app.getHttpServer()).get('/api/v1/producers');
      const ids = res.body.map((p: any) => p.id);
      expect(ids).not.toContain(id);
    });
  });
});
