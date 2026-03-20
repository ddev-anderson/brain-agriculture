import { Injectable, LoggerService } from '@nestjs/common';
import pino, { Logger } from 'pino';

/**
 * PinoLoggerService wraps pino to produce structured JSON logs.
 *
 * In development (NODE_ENV !== 'production') output is piped through
 * pino-pretty for human-readable coloured output.
 * In production raw JSON is written to stdout for log aggregators.
 */
@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';

    this.logger = pino({
      level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
      base: { service: 'brain-agriculture' },
      timestamp: pino.stdTimeFunctions.isoTime,
      ...(isDev && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: false,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname,service',
          },
        },
      }),
    });
  }

  // ── NestJS LoggerService interface ────────────────────────────────────────

  log(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.info({ context, ...this.mergeMeta(meta) }, message);
  }

  error(message: string, trace?: string, context?: string, ...meta: unknown[]): void {
    this.logger.error({ context, trace, ...this.mergeMeta(meta) }, message);
  }

  warn(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.warn({ context, ...this.mergeMeta(meta) }, message);
  }

  debug(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.debug({ context, ...this.mergeMeta(meta) }, message);
  }

  verbose(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.trace({ context, ...this.mergeMeta(meta) }, message);
  }

  // ── Extended helpers for structured logging ────────────────────────────────

  /** Log an incoming HTTP request */
  logRequest(fields: {
    requestId: string;
    method: string;
    url: string;
    userAgent?: string;
    ip?: string;
  }): void {
    this.logger.info({ ...fields, phase: 'request' }, `→ ${fields.method} ${fields.url}`);
  }

  /** Log a completed HTTP response */
  logResponse(fields: {
    requestId: string;
    method: string;
    url: string;
    statusCode: number;
    durationMs: number;
  }): void {
    const level = fields.statusCode >= 500 ? 'error' : fields.statusCode >= 400 ? 'warn' : 'info';
    this.logger[level](
      { ...fields, phase: 'response' },
      `← ${fields.method} ${fields.url} ${fields.statusCode} (${fields.durationMs}ms)`,
    );
  }

  /** Log an unhandled exception with full context */
  logException(fields: {
    requestId?: string;
    method?: string;
    url?: string;
    statusCode: number;
    message: string | string[];
    stack?: string;
  }): void {
    const level = fields.statusCode >= 500 ? 'error' : 'warn';
    this.logger[level]({ ...fields, phase: 'exception' }, `Exception: ${fields.message}`);
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private mergeMeta(meta: unknown[]): Record<string, unknown> {
    if (!meta.length) return {};
    if (meta.length === 1 && typeof meta[0] === 'object' && meta[0] !== null) {
      return meta[0] as Record<string, unknown>;
    }
    return { meta };
  }
}
