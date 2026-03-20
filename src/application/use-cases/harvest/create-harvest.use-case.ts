import { Inject, Injectable, ConflictException, Logger } from '@nestjs/common';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { IHarvestRepository } from '@domain/repositories/harvest.repository.interface';
import { HARVEST_REPOSITORY } from '@domain/repositories/tokens';
import { CreateHarvestDto } from '@application/dtos/harvest/create-harvest.dto';

@Injectable()
export class CreateHarvestUseCase {
  private readonly logger = new Logger(CreateHarvestUseCase.name);

  constructor(
    @Inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: IHarvestRepository,
  ) {}

  async execute(dto: CreateHarvestDto): Promise<HarvestEntity> {
    this.logger.log(`[CreateHarvestUseCase] - Creating harvest year: ${dto.year}`);
    const existing = await this.harvestRepository.findByYear(dto.year);
    if (existing) {
      throw new ConflictException(`A harvest for year ${dto.year} already exists.`);
    }
    const entity = new HarvestEntity();
    entity.year = dto.year;
    return this.harvestRepository.create(entity);
  }
}
