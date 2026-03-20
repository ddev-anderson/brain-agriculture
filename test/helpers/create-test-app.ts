import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { ProducerEntity } from '../../src/domain/entities/producer.entity';
import { FarmEntity } from '../../src/domain/entities/farm.entity';
import { HarvestEntity } from '../../src/domain/entities/harvest.entity';
import { CropEntity } from '../../src/domain/entities/crop.entity';
import { PlantingEntity } from '../../src/domain/entities/planting.entity';

import { ProducerModule } from '../../src/infra/modules/producer/producer.module';
import { FarmModule } from '../../src/infra/modules/farm/farm.module';
import { HarvestModule } from '../../src/infra/modules/harvest/harvest.module';
import { CropModule } from '../../src/infra/modules/crop/crop.module';
import { PlantingModule } from '../../src/infra/modules/planting/planting.module';

import { LoggerModule } from '../../src/infra/logger/logger.module';
import { PinoLoggerService } from '../../src/infra/logger/logger.service';
import { HttpExceptionFilter } from '../../src/presentation/filters/http-exception.filter';

// Load .env.test so DB_DATABASE points to the isolated test database.
dotenv.config({ path: '.env.test' });

const ALL_ENTITIES = [ProducerEntity, FarmEntity, HarvestEntity, CropEntity, PlantingEntity];

export interface TestApp {
  app: INestApplication;
  dataSource: DataSource;
}

/**
 * Bootstraps an isolated NestJS application backed by brain_agriculture_test.
 *
 * - Uses synchronize:true so no migrations are required.
 * - Uses dropSchema:true so each test suite always starts from a clean slate.
 * - Does NOT import DatabaseModule — that module reads env vars and is
 *   replaced here by an inline TypeOrmModule.forRoot configured for tests.
 */
export async function createTestApp(): Promise<TestApp> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'brain_agriculture_test',
        entities: ALL_ENTITIES,
        synchronize: true,
        dropSchema: true,
        logging: false,
      }),
      ProducerModule,
      FarmModule,
      HarvestModule,
      CropModule,
      PlantingModule,
      LoggerModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const logger = module.get(PinoLoggerService);
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  await app.init();

  const dataSource = module.get<DataSource>(getDataSourceToken());
  return { app, dataSource };
}
