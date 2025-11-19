import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 👇 引入拦截器
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇👇👇 加上这一行，允许跨域访问
  app.enableCors();

  // 👇 注册全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
