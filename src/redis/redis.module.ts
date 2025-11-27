import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // 1. 引入 ConfigService
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      // 2. 这里的 useFactory 接收 injected 进来的参数
      useFactory: (configService: ConfigService) => {
        return new Redis({
          // 3. 使用 configService 获取配置，类型更安全
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        });
      },
      // 4. 关键点：inject 属性告诉 NestJS，“执行工厂函数前，先把 ConfigService 注入进去”
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
