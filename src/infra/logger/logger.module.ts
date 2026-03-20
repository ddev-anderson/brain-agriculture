import { Module, Global } from '@nestjs/common';
import { PinoLoggerService } from './logger.service';

/**
 * GlobalLoggerModule makes PinoLoggerService available across the entire
 * application without needing to import it in every feature module.
 */
@Global()
@Module({
  providers: [PinoLoggerService],
  exports: [PinoLoggerService],
})
export class LoggerModule {}
