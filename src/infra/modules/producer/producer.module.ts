import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { PRODUCER_REPOSITORY } from '@domain/repositories/tokens';
import { ProducerRepository } from '@infra/repositories/producer.repository';
import { CreateProducerUseCase } from '@application/use-cases/producer/create-producer.use-case';
import { FindAllProducersUseCase } from '@application/use-cases/producer/find-all-producers.use-case';
import { FindProducerByIdUseCase } from '@application/use-cases/producer/find-producer-by-id.use-case';
import { UpdateProducerUseCase } from '@application/use-cases/producer/update-producer.use-case';
import { DeleteProducerUseCase } from '@application/use-cases/producer/delete-producer.use-case';
import { ProducerController } from '@presentation/controllers/producer.controller';

const useCases = [
  CreateProducerUseCase,
  FindAllProducersUseCase,
  FindProducerByIdUseCase,
  UpdateProducerUseCase,
  DeleteProducerUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([ProducerEntity])],
  controllers: [ProducerController],
  providers: [
    { provide: PRODUCER_REPOSITORY, useClass: ProducerRepository },
    ...useCases,
  ],
  exports: [PRODUCER_REPOSITORY],
})
export class ProducerModule {}
