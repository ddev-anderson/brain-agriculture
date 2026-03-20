import { Inject, Injectable, Logger } from '@nestjs/common';
import { CropEntity } from '@domain/entities/crop.entity';
import { ICropRepository } from '@domain/repositories/crop.repository.interface';
import { CROP_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class FindAllCropsUseCase {
  private readonly logger = new Logger(FindAllCropsUseCase.name);

  constructor(
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: ICropRepository,
  ) {}

  async execute(): Promise<CropEntity[]> {
    this.logger.log('[FindAllCropsUseCase] - Fetching all crops');
    return this.cropRepository.findAll();
  }
}
