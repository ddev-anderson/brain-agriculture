import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp } from './helpers/create-test-app';
import { seedTestData, clearTestData, TestSeeds } from './helpers/seeds';

describe('FarmController (e2e)', () => {
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

  // ─── GET /api/v1/farms ────────────────────────────────────────────────────

  describe('GET /api/v1/farms', () => {
    it('returns 200 with an array of farms', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/farms');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('returned farms contain expected fields', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/farms');
      const farm = res.body[0];

      expect(farm).toHaveProperty('id');
      expect(farm).toHaveProperty('name');
      expect(farm).toHaveProperty('totalArea');
      expect(farm).toHaveProperty('arableArea');
      expect(farm).toHaveProperty('vegetationArea');
      expect(farm).toHaveProperty('producerId');
    });
  });

  // ─── GET /api/v1/farms/:id ────────────────────────────────────────────────

  describe('GET /api/v1/farms/:id', () => {
    it('returns 200 with the correct farm', async () => {
      const { id, name } = seeds.farms[0];
      const res = await request(app.getHttpServer()).get(`/api/v1/farms/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe(name);
    });

    it('returns 404 for a non-existent id', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/v1/farms/00000000-0000-0000-0000-000000000000',
      );
      expect(res.status).toBe(404);
    });

    it('returns 400 for an invalid UUID', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/farms/not-a-uuid');
      expect(res.status).toBe(400);
    });
  });

  // ─── POST /api/v1/farms ───────────────────────────────────────────────────

  describe('POST /api/v1/farms', () => {
    it('returns 201 and the created farm', async () => {
      const producerId = seeds.producers[0].id;

      const res = await request(app.getHttpServer()).post('/api/v1/farms').send({
        name: 'Fazenda Nova',
        city: 'Campinas',
        state: 'SP',
        totalArea: 500,
        arableArea: 300,
        vegetationArea: 100,
        producerId,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Fazenda Nova');
      expect(res.body.producerId).toBe(producerId);
    });

    it('returns 404 when producerId does not exist', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/farms').send({
        name: 'Orphan Farm',
        city: 'Nowhere',
        state: 'GO',
        totalArea: 100,
        arableArea: 50,
        vegetationArea: 30,
        producerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });

      expect(res.status).toBe(404);
    });

    it('returns 422 when arableArea + vegetationArea > totalArea', async () => {
      const producerId = seeds.producers[0].id;

      const res = await request(app.getHttpServer()).post('/api/v1/farms').send({
        name: 'Area Overflow',
        city: 'Cuiabá',
        state: 'MT',
        totalArea: 100,
        arableArea: 80,
        vegetationArea: 30,
        producerId,
      });

      expect(res.status).toBe(422);
    });

    it('returns 201 when areas sum exactly equals totalArea', async () => {
      const producerId = seeds.producers[0].id;

      const res = await request(app.getHttpServer()).post('/api/v1/farms').send({
        name: 'Exact Area Farm',
        city: 'Palmas',
        state: 'TO',
        totalArea: 200,
        arableArea: 150,
        vegetationArea: 50,
        producerId,
      });

      expect(res.status).toBe(201);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/farms')
        .send({ name: 'Incomplete' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when totalArea is not positive', async () => {
      const producerId = seeds.producers[0].id;

      const res = await request(app.getHttpServer()).post('/api/v1/farms').send({
        name: 'Zero Area',
        city: 'Manaus',
        state: 'AM',
        totalArea: 0,
        arableArea: 0,
        vegetationArea: 0,
        producerId,
      });

      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /api/v1/farms/:id ────────────────────────────────────────────────

  describe('PUT /api/v1/farms/:id', () => {
    it('returns 200 and the updated farm name', async () => {
      const { id } = seeds.farms[0];

      const res = await request(app.getHttpServer())
        .put(`/api/v1/farms/${id}`)
        .send({ name: 'Updated Farm Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Farm Name');
    });

    it('returns 404 when updating a non-existent farm', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/farms/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Ghost Farm' });

      expect(res.status).toBe(404);
    });

    it('returns 422 when updated areas violate the area rule', async () => {
      const { id, totalArea } = seeds.farms[0];

      const res = await request(app.getHttpServer())
        .put(`/api/v1/farms/${id}`)
        .send({ arableArea: totalArea, vegetationArea: totalArea });

      expect(res.status).toBe(422);
    });
  });

  // ─── DELETE /api/v1/farms/:id ─────────────────────────────────────────────

  describe('DELETE /api/v1/farms/:id', () => {
    it('returns 204 on successful deletion', async () => {
      const { id } = seeds.farms[0];
      const res = await request(app.getHttpServer()).delete(`/api/v1/farms/${id}`);
      expect(res.status).toBe(204);
    });

    it('soft-deleted farm no longer appears in find-all', async () => {
      const { id } = seeds.farms[0];
      await request(app.getHttpServer()).delete(`/api/v1/farms/${id}`);

      const res = await request(app.getHttpServer()).get('/api/v1/farms');
      const ids = res.body.map((f: any) => f.id);
      expect(ids).not.toContain(id);
    });
  });
});
