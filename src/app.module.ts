import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infra/database/database.module';
import { LoggerModule } from '@infra/logger/logger.module';
import { ProducerModule } from '@infra/modules/producer/producer.module';
import { FarmModule } from '@infra/modules/farm/farm.module';
import { HarvestModule } from '@infra/modules/harvest/harvest.module';
import { CropModule } from '@infra/modules/crop/crop.module';
import { PlantingModule } from '@infra/modules/planting/planting.module';
import { RequestIdMiddleware } from '@presentation/middlewares/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    DatabaseModule,
    ProducerModule,
    FarmModule,
    HarvestModule,
    CropModule,
    PlantingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
