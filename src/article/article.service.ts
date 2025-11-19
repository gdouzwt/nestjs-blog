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


  // async search(keyword: string) {
  // // 🔍 使用 QueryBuilder 构建 SQL，比 find() 更灵活
  // // 面试亮点：这里使用了 ILIKE (Postgres 特有)，实现了不区分大小写的模糊匹配
  // return this.articleRepository.createQueryBuilder('article')
  //   .where('article.isPublished = :isPublished', { isPublished: true })
  //   .andWhere(
  //     // 组合查询：搜标题 OR 搜摘要 (注意括号，防止逻辑错误)
  //     '(article.title ILIKE :keyword OR article.summary ILIKE :keyword)', 
  //     { keyword: `%${keyword}%` }
  //   )
  //   .orderBy('article.createdAt', 'DESC')
  //   // 🚀 性能优化：只查必要的字段，绝不查 content 大字段
  //   .select(['article.id', 'article.title', 'article.slug', 'article.summary', 'article.createdAt', 'article.views'])
  //   .getMany();
  // }

async search(keyword: string) {
    const cacheKey = `search:${keyword.trim()}`;

    // 1️⃣ 🔥 先查缓存
    const cachedResult = await this.redis.get(cacheKey);
    if (cachedResult) {
      console.log(`🚀 [Search Cache HIT] 搜索词: ${keyword}`);
      return JSON.parse(cachedResult);
    }

    // 2️⃣ 🐢 缓存未命中，走 DB 查询 (使用 QueryBuilder)
    console.log(`🐢 [Search Cache MISS] 查数据库: ${keyword}`);
    const results = await this.articleRepository.createQueryBuilder('article')
      .where('article.isPublished = :isPublished', { isPublished: true })
      .andWhere(
        '(article.title ILIKE :keyword OR article.summary ILIKE :keyword)', 
        { keyword: `%${keyword}%` }
      )
      .orderBy('article.createdAt', 'DESC')
      .select(['article.id', 'article.title', 'article.slug', 'article.summary', 'article.createdAt', 'article.views'])
      .getMany();

    // 3️⃣ 💾 写入缓存
    // ⚠️ 注意：搜索结果缓存时间不宜过长，设为 30秒 足够抵挡恶意请求，又能保证数据相对新鲜
    if (results.length > 0) {
       await this.redis.set(cacheKey, JSON.stringify(results), 'EX', 30);
    }

    return results;
  } 

  private async incrementViews(slug: string) {
    await this.articleRepository.increment({ slug }, 'views', 1);
  }
}