import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();
        const statusCode = response.statusCode;

        // Handle empty responses (like DELETE operations)
        if (data === null || data === undefined) {
          return {
            statusCode,
            data: {} as T,
            message: this.getSuccessMessage(request.method, statusCode),
            timestamp: new Date().toISOString(),
          };
        }

        return {
          statusCode,
          data,
          message: this.getSuccessMessage(request.method, statusCode),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getSuccessMessage(method: string, statusCode: number): string {
    const messages: Record<string, string> = {
      'GET': 'Data retrieved successfully',
      'POST': statusCode === 201 ? 'Resource created successfully' : 'Operation completed successfully',
      'PATCH': 'Resource updated successfully',
      'PUT': 'Resource updated successfully',
      'DELETE': 'Resource deleted successfully',
    };

    return messages[method] || 'Operation completed successfully';
  }
}
