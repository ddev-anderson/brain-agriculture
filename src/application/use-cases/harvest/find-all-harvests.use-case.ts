import { Inject, Injectable, Logger } from '@nestjs/common';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { IHarvestRepository } from '@domain/repositories/harvest.repository.interface';
import { HARVEST_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class FindAllHarvestsUseCase {
  private readonly logger = new Logger(FindAllHarvestsUseCase.name);

  constructor(
    @Inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: IHarvestRepository,
  ) {}

  async execute(): Promise<HarvestEntity[]> {
    this.logger.log('[FindAllHarvestsUseCase] - Fetching all harvests');
    return this.harvestRepository.findAll();
  }
}
