import { Inject, Injectable, Logger } from '@nestjs/common';
import { FarmEntity } from '@domain/entities/farm.entity';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { FARM_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class FindAllFarmsUseCase {
  private readonly logger = new Logger(FindAllFarmsUseCase.name);

  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: IFarmRepository,
  ) {}

  async execute(): Promise<FarmEntity[]> {
    this.logger.log('[FindAllFarmsUseCase] - Fetching all farms');
    return this.farmRepository.findAll();
  }
}
