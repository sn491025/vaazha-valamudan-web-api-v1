import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiStandardResponses<T>(
  dataType?: Type<T> | [Type<T>],
  options: {
    successStatus?: number;
    includeAuth?: boolean;
    includeValidation?: boolean;
    includeNotFound?: boolean;
    includeConflict?: boolean;
  } = {}
) {
  const {
    successStatus = 200,
    includeAuth = true,
    includeValidation = false,
    includeNotFound = false,
    includeConflict = false,
  } = options;

  const decorators = [
    ApiResponse({
      status: successStatus,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: successStatus },
          data: dataType 
            ? Array.isArray(dataType) 
              ? { type: 'array', items: { $ref: `#/components/schemas/${dataType[0].name}` } }
              : { $ref: `#/components/schemas/${dataType.name}` }
            : { type: 'object' },
          message: { type: 'string', example: 'Operation completed successfully' },
          timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
        }
      }
    })
  ];

  if (includeAuth) {
    decorators.push(
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 401 },
            data: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Unauthorized' },
                message: { type: 'string', example: 'Authentication is required' },
                details: { type: 'null' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                path: { type: 'string', example: '/api/roles' }
              }
            }
          }
        }
      })
    );
  }

  if (includeValidation) {
    decorators.push(
      ApiResponse({
        status: 400,
        description: 'Validation Error',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            data: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Validation Error' },
                message: { type: 'string', example: 'Input validation failed' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'name' },
                      value: { type: 'string', example: '' },
                      constraints: { type: 'array', items: { type: 'string' }, example: ['name should not be empty'] }
                    }
                  }
                },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                path: { type: 'string', example: '/api/roles' }
              }
            }
          }
        }
      })
    );
  }

  if (includeNotFound) {
    decorators.push(
      ApiResponse({
        status: 404,
        description: 'Not Found',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            data: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Not Found' },
                message: { type: 'string', example: 'Resource not found' },
                details: { type: 'null' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                path: { type: 'string', example: '/api/roles/123' }
              }
            }
          }
        }
      })
    );
  }

  if (includeConflict) {
    decorators.push(
      ApiResponse({
        status: 409,
        description: 'Conflict',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 409 },
            data: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Conflict' },
                message: { type: 'string', example: 'Resource already exists' },
                details: { type: 'null' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                path: { type: 'string', example: '/api/roles' }
              }
            }
          }
        }
      })
    );
  }

  return applyDecorators(...decorators);
}
