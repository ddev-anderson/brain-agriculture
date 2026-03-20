import { Inject, Injectable, ConflictException, Logger } from '@nestjs/common';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { PRODUCER_REPOSITORY } from '@domain/repositories/tokens';
import { CreateProducerDto } from '@application/dtos/producer/create-producer.dto';
import { TaxId } from '@domain/value-objects/document.vo';

@Injectable()
export class CreateProducerUseCase {
  private readonly logger = new Logger(CreateProducerUseCase.name);

  constructor(
    @Inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: IProducerRepository,
  ) {}

  async execute(dto: CreateProducerDto): Promise<ProducerEntity> {
    this.logger.log(`[CreateProducerUseCase] - Creating producer: ${dto.name}`);
    // Validates CPF/CNPJ format and check-digits (throws ValidationDomainError
    // which is mapped to 422 by HttpExceptionFilter if invalid)
    const document = new TaxId(dto.document);

    const existing = await this.producerRepository.findByDocument(document.value);
    if (existing) {
      throw new ConflictException('A producer with this Tax ID already exists.');
    }

    const entity = new ProducerEntity();
    entity.name = dto.name;
    entity.document = document.value; // always stored as digits-only
    return this.producerRepository.create(entity);
  }
}
