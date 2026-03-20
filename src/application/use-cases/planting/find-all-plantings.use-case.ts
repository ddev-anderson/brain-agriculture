import { Inject, Injectable, Logger } from '@nestjs/common';
import { PlantingEntity } from '@domain/entities/planting.entity';
import { IPlantingRepository } from '@domain/repositories/planting.repository.interface';
import { PLANTING_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class FindAllPlantingsUseCase {
  private readonly logger = new Logger(FindAllPlantingsUseCase.name);

  constructor(
    @Inject(PLANTING_REPOSITORY)
    private readonly plantingRepository: IPlantingRepository,
  ) {}

  async execute(): Promise<PlantingEntity[]> {
    this.logger.log('[FindAllPlantingsUseCase] - Fetching all plantings');
    return this.plantingRepository.findAll();
  }
}
