import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { FarmEntity } from '@domain/entities/farm.entity';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { CropEntity } from '@domain/entities/crop.entity';
import { PlantingEntity } from '@domain/entities/planting.entity';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  entities: [ProducerEntity, FarmEntity, HarvestEntity, CropEntity, PlantingEntity],
  migrations: ['src/infra/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
