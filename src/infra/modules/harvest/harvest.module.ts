import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { HARVEST_REPOSITORY } from '@domain/repositories/tokens';
import { HarvestRepository } from '@infra/repositories/harvest.repository';
import { CreateHarvestUseCase } from '@application/use-cases/harvest/create-harvest.use-case';
import { FindAllHarvestsUseCase } from '@application/use-cases/harvest/find-all-harvests.use-case';
import { DeleteHarvestUseCase } from '@application/use-cases/harvest/delete-harvest.use-case';
import { HarvestController } from '@presentation/controllers/harvest.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HarvestEntity])],
  controllers: [HarvestController],
  providers: [
    { provide: HARVEST_REPOSITORY, useClass: HarvestRepository },
    CreateHarvestUseCase,
    FindAllHarvestsUseCase,
    DeleteHarvestUseCase,
  ],
  exports: [HARVEST_REPOSITORY],
})
export class HarvestModule {}
