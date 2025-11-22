import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const existing = (req.headers['x-request-id'] as string) || req.id;
    const requestId = existing || randomUUID();

    // Ensure request id is visible in response
    res.setHeader('x-request-id', requestId);

    return next.handle().pipe(
      tap(() => {
        // could add additional request/response correlation if needed
      })
    );
    }
}
