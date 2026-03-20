import dataSource from '../data-source';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { FarmEntity } from '@domain/entities/farm.entity';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { CropEntity } from '@domain/entities/crop.entity';
import { PlantingEntity } from '@domain/entities/planting.entity';

async function seed(): Promise<void> {
  await dataSource.initialize();
  console.log('🌱 Starting seed...');

  const producerRepo = dataSource.getRepository(ProducerEntity);
  const farmRepo = dataSource.getRepository(FarmEntity);
  const harvestRepo = dataSource.getRepository(HarvestEntity);
  const cropRepo = dataSource.getRepository(CropEntity);
  const plantingRepo = dataSource.getRepository(PlantingEntity);

  // ─── Producers ───────────────────────────────────────────────────────────
  const producers = producerRepo.create([
    { name: 'João Silva', document: '52998224725' },
    { name: 'Agro Brasil Ltda', document: '11222333000181' },
    { name: 'Maria Oliveira', document: '87748451902' },
  ]);
  const savedProducers = await producerRepo.save(producers);
  console.log(`  ✔ ${savedProducers.length} producers created`);

  // ─── Farms ───────────────────────────────────────────────────────────────
  const farms = farmRepo.create([
    {
      name: 'Fazenda Bela Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 1500,
      arableArea: 900,
      vegetationArea: 400,
      producerId: savedProducers[0].id,
    },
    {
      name: 'Fazenda Serra Verde',
      city: 'Uberaba',
      state: 'MG',
      totalArea: 3200,
      arableArea: 2000,
      vegetationArea: 800,
      producerId: savedProducers[1].id,
    },
    {
      name: 'Fazenda Rio Claro',
      city: 'Rondonópolis',
      state: 'MT',
      totalArea: 5000,
      arableArea: 3500,
      vegetationArea: 1000,
      producerId: savedProducers[1].id,
    },
    {
      name: 'Sítio Dona Maria',
      city: 'Petrolina',
      state: 'PE',
      totalArea: 800,
      arableArea: 500,
      vegetationArea: 200,
      producerId: savedProducers[2].id,
    },
  ]);
  const savedFarms = await farmRepo.save(farms);
  console.log(`  ✔ ${savedFarms.length} farms created`);

  // ─── Harvests ─────────────────────────────────────────────────────────────
  const harvests = harvestRepo.create([{ year: 2022 }, { year: 2023 }, { year: 2024 }]);
  const savedHarvests = await harvestRepo.save(harvests);
  console.log(`  ✔ ${savedHarvests.length} harvests created`);

  // ─── Crops ────────────────────────────────────────────────────────────────
  const crops = cropRepo.create([
    { name: 'Soy' },
    { name: 'Corn' },
    { name: 'Coffee' },
    { name: 'Cotton' },
    { name: 'Sugarcane' },
  ]);
  const savedCrops = await cropRepo.save(crops);
  console.log(`  ✔ ${savedCrops.length} crops created`);

  // ─── Plantings ────────────────────────────────────────────────────────────
  // farm 0: Soy + Corn for harvests 2022 and 2023
  // farm 1: Soy + Cotton + Coffee for harvests 2022, 2023 and 2024
  // farm 2: Soy + Corn for harvest 2024
  // farm 3: Coffee + Sugarcane for harvest 2023
  const plantings = plantingRepo.create([
    { farmId: savedFarms[0].id, harvestId: savedHarvests[0].id, cropId: savedCrops[0].id },
    { farmId: savedFarms[0].id, harvestId: savedHarvests[0].id, cropId: savedCrops[1].id },
    { farmId: savedFarms[0].id, harvestId: savedHarvests[1].id, cropId: savedCrops[0].id },

    { farmId: savedFarms[1].id, harvestId: savedHarvests[0].id, cropId: savedCrops[0].id },
    { farmId: savedFarms[1].id, harvestId: savedHarvests[0].id, cropId: savedCrops[3].id },
    { farmId: savedFarms[1].id, harvestId: savedHarvests[1].id, cropId: savedCrops[2].id },
    { farmId: savedFarms[1].id, harvestId: savedHarvests[2].id, cropId: savedCrops[0].id },

    { farmId: savedFarms[2].id, harvestId: savedHarvests[2].id, cropId: savedCrops[0].id },
    { farmId: savedFarms[2].id, harvestId: savedHarvests[2].id, cropId: savedCrops[1].id },

    { farmId: savedFarms[3].id, harvestId: savedHarvests[1].id, cropId: savedCrops[2].id },
    { farmId: savedFarms[3].id, harvestId: savedHarvests[1].id, cropId: savedCrops[4].id },
  ]);
  const savedPlantings = await plantingRepo.save(plantings);
  console.log(`  ✔ ${savedPlantings.length} plantings created`);

  await dataSource.destroy();
  console.log('✅ Seed completed successfully!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
