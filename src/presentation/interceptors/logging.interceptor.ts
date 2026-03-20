import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request, Response } from 'express';

// rxjs 7 uses package.json "exports" map which requires moduleResolution:node16.
// Since this project targets module:commonjs / moduleResolution:node we load
// the operators via require() so TypeScript doesn't try to resolve the exports map.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { tap } = require('rxjs') as { tap: (observer: object) => any };
import { PinoLoggerService } from '@infra/logger/logger.service';

/**
 * LoggingInterceptor
 *
 * Wraps every controller method to emit two structured log lines:
 *   → request  — logged before the handler runs
 *   ← response — logged after the handler resolves, with duration in ms
 *
 * The `requestId` is read from `req.id` (set by RequestIdMiddleware).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLoggerService) {}

  // Return type is intentionally `any` — avoids importing Observable type from
  // rxjs which requires moduleResolution:node16 in this project setup.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): any {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const requestId: string = (req as any).id ?? 'unknown';
    const method = req.method;
    const url = req.originalUrl ?? req.url;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip ?? req.socket?.remoteAddress;
    const startedAt = Date.now();

    this.logger.logRequest({ requestId, method, url, userAgent, ip });

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.logResponse({
            requestId,
            method,
            url,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
          });
        },
        error: () => {
          // Exception path is handled by HttpExceptionFilter.
          // We still emit a response-level log here so every request has a
          // matching ← line even when an exception is thrown.
          this.logger.logResponse({
            requestId,
            method,
            url,
            statusCode: res.statusCode || 500,
            durationMs: Date.now() - startedAt,
          });
        },
      }),
    );
  }
}
