import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropEntity } from '@domain/entities/crop.entity';
import { CROP_REPOSITORY } from '@domain/repositories/tokens';
import { CropRepository } from '@infra/repositories/crop.repository';
import { CreateCropUseCase } from '@application/use-cases/crop/create-crop.use-case';
import { FindAllCropsUseCase } from '@application/use-cases/crop/find-all-crops.use-case';
import { DeleteCropUseCase } from '@application/use-cases/crop/delete-crop.use-case';
import { CropController } from '@presentation/controllers/crop.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CropEntity])],
  controllers: [CropController],
  providers: [
    { provide: CROP_REPOSITORY, useClass: CropRepository },
    CreateCropUseCase,
    FindAllCropsUseCase,
    DeleteCropUseCase,
  ],
  exports: [CROP_REPOSITORY],
})
export class CropModule {}
