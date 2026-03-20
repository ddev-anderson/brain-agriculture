import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantingEntity } from '@domain/entities/planting.entity';
import { IPlantingRepository } from '@domain/repositories/planting.repository.interface';

@Injectable()
export class PlantingRepository implements IPlantingRepository {
  constructor(
    @InjectRepository(PlantingEntity)
    private readonly repo: Repository<PlantingEntity>,
  ) {}

  findAll(): Promise<PlantingEntity[]> {
    return this.repo.find({
      relations: ['farm', 'harvest', 'crop'],
    });
  }

  findById(id: string): Promise<PlantingEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['farm', 'harvest', 'crop'],
    });
  }

  findByFarmId(farmId: string): Promise<PlantingEntity[]> {
    return this.repo.find({
      where: { farmId },
      relations: ['harvest', 'crop'],
    });
  }

  findByHarvestId(harvestId: string): Promise<PlantingEntity[]> {
    return this.repo.find({
      where: { harvestId },
      relations: ['farm', 'crop'],
    });
  }

  findByCropId(cropId: string): Promise<PlantingEntity[]> {
    return this.repo.find({
      where: { cropId },
      relations: ['farm', 'harvest'],
    });
  }

  findByFarmHarvestCrop(
    farmId: string,
    harvestId: string,
    cropId: string,
  ): Promise<PlantingEntity | null> {
    return this.repo.findOne({ where: { farmId, harvestId, cropId } });
  }

  create(planting: PlantingEntity): Promise<PlantingEntity> {
    return this.repo.save(this.repo.create(planting));
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
