import { PlantingEntity } from '../entities/planting.entity';

export interface IPlantingRepository {
  findAll(): Promise<PlantingEntity[]>;
  findById(id: string): Promise<PlantingEntity | null>;
  findByFarmId(farmId: string): Promise<PlantingEntity[]>;
  findByHarvestId(harvestId: string): Promise<PlantingEntity[]>;
  findByCropId(cropId: string): Promise<PlantingEntity[]>;
  findByFarmHarvestCrop(farmId: string, harvestId: string, cropId: string): Promise<PlantingEntity | null>;
  create(planting: PlantingEntity): Promise<PlantingEntity>;
  delete(id: string): Promise<void>;
}
