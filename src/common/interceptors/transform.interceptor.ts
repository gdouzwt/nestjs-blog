import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 定义标准的返回结构
export interface Response<T> {
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        code: 200, // 业务状态码，200 表示成功
        data,      // 真正的数据
        message: 'Success',
        timestamp: new Date().toISOString(), // 方便排查问题的时间戳
      })),
    );
  }
}