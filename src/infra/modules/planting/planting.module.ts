import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantingEntity } from '@domain/entities/planting.entity';
import { FarmEntity } from '@domain/entities/farm.entity';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { CropEntity } from '@domain/entities/crop.entity';
import { PLANTING_REPOSITORY, FARM_REPOSITORY, HARVEST_REPOSITORY, CROP_REPOSITORY } from '@domain/repositories/tokens';
import { PlantingRepository } from '@infra/repositories/planting.repository';
import { FarmRepository } from '@infra/repositories/farm.repository';
import { HarvestRepository } from '@infra/repositories/harvest.repository';
import { CropRepository } from '@infra/repositories/crop.repository';
import { CreatePlantingUseCase } from '@application/use-cases/planting/create-planting.use-case';
import { FindAllPlantingsUseCase } from '@application/use-cases/planting/find-all-plantings.use-case';
import { DeletePlantingUseCase } from '@application/use-cases/planting/delete-planting.use-case';
import { PlantingController } from '@presentation/controllers/planting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlantingEntity, FarmEntity, HarvestEntity, CropEntity])],
  controllers: [PlantingController],
  providers: [
    { provide: PLANTING_REPOSITORY, useClass: PlantingRepository },
    { provide: FARM_REPOSITORY, useClass: FarmRepository },
    { provide: HARVEST_REPOSITORY, useClass: HarvestRepository },
    { provide: CROP_REPOSITORY, useClass: CropRepository },
    CreatePlantingUseCase,
    FindAllPlantingsUseCase,
    DeletePlantingUseCase,
  ],
})
export class PlantingModule {}
