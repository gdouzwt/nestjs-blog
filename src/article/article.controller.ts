import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
// 👇 引入 Swagger 装饰器
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('articles') // 👈 给这个 Controller 分类
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // GET /articles?page=1&limit=10
  @Get()
  @ApiOperation({ summary: '获取文章列表（分页）' }) // 👈 接口描述
  @ApiQuery({ name: 'page', required: false, description: '页码，默认 1' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量，默认 10' })
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    // 简单的参数转换，实际项目中可以用 Pipe 做验证
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;
    return this.articleService.findAll(pageNum, limitNum);
  }

  // GET /articles/:slug
  // 例如：GET /articles/install-minio-on-ubuntu
  @Get(':slug')
  @ApiOperation({ summary: '获取文章详情' })
  @ApiResponse({ status: 200, description: '成功返回文章详情，自动计入阅读数。' })
  @ApiResponse({ status: 404, description: '文章未找到' })
  async findOne(@Param('slug') slug: string) {
    return this.articleService.findOne(slug);
  }
}