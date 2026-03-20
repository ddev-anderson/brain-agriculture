import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { PRODUCER_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class FindProducerByIdUseCase {
  private readonly logger = new Logger(FindProducerByIdUseCase.name);

  constructor(
    @Inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: IProducerRepository,
  ) {}

  async execute(id: string): Promise<ProducerEntity> {
    this.logger.log(`[FindProducerByIdUseCase] - Fetching producerId: ${id}`);
    const producer = await this.producerRepository.findById(id);
    if (!producer) {
      throw new NotFoundException(`Producer with id "${id}" not found.`);
    }
    return producer;
  }
}
