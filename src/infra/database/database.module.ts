import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { FarmEntity } from '@domain/entities/farm.entity';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { CropEntity } from '@domain/entities/crop.entity';
import { PlantingEntity } from '@domain/entities/planting.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'brain_agriculture'),
        entities: [
          ProducerEntity,
          FarmEntity,
          HarvestEntity,
          CropEntity,
          PlantingEntity,
        ],
        migrations: ['dist/infra/database/migrations/*.js'],
        synchronize: false,
        logging: config.get<string>('TYPEORM_LOGGING') === 'true',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
