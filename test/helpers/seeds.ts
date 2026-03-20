import { DataSource } from 'typeorm';
import { ProducerEntity } from '../../src/domain/entities/producer.entity';
import { FarmEntity } from '../../src/domain/entities/farm.entity';
import { HarvestEntity } from '../../src/domain/entities/harvest.entity';
import { CropEntity } from '../../src/domain/entities/crop.entity';

export interface TestSeeds {
  producers: ProducerEntity[];
  farms: FarmEntity[];
  harvests: HarvestEntity[];
  crops: CropEntity[];
}

/**
 * Seeds lightweight, deterministic test data.
 * Call this in beforeEach after clearTestData().
 */
export async function seedTestData(dataSource: DataSource): Promise<TestSeeds> {
  const producerRepo = dataSource.getRepository(ProducerEntity);
  const farmRepo = dataSource.getRepository(FarmEntity);
  const harvestRepo = dataSource.getRepository(HarvestEntity);
  const cropRepo = dataSource.getRepository(CropEntity);

  const producers = await producerRepo.save(
    producerRepo.create([
      { name: 'João Silva', document: '52998224725' },
      { name: 'Agro Brasil Ltda', document: '11222333000181' },
    ]),
  );

  const farms = await farmRepo.save(
    farmRepo.create([
      {
        name: 'Fazenda Bela Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1500,
        arableArea: 900,
        vegetationArea: 400,
        producerId: producers[0].id,
      },
      {
        name: 'Fazenda Serra Verde',
        city: 'Uberaba',
        state: 'MG',
        totalArea: 3200,
        arableArea: 2000,
        vegetationArea: 800,
        producerId: producers[1].id,
      },
    ]),
  );

  const harvests = await harvestRepo.save(harvestRepo.create([{ year: 2023 }, { year: 2024 }]));

  const crops = await cropRepo.save(cropRepo.create([{ name: 'Soy' }, { name: 'Corn' }]));

  return { producers, farms, harvests, crops };
}

/**
 * Truncates all tables in a safe order (respects FK constraints).
 * Uses TRUNCATE ... CASCADE so soft-deleted rows are also removed.
 */
export async function clearTestData(dataSource: DataSource): Promise<void> {
  await dataSource.query('TRUNCATE TABLE plantings, farms, producers, crops, harvests CASCADE');
}
