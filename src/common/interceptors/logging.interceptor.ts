import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const response = context.switchToHttp().getResponse();

    return next
      .handle()
      .pipe(
        tap(() => {
            const time = Date.now() - now;
            // 👇 往响应头里写入服务器处理时间
            response.header('X-Response-Time', `${time}ms`);
            console.log(`Request took ${time}ms`); 
        }),
      );
  }
}