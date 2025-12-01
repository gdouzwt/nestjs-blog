import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../article/article.entity';

@Controller('sitemap.xml')
export class SitemapController {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {}

  @Get()
  @Header('Content-Type', 'text/xml') // 👈 关键：声明这是 XML
  @Header('Cache-Control', 'none') // 可选：禁用缓存
  async generateSitemap() {
    const articles = await this.articleRepo.find({
      select: ['slug', 'updatedAt', 'createdAt'],
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
    });

    const host = 'https://blog.zwt.io';

    const urls = articles
      .map((post) => {
        return `
  <url>
    <loc>${host}/posts/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt || post.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${urls}
</urlset>`;

    return xml;
  }
}
