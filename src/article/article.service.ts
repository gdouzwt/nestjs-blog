import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import Redis from 'ioredis'; // 👈 引入类型

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
// 👇 注入我们刚才定义的 REDIS_CLIENT
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    // ... 保持原来的 findAll 不变 ...
    const [items, total] = await this.articleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      where: { isPublished: true },
      select: ['id', 'title', 'slug', 'summary', 'createdAt', 'views'],
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * 🔥 带缓存的详情查询
   */
  async findOne(slug: string) {
    const cacheKey = `article:${slug}`;

    // 1️⃣ 直接调用 Redis get
    const cachedData = await this.redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`🚀 [Redis HIT] 命中缓存: ${slug}`);
      // Redis 存的是字符串，取出来要 JSON.parse
      return JSON.parse(cachedData);
    }

    console.log(`🐢 [Redis MISS] 查数据库: ${slug}`);
    const article = await this.articleRepository.findOne({
      where: { slug },
      select: ['id', 'title', 'slug', 'content', 'summary', 'createdAt', 'views', 'version'],
    });

    if (!article) {
      throw new NotFoundException(`文章 ${slug} 不存在`);
    }

    // 2️⃣ 写入 Redis (设置过期时间 60秒)
    // 'EX' 代表秒
    await this.redis.set(cacheKey, JSON.stringify(article), 'EX', 60);

    this.incrementViews(slug);

    return article;
  }

  private async incrementViews(slug: string) {
    await this.articleRepository.increment({ slug }, 'views', 1);
  }
}