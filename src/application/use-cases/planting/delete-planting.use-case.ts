import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IPlantingRepository } from '@domain/repositories/planting.repository.interface';
import { PLANTING_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class DeletePlantingUseCase {
  private readonly logger = new Logger(DeletePlantingUseCase.name);

  constructor(
    @Inject(PLANTING_REPOSITORY)
    private readonly plantingRepository: IPlantingRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`[DeletePlantingUseCase] - Deleting plantingId: ${id}`);
    const planting = await this.plantingRepository.findById(id);
    if (!planting) {
      throw new NotFoundException(`Planting with id "${id}" not found.`);
    }
    await this.plantingRepository.delete(id);
  }
}
