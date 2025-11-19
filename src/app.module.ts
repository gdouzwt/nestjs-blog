import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article/article.entity';
import { ArticleController } from './article/article.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleService } from './article/article.service';
// 👇 1. 引入刚才新建的模块
import { RedisModule } from './redis/redis.module';



@Module({
  imports: [

// 👇 2. 必须在这里注册！这就是之前报错的原因：可能定义了但没引进来
    RedisModule,
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
  providers: [AppService, ArticleService],
})
export class AppModule {}
