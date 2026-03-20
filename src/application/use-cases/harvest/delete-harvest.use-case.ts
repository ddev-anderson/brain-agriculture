import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IHarvestRepository } from '@domain/repositories/harvest.repository.interface';
import { HARVEST_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class DeleteHarvestUseCase {
  private readonly logger = new Logger(DeleteHarvestUseCase.name);

  constructor(
    @Inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: IHarvestRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`[DeleteHarvestUseCase] - Deleting harvestId: ${id}`);
    const harvest = await this.harvestRepository.findById(id);
    if (!harvest) {
      throw new NotFoundException(`Harvest with id "${id}" not found.`);
    }
    await this.harvestRepository.delete(id);
  }
}
