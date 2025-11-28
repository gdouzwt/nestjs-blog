import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { Article } from './article/article.entity';
import { ArticleController } from './article/article.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleService } from './article/article.service';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { ArticleProcessor } from './article/article.processor';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Tag } from './tag/tag.entity';

@Module({
  imports: [
    // 1. ConfigModule：查漏补缺，把 REDIS 配置加上校验
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // --- 数据库 ---
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),

        // --- 👇 必须补上这部分，否则 ConfigService 读不到 ---
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().required(),


        // --- 环境 ---
        NODE_ENV: Joi.string()
          .valid('dev', 'production', 'test')
          .default('dev'),
      }),
    }),

    RedisModule,
    AuthModule,

    // 2. 限流模块：虽然这里是写死的，但暂时可以接受
    // 如果想更完美，也可以用 forRootAsync 读环境变量 (例如 THROTTLE_LIMIT)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // 👇👇👇 3. 重点修改：BullMQ 改为异步加载配置
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          // 这里不再写 process.env，而是统一用 configService
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    // 👆👆👆 修改结束

    BullModule.registerQueue({
      name: 'article-queue',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Article, Tag],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([Article]),
  ],
  controllers: [AppController, ArticleController],
  providers: [
    AppService,
    ArticleService,
    ArticleProcessor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
