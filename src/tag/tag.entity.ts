import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Article } from '../article/article.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  // 反向关系：一个标签可以属于多篇文章
  @ManyToMany(() => Article, (article) => article.tags)
  articles: Article[];
}