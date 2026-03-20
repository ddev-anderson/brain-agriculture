import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessRuleViolationError, ValidationDomainError } from '@domain/errors/domain.error';
import { PinoLoggerService } from '@infra/logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId: string = (request as any).id ?? 'unknown';
    const method = request.method;
    const url = request.url;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : ((res as any).message ?? res);
      stack = exception.stack;
    } else if (exception instanceof ValidationDomainError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
      stack = exception.stack;
    } else if (exception instanceof BusinessRuleViolationError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
      stack = exception.stack;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    this.logger.logException({
      requestId,
      method,
      url,
      statusCode: status,
      message,
      // Include stack trace only for server errors to avoid leaking internals
      // in 4xx log lines while still being able to debug 5xx issues.
      stack: status >= 500 ? stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      requestId,
      timestamp: new Date().toISOString(),
      path: url,
      message,
    });
  }
}
