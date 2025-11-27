// data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// 1. 既然 CLI 不经过 NestJS 启动，我们需要手动加载 .env
dotenv.config();

// 2. 这里的配置要和 app.module.ts 保持一致
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // 3. 关键：指定 Entity 和 Migration 的路径
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],

  // 4. 关闭自动同步，开启日志
  synchronize: false,
  logging: true,
});
