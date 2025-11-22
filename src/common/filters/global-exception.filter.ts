import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract message/details from exception
    let message = 'Internal server error';
    let details: any = undefined;

    if (isHttp) {
      const response = (exception as HttpException).getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const r = response as Record<string, any>;
        message = r.message || r.error || message;
        // validation errors, etc.
        if (r.message && Array.isArray(r.message)) {
          details = r.message;
        }
      }
    } else if (exception instanceof Error) {
      // Keep generic message for non-HTTP errors; log actual one below
      message = 'Internal server error';
    }

    const requestId = (req.headers['x-request-id'] as string) || res.getHeader?.('x-request-id') || undefined;

    // Prepare log context
    const logContext = {
      requestId,
      status,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip,
      user: req.user ? { id: req.user.sub || req.user.id, roles: req.user.roles } : undefined,
      // Attach exception safely for pino
      err: exception instanceof Error ? { name: exception.name, message: exception.message, stack: exception.stack } : exception,
    };

    // Log error
    this.logger.error(logContext, `[${req.method}] ${req.originalUrl || req.url} -> ${message}`);

    // Build response body (hide internals in production)
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    const body: any = {
      statusCode: status,
      message,
      path: req.originalUrl || req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId,
    };

    if (details) {
      body.details = details;
    }

    if (isDev && exception instanceof Error) {
      body.error = { name: exception.name, stack: exception.stack };
    }

    res.status(status).json(body);
  }
}
