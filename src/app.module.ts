import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article/article.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
