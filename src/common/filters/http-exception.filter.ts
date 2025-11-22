import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiErrorResponse, ValidationErrorDetail } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiErrorResponse;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;

        // Handle validation errors (class-validator)
        if (statusCode === HttpStatus.BAD_REQUEST && responseObj.message && Array.isArray(responseObj.message)) {
          errorResponse = {
            statusCode,
            data: {
              error: 'Validation Error',
              message: 'Input validation failed',
              details: this.formatValidationErrors(responseObj.message),
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
        }
        // Handle business exceptions or other custom exceptions
        else if (responseObj.error || responseObj.message) {
          errorResponse = {
            statusCode,
            data: {
              error: responseObj.error || this.getErrorType(statusCode),
              message: responseObj.message || this.getErrorMessage(statusCode),
              details: responseObj.details || null,
              timestamp: responseObj.timestamp || new Date().toISOString(),
              path: request.url,
            },
          };
        }
        // Handle standard HTTP exceptions
        else {
          errorResponse = {
            statusCode,
            data: {
              error: this.getErrorType(statusCode),
              message: typeof exceptionResponse === 'string' ? exceptionResponse : this.getErrorMessage(statusCode),
              details: null,
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
        }
      } else {
        // String response
        errorResponse = {
          statusCode,
          data: {
            error: this.getErrorType(statusCode),
            message: typeof exceptionResponse === 'string' ? exceptionResponse : this.getErrorMessage(statusCode),
            details: null,
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
      }
    } else {
      // Handle unexpected errors
      this.logger.error('Unexpected error occurred', exception);
      errorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? exception : null,
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      };
    }

    // Log the error for debugging
    this.logger.error(
      `${request.method} ${request.url} - Status: ${statusCode} - ${errorResponse.data.message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(statusCode).json(errorResponse);
  }

  private formatValidationErrors(messages: string[]): ValidationErrorDetail[] {
    return messages.map(msg => {
      // Try to parse constraint-based validation messages
      const parts = msg.split(' ');
      const field = parts[0];

      return {
        field,
        value: null,
        constraints: [msg],
      };
    });
  }

  private getErrorType(statusCode: number): string {
    const errorTypes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };

    return errorTypes[statusCode] || 'Unknown Error';
  }

  private getErrorMessage(statusCode: number): string {
    const errorMessages: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'The request is invalid',
      [HttpStatus.UNAUTHORIZED]: 'Authentication is required',
      [HttpStatus.FORBIDDEN]: 'Access denied',
      [HttpStatus.NOT_FOUND]: 'Resource not found',
      [HttpStatus.CONFLICT]: 'Resource already exists',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'The request is well-formed but contains semantic errors',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal server error occurred',
    };

    return errorMessages[statusCode] || 'An error occurred';
  }
}
