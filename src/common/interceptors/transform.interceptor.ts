import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
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
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T> | string>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | string> {
    return next.handle().pipe(
      map((data) => {
        // 👇👇👇 核心修改：检测 XML
        // 如果返回的数据是字符串，并且以 <?xml 开头，说明是 Sitemap 或 RSS
        if (typeof data === 'string' && data.trim().startsWith('<?xml')) {
          // 直接返回原始 XML 字符串，不包 JSON 壳
          return data;
        }

        // 否则，按照原有逻辑包装成 JSON 标准格式
        return {
          code: 200, // 业务状态码
          data, // 真正的数据
          message: 'Success',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
