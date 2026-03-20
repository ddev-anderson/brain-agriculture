import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * RequestIdMiddleware
 *
 * Attaches a unique request ID to every incoming request:
 *   1. Reads `x-request-id` from the incoming headers (allows tracing from
 *      upstream proxies / API gateways that already set a correlation ID).
 *   2. Falls back to a freshly generated UUID v4.
 *   3. Stores the ID on `request.id` and echoes it back in the response
 *      header so callers can correlate logs server-side.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existingId = req.headers[REQUEST_ID_HEADER];
    const requestId =
      typeof existingId === 'string' && existingId.trim() ? existingId.trim() : randomUUID();

    (req as any).id = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
