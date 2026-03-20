import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FarmEntity } from '@domain/entities/farm.entity';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { FARM_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class FindFarmByIdUseCase {
  private readonly logger = new Logger(FindFarmByIdUseCase.name);

  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: IFarmRepository,
  ) {}

  async execute(id: string): Promise<FarmEntity> {
    this.logger.log(`[FindFarmByIdUseCase] - Fetching farmId: ${id}`);
    const farm = await this.farmRepository.findById(id);
    if (!farm) {
      throw new NotFoundException(`Farm with id "${id}" not found.`);
    }
    return farm;
  }
}
