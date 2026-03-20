import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { PRODUCER_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class FindAllProducersUseCase {
  private readonly logger = new Logger(FindAllProducersUseCase.name);

  constructor(
    @Inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: IProducerRepository,
  ) {}

  async execute(): Promise<ProducerEntity[]> {
    this.logger.log('[FindAllProducersUseCase] - Fetching all producers');
    return this.producerRepository.findAll();
  }
}
