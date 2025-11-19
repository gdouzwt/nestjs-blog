import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article/article.entity';
import { ArticleController } from './article/article.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleService } from './article/article.service';
// 👇 1. 引入刚才新建的模块
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';

// 👇 1. 引入限流相关模块
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Tag } from './tag/tag.entity';

@Module({
  imports: [

// 👇 2. 必须在这里注册！这就是之前报错的原因：可能定义了但没引进来
    RedisModule,
    AuthModule,
    // 👇 2. 配置限流规则
    ThrottlerModule.forRoot([{
      ttl: 60000, // 时间窗口：60秒 (单位是毫秒)
      limit: 10,  // 最大请求数：10次 (为了演示效果，故意设小一点)
    }]),

    TypeOrmModule.forRoot({
      type: 'postgres',
// 👇 关键修改：支持环境变量
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'se1124',
      database: process.env.DB_NAME || 'blog',
      entities: [Article, Tag],
      synchronize: true, // 生产环境建议关掉，但在 Demo 里开启方便
    }),
    TypeOrmModule.forFeature([Article]) // 注册 Repository
  ],
  controllers: [AppController, ArticleController],
  providers: [AppService, ArticleService,
    // 👇 3. 注册全局守卫，开启保护
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
