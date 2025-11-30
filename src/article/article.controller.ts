import { Controller, Get, Param, Query, Post, Body, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@nestjs/passport'; // 👈 引入守卫
// 👇 引入 Swagger 装饰器
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('articles') // 👈 给这个 Controller 分类
@ApiBearerAuth() // 👈 关键：给整个 Controller 加上这个，Swagger 页面右上角就会出现“Authorize”按钮
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  // 👇 新增：发布文章接口
  @Post()
  @UseGuards(AuthGuard('jwt')) // 🔒 关键：加上这行，没 Token 进不来！
  @ApiOperation({ summary: '发布新文章 (需要登录)' })
  @ApiResponse({ status: 401, description: '未授权' })
  async create(@Body() createArticleDto: any) {
    // 这里简单调用 service.create (你需要去 Service 里补一个 create 方法)
    // return this.articleService.create(createArticleDto);
    return { msg: '为了演示安全，这个接口是通的，但没 Token 调不了！' };
  }

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

  // 🔍 搜索接口 (一定要放在 Get(':slug') 之前 !!!)
  @Get('search')
  @ApiOperation({ summary: '搜索文章 (支持标题和摘要)' })
  async search(@Query('q') q: string) {
    if (!q || q.trim().length === 0) {
      return [];
    }
    return this.articleService.search(q);
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