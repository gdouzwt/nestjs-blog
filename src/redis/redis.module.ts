import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global() // ⚠️ 关键：标记为全局模块，这样 ArticleModule 也能直接用，不用再导入一遍
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'], // ⚠️ 必须导出，别人才能用
})
export class RedisModule {}