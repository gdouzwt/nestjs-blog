import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Logger } from '@nestjs/common';

@Processor('article-queue') // 🎧 监听 'article-queue'
export class ArticleProcessor extends WorkerHost {
  private readonly logger = new Logger(ArticleProcessor.name);

  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {
    super();
  }

  async process(job: Job<{ slug: string }>) {
    if (job.name === 'increment-view') {
      const { slug } = job.data;
      this.logger.log(`🔧 [Async Worker] 正在后台更新阅读量: ${slug}`);
      
      // 真正干活：更新数据库
      await this.articleRepository.increment({ slug }, 'views', 1);
    }
  }
}