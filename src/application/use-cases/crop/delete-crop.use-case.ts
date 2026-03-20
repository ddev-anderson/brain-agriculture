import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ICropRepository } from '@domain/repositories/crop.repository.interface';
import { CROP_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class DeleteCropUseCase {
  private readonly logger = new Logger(DeleteCropUseCase.name);

  constructor(
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: ICropRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`[DeleteCropUseCase] - Deleting cropId: ${id}`);
    const crop = await this.cropRepository.findById(id);
    if (!crop) {
      throw new NotFoundException(`Crop with id "${id}" not found.`);
    }
    await this.cropRepository.delete(id);
  }
}
