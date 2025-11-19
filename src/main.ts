import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 👇 引入拦截器
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
// 👇 1. 引入 Swagger 相关类
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇👇👇 加上这一行，允许跨域访问
  app.enableCors();

  // 👇 注册全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  
// 👇 2. 配置 Swagger 文档信息
  const config = new DocumentBuilder()
    .setTitle('ZWT Blog API')
    .setDescription('基于 NestJS + TypeORM + Redis 的高并发博客系统 API')
    .setVersion('1.0')
    .addTag('articles', '文章管理模块')
    .build();
  
  // 👇 3. 创建文档
  const document = SwaggerModule.createDocument(app, config);
  
  // 👇 4. 挂载 Swagger UI 到 /api-docs 路径
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
