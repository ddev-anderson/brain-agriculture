import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FarmEntity } from '@domain/entities/farm.entity';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { FARM_REPOSITORY, PRODUCER_REPOSITORY } from '@domain/repositories/tokens';
import { CreateFarmDto } from '@application/dtos/farm/create-farm.dto';

@Injectable()
export class CreateFarmUseCase {
  private readonly logger = new Logger(CreateFarmUseCase.name);

  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: IFarmRepository,
    @Inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: IProducerRepository,
  ) {}

  async execute(dto: CreateFarmDto): Promise<FarmEntity> {
    this.logger.log(
      `[CreateFarmUseCase] - Creating farm: ${dto.name} for producerId: ${dto.producerId}`,
    );
    const producer = await this.producerRepository.findById(dto.producerId);
    if (!producer) {
      throw new NotFoundException(`Producer with id "${dto.producerId}" not found.`);
    }
    if (dto.arableArea + dto.vegetationArea > dto.totalArea) {
      throw new UnprocessableEntityException(
        `The sum of arable area (${dto.arableArea}) and vegetation area (${dto.vegetationArea}) cannot exceed total area (${dto.totalArea}).`,
      );
    }
    const entity = new FarmEntity();
    entity.name = dto.name;
    entity.city = dto.city;
    entity.state = dto.state;
    entity.totalArea = dto.totalArea;
    entity.arableArea = dto.arableArea;
    entity.vegetationArea = dto.vegetationArea;
    entity.producerId = dto.producerId;
    return this.farmRepository.create(entity);
  }
}
