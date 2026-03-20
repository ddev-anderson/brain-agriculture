import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { PRODUCER_REPOSITORY } from '@domain/repositories/tokens';

@Injectable()
export class DeleteProducerUseCase {
  private readonly logger = new Logger(DeleteProducerUseCase.name);

  constructor(
    @Inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: IProducerRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`[DeleteProducerUseCase] - Deleting producerId: ${id}`);
    const producer = await this.producerRepository.findById(id);
    if (!producer) {
      throw new NotFoundException(`Producer with id "${id}" not found.`);
    }
    await this.producerRepository.delete(id);
  }
}
