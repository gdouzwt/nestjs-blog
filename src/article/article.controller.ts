import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // GET /articles?page=1&limit=10
  @Get()
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    // 简单的参数转换，实际项目中可以用 Pipe 做验证
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;
    return this.articleService.findAll(pageNum, limitNum);
  }

  // GET /articles/:slug
  // 例如：GET /articles/install-minio-on-ubuntu
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.articleService.findOne(slug);
  }
}