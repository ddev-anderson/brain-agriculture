import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@presentation/filters/http-exception.filter';
import { LoggingInterceptor } from '@presentation/interceptors/logging.interceptor';
import { PinoLoggerService } from '@infra/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Replace NestJS default logger with pino
  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Order matters: interceptor runs before filter so every request gets logged
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Brain Agriculture API')
    .setDescription(
      'API de gestão rural para cadastro de produtores, fazendas, safras, culturas e plantios.',
    )
    .setVersion('1.0')
    .addTag('Produtores', 'Gestão de produtores rurais (CPF/CNPJ)')
    .addTag('Fazendas', 'Gestão de propriedades rurais')
    .addTag('Safras', 'Gestão de anos/ciclos agrícolas')
    .addTag('Culturas', 'Catálogo de tipos de cultura agrícola')
    .addTag('Plantios', 'Registro de culturas plantadas por fazenda e safra')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Brain Agriculture API running on port ${port}`, 'Bootstrap');
  logger.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`, 'Bootstrap');
  logger.log(`Swagger docs available at http://localhost:${port}/docs`, 'Bootstrap');
}

bootstrap();
