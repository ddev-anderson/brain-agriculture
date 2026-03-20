import { Inject, Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PlantingEntity } from '@domain/entities/planting.entity';
import { IPlantingRepository } from '@domain/repositories/planting.repository.interface';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { IHarvestRepository } from '@domain/repositories/harvest.repository.interface';
import { ICropRepository } from '@domain/repositories/crop.repository.interface';
import {
  PLANTING_REPOSITORY,
  FARM_REPOSITORY,
  HARVEST_REPOSITORY,
  CROP_REPOSITORY,
} from '@domain/repositories/tokens';
import { CreatePlantingDto } from '@application/dtos/planting/create-planting.dto';

@Injectable()
export class CreatePlantingUseCase {
  private readonly logger = new Logger(CreatePlantingUseCase.name);

  constructor(
    @Inject(PLANTING_REPOSITORY)
    private readonly plantingRepository: IPlantingRepository,
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: IFarmRepository,
    @Inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: IHarvestRepository,
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: ICropRepository,
  ) {}

  async execute(dto: CreatePlantingDto): Promise<PlantingEntity> {
    this.logger.log(
      `[CreatePlantingUseCase] - Creating planting farmId: ${dto.farmId} harvestId: ${dto.harvestId} cropId: ${dto.cropId}`,
    );
    const [farm, harvest, crop] = await Promise.all([
      this.farmRepository.findById(dto.farmId),
      this.harvestRepository.findById(dto.harvestId),
      this.cropRepository.findById(dto.cropId),
    ]);

    if (!farm) throw new NotFoundException(`Farm with id "${dto.farmId}" not found.`);
    if (!harvest) throw new NotFoundException(`Harvest with id "${dto.harvestId}" not found.`);
    if (!crop) throw new NotFoundException(`Crop with id "${dto.cropId}" not found.`);

    const duplicate = await this.plantingRepository.findByFarmHarvestCrop(
      dto.farmId,
      dto.harvestId,
      dto.cropId,
    );
    if (duplicate) {
      throw new ConflictException(
        `Crop "${crop.name}" is already registered on farm "${farm.name}" for harvest ${harvest.year}.`,
      );
    }

    const entity = new PlantingEntity();
    entity.farmId = dto.farmId;
    entity.harvestId = dto.harvestId;
    entity.cropId = dto.cropId;
    return this.plantingRepository.create(entity);
  }
}
