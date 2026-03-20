import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmEntity } from '@domain/entities/farm.entity';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { FARM_REPOSITORY, PRODUCER_REPOSITORY } from '@domain/repositories/tokens';
import { FarmRepository } from '@infra/repositories/farm.repository';
import { ProducerRepository } from '@infra/repositories/producer.repository';
import { CreateFarmUseCase } from '@application/use-cases/farm/create-farm.use-case';
import { FindAllFarmsUseCase } from '@application/use-cases/farm/find-all-farms.use-case';
import { FindFarmByIdUseCase } from '@application/use-cases/farm/find-farm-by-id.use-case';
import { UpdateFarmUseCase } from '@application/use-cases/farm/update-farm.use-case';
import { DeleteFarmUseCase } from '@application/use-cases/farm/delete-farm.use-case';
import { FarmController } from '@presentation/controllers/farm.controller';

const useCases = [
  CreateFarmUseCase,
  FindAllFarmsUseCase,
  FindFarmByIdUseCase,
  UpdateFarmUseCase,
  DeleteFarmUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([FarmEntity, ProducerEntity])],
  controllers: [FarmController],
  providers: [
    { provide: FARM_REPOSITORY, useClass: FarmRepository },
    { provide: PRODUCER_REPOSITORY, useClass: ProducerRepository },
    ...useCases,
  ],
})
export class FarmModule {}
