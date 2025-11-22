import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponseDto<T = any> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'Operation completed successfully' })
  message?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp?: string;
}

export class ValidationErrorDetailDto {
  @ApiProperty({ example: 'email' })
  field: string;

  @ApiProperty({ example: 'invalid-email@' })
  value: any;

  @ApiProperty({ example: ['email must be a valid email address'] })
  constraints: string[];
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    type: 'object',
    properties: {
      error: { type: 'string', example: 'Bad Request' },
      message: { type: 'string', example: 'Input validation failed' },
      details: { type: 'array', items: { $ref: '#/components/schemas/ValidationErrorDetailDto' } },
      timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      path: { type: 'string', example: '/api/roles' }
    }
  })
  data: {
    error: string;
    message: string | string[];
    details?: ValidationErrorDetailDto[];
    timestamp: string;
    path?: string;
  };
}
