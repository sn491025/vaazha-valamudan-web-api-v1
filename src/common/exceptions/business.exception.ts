import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any
  ) {
    super(
      {
        error: 'Business Logic Error',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
