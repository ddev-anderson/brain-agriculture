import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { FARM_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class DeleteFarmUseCase {
  private readonly logger = new Logger(DeleteFarmUseCase.name);

  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: IFarmRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`[DeleteFarmUseCase] - Deleting farmId: ${id}`);
    const farm = await this.farmRepository.findById(id);
    if (!farm) {
      throw new NotFoundException(`Farm with id "${id}" not found.`);
    }
    await this.farmRepository.delete(id);
  }
}
