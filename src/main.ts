import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 👇 引入拦截器
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
// 👇 1. 引入 Swagger 相关类
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// 👇 1. 引入依赖
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    {
      logger: WinstonModule.createLogger({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              // 生产环境通常用 winston.format.json()，开发环境用 nest-like 格式方便看
              nestWinstonModuleUtilities.format.nestLike('Backend', {
                prettyPrint: true,
                colors: true, // 你的终端会五颜六色
              }),
            ),
          }),
          // 面试加分项：可以添加一个 File Transport 把错误日志写到文件里
          // new winston.transports.File({ filename: 'error.log', level: 'error' }),
        ],
      }),
    });

  // 👇👇👇 关键修改 1：设置全局前缀
  // 这样所有的路由（包括 Controller）都会自动加上 /api
  // 比如 ArticleController 的 /articles 会自动变成 /api/articles
  app.setGlobalPrefix('api');

  // 👇👇👇 加上这一行，允许跨域访问
  app.enableCors();

  // 👇 注册全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());

  // 👇 2. 配置 Swagger 文档信息
  const config = new DocumentBuilder()
    .setTitle('ZWT Blog API')
    .setDescription('基于 NestJS + TypeORM + Redis 的高并发博客系统 API')
    .setVersion('1.0')
    .addTag('articles', '文章管理模块')
    // 👇👇👇 新增这一行：开启 Bearer Token 认证支持
    .addBearerAuth()
    .build();

  // 👇 3. 创建文档
  const document = SwaggerModule.createDocument(app, config);

  // 👇 4. 挂载 Swagger UI 到 /api-docs 路径
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3721, '0.0.0.0');
  // 👇 这里的 Log 就会变成 Winston 格式
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
