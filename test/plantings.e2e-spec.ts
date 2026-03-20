import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp } from './helpers/create-test-app';
import { seedTestData, clearTestData, TestSeeds } from './helpers/seeds';

describe('PlantingController (e2e)', () => {
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

  // ─── GET /api/v1/plantings ─────────────────────────────────────────────────

  describe('GET /api/v1/plantings', () => {
    it('returns 200 with an empty array when no plantings exist', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/plantings');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('returns the created plantings', async () => {
      // Create one planting first
      await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      const res = await request(app.getHttpServer()).get('/api/v1/plantings');
      expect(res.body).toHaveLength(1);
    });

    it('returned plantings contain expected fields', async () => {
      await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      const res = await request(app.getHttpServer()).get('/api/v1/plantings');
      const planting = res.body[0];

      expect(planting).toHaveProperty('id');
      expect(planting).toHaveProperty('farmId');
      expect(planting).toHaveProperty('harvestId');
      expect(planting).toHaveProperty('cropId');
    });
  });

  // ─── POST /api/v1/plantings ────────────────────────────────────────────────

  describe('POST /api/v1/plantings', () => {
    it('returns 201 and the created planting', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.farmId).toBe(seeds.farms[0].id);
      expect(res.body.harvestId).toBe(seeds.harvests[0].id);
      expect(res.body.cropId).toBe(seeds.crops[0].id);
    });

    it('allows the same crop on a different farm', async () => {
      await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      const res = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[1].id, // different farm
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      expect(res.status).toBe(201);
    });

    it('allows the same crop on the same farm in a different harvest', async () => {
      await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      const res = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[1].id, // different harvest
        cropId: seeds.crops[0].id,
      });

      expect(res.status).toBe(201);
    });

    it('returns 409 when the same crop/farm/harvest combination already exists', async () => {
      const payload = {
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      };

      await request(app.getHttpServer()).post('/api/v1/plantings').send(payload);

      const res = await request(app.getHttpServer()).post('/api/v1/plantings').send(payload);

      expect(res.status).toBe(409);
    });

    it('returns 404 when farmId does not exist', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      expect(res.status).toBe(404);
    });

    it('returns 404 when harvestId does not exist', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        cropId: seeds.crops[0].id,
      });

      expect(res.status).toBe(404);
    });

    it('returns 404 when cropId does not exist', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });

      expect(res.status).toBe(404);
    });

    it('returns 400 when farmId is not a valid UUID', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: 'invalid-uuid',
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/plantings')
        .send({ farmId: seeds.farms[0].id });

      expect(res.status).toBe(400);
    });
  });

  // ─── DELETE /api/v1/plantings/:id ─────────────────────────────────────────

  describe('DELETE /api/v1/plantings/:id', () => {
    it('returns 204 on successful deletion', async () => {
      const createRes = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      const { id } = createRes.body;
      const deleteRes = await request(app.getHttpServer()).delete(`/api/v1/plantings/${id}`);
      expect(deleteRes.status).toBe(204);
    });

    it('deleted planting no longer appears in find-all', async () => {
      const createRes = await request(app.getHttpServer()).post('/api/v1/plantings').send({
        farmId: seeds.farms[0].id,
        harvestId: seeds.harvests[0].id,
        cropId: seeds.crops[0].id,
      });

      const { id } = createRes.body;
      await request(app.getHttpServer()).delete(`/api/v1/plantings/${id}`);

      const listRes = await request(app.getHttpServer()).get('/api/v1/plantings');
      const ids = listRes.body.map((p: any) => p.id);
      expect(ids).not.toContain(id);
    });

    it('returns 400 for an invalid UUID', async () => {
      const res = await request(app.getHttpServer()).delete('/api/v1/plantings/not-a-uuid');
      expect(res.status).toBe(400);
    });
  });
});
