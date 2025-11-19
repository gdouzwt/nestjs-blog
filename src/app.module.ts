import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article/article.entity';
import { ArticleController } from './article/article.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleService } from './article/article.service';
// 👇 1. 引入刚才新建的模块
import { RedisModule } from './redis/redis.module';

// 👇 1. 引入限流相关模块
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [

// 👇 2. 必须在这里注册！这就是之前报错的原因：可能定义了但没引进来
    RedisModule,

    // 👇 2. 配置限流规则
    ThrottlerModule.forRoot([{
      ttl: 60000, // 时间窗口：60秒 (单位是毫秒)
      limit: 10,  // 最大请求数：10次 (为了演示效果，故意设小一点)
    }]),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // ⚠️ 检查你的 Docker 环境变量 POSTGRES_USER
      password: 'se1124', // ⚠️ 检查你的 Docker 环境变量 POSTGRES_PASSWORD
      database: 'blog',  // ⚠️ 检查你的 Docker 环境变量 POSTGRES_DB
      entities: [Article],
      synchronize: true, // ⚠️ 开发环境开启，它会自动根据 Entity 建表。生产环境要关掉！
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
