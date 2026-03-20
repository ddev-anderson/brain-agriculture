import { Inject, Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { PRODUCER_REPOSITORY } from '@domain/repositories/tokens';
import { UpdateProducerDto } from '@application/dtos/producer/update-producer.dto';
import { TaxId } from '@domain/value-objects/document.vo';

@Injectable()
export class UpdateProducerUseCase {
  private readonly logger = new Logger(UpdateProducerUseCase.name);

  constructor(
    @Inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: IProducerRepository,
  ) {}

  async execute(id: string, dto: UpdateProducerDto): Promise<ProducerEntity> {
    this.logger.log(`[UpdateProducerUseCase] - Updating producerId: ${id}`);
    const producer = await this.producerRepository.findById(id);
    if (!producer) {
      throw new NotFoundException(`Producer with id "${id}" not found.`);
    }

    if (dto.document !== undefined && dto.document !== producer.document) {
      // Re-validate against VO — throws ValidationDomainError (→ 422) if invalid
      const document = new TaxId(dto.document);

      const existing = await this.producerRepository.findByDocument(document.value);
      if (existing) {
        throw new ConflictException('A producer with this Tax ID already exists.');
      }
      producer.document = document.value;
    }

    if (dto.name !== undefined) producer.name = dto.name;

    return this.producerRepository.update(producer);
  }
}
