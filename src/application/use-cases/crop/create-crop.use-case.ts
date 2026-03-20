import { Inject, Injectable, ConflictException, Logger } from '@nestjs/common';
import { CropEntity } from '@domain/entities/crop.entity';
import { ICropRepository } from '@domain/repositories/crop.repository.interface';
import { CROP_REPOSITORY } from '@domain/repositories/tokens';
import { CreateCropDto } from '@application/dtos/crop/create-crop.dto';

@Injectable()
export class CreateCropUseCase {
  private readonly logger = new Logger(CreateCropUseCase.name);

  constructor(
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: ICropRepository,
  ) {}

  async execute(dto: CreateCropDto): Promise<CropEntity> {
    this.logger.log(`[CreateCropUseCase] - Creating crop: ${dto.name}`);
    const existing = await this.cropRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`A crop named "${dto.name}" already exists.`);
    }
    const entity = new CropEntity();
    entity.name = dto.name;
    return this.cropRepository.create(entity);
  }
}
