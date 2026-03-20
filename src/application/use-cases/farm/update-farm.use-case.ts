import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FarmEntity } from '@domain/entities/farm.entity';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { FARM_REPOSITORY } from '@domain/repositories/tokens';
import { UpdateFarmDto } from '@application/dtos/farm/update-farm.dto';

@Injectable()
export class UpdateFarmUseCase {
  private readonly logger = new Logger(UpdateFarmUseCase.name);

  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: IFarmRepository,
  ) {}

  async execute(id: string, dto: UpdateFarmDto): Promise<FarmEntity> {
    this.logger.log(`[UpdateFarmUseCase] - Updating farmId: ${id}`);
    const farm = await this.farmRepository.findById(id);
    if (!farm) {
      throw new NotFoundException(`Farm with id "${id}" not found.`);
    }
    if (dto.name) farm.name = dto.name;
    if (dto.city) farm.city = dto.city;
    if (dto.state) farm.state = dto.state;
    if (dto.totalArea !== undefined) farm.totalArea = dto.totalArea;
    if (dto.arableArea !== undefined) farm.arableArea = dto.arableArea;
    if (dto.vegetationArea !== undefined) farm.vegetationArea = dto.vegetationArea;

    const totalArea = Number(farm.totalArea);
    const arableArea = Number(farm.arableArea);
    const vegetationArea = Number(farm.vegetationArea);
    if (arableArea + vegetationArea > totalArea) {
      throw new UnprocessableEntityException(
        `The sum of arable area (${arableArea}) and vegetation area (${vegetationArea}) cannot exceed total area (${totalArea}).`,
      );
    }
    return this.farmRepository.update(farm);
  }
}
