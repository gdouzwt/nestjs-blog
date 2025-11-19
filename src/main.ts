import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇👇👇 加上这一行，允许跨域访问
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
