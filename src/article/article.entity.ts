import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, VersionColumn } from 'typeorm';

/**
 * 面试亮点：
 * 1. 使用 UUID 主键，防止 ID 遍历，适合分布式场景。
 * 2. 联合索引 (@Index) 优化查询性能。
 * 3. 乐观锁 (@VersionColumn) 处理并发更新。
 * 4. 字段长度控制，体现数据库设计规范。
 */

// 建立联合索引：针对“查询最新发布的文章”这一高频场景
@Index(['isPublished', 'createdAt']) 
@Entity('articles')
export class Article {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, comment: '文章标题' })
  title: string;

  // URL Slug，建立唯一索引，加速路由查找
  @Column({ unique: true, length: 255, comment: 'URL 路由标识' })
  slug: string;

  // 使用 text 类型存储大文本，select: false 避免列表查询时拖慢 I/O (面试考点：覆盖索引/回表)
  @Column({ type: 'text', select: false, comment: 'Markdown 原文' })
  content: string;

  @Column({ length: 500, nullable: true, comment: '文章摘要' })
  summary: string;

  @Column({ default: false, comment: '是否发布' })
  isPublished: boolean;

  @Column({ default: 0, comment: '阅读量' })
  views: number;

  // 乐观锁版本号：处理高并发下的更新丢失问题 (面试考点：CAS/乐观锁)
  @VersionColumn()
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}