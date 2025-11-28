import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { DataSource } from 'typeorm';
import { Article } from '../src/article/article.entity';
import { Tag } from '../src/tag/tag.entity';
import * as dotenv from 'dotenv'; // 👈 1. 引入 dotenv

// 🚀 核心修改：脚本启动时手动加载 .env 文件
dotenv.config();

// 路径变量也从环境变量中读取，避免路径写死
const JEKYLL_POSTS_PATH = process.env.JEKYLL_POSTS_PATH || '/Users/tao/Desktop/GitHub/blog/_posts';

// 数据库配置 (所有敏感信息均从 process.env 中读取)
const AppDataSource = new DataSource({
  type: 'postgres',
  // 使用 DB_HOST, DB_PORT 等统一变量
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  // 关键修复：从环境变量中读取密码！
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME || 'blog_db',
  entities: [Article, Tag],
  synchronize: false, 
});

async function importPosts() {
  console.log('🚀 开始连接数据库...');
  await AppDataSource.initialize();
  console.log('✅ 数据库连接成功！');

  const articleRepo = AppDataSource.getRepository(Article);

  if (!fs.existsSync(JEKYLL_POSTS_PATH)) {
    console.error(`❌ 找不到目录: ${JEKYLL_POSTS_PATH}`);
    console.error('请在 .env 文件中设置 JEKYLL_POSTS_PATH 变量！');
    process.exit(1);
  }

  const files = fs.readdirSync(JEKYLL_POSTS_PATH);
  let count = 0;

  console.log(`📂 找到 ${files.length} 个文件，开始处理...`);

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    try {
      // 1. 解析文件名 (Jekyll 格式: YYYY-MM-DD-title-slug.md)
      const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
      if (!match) {
        console.warn(`⚠️ 跳过文件 (格式不匹配): ${file}`);
        continue;
      }

      const [_, dateStr, slug] = match;
      const fullPath = path.join(JEKYLL_POSTS_PATH, file);
      const fileContent = fs.readFileSync(fullPath, 'utf8');

      // 2. 解析 Front Matter (YAML 头信息)
      const { data, content } = matter(fileContent);

      // 3. 检查是否已存在 (防止重复导入)
      const existing = await articleRepo.findOneBy({ slug });
      if (existing) {
        console.log(`⏭️ 跳过已存在文章: ${slug}`);
        continue;
      }

      // 解析 tags 
      let tagNames: string[] = [];
      if (Array.isArray(data.tags)) {
        tagNames = data.tags;
      } else if (typeof data.tags === 'string') {
        tagNames = data.tags.split(' ').filter(t => t.trim());
      }

      // 💾 智能标签处理逻辑
      const articleTags: Tag[] = [];
      const tagRepo = AppDataSource.getRepository(Tag); 

      for (const tagName of tagNames) {
        let tag = await tagRepo.findOneBy({ name: tagName });
        if (!tag) {
          tag = new Tag();
          tag.name = tagName;
          await tagRepo.save(tag);
        }
        articleTags.push(tag);
      }

      // 4. 创建实体对象
      const article = new Article();
      article.title = data.title || slug; 
      article.slug = slug;
      article.content = content; // Markdown 正文
      article.isPublished = true; 
      article.createdAt = new Date(dateStr); 
      article.summary = data.description || content.substring(0, 150).replace(/[\r\n#]/g, ' ') + '...';

      article.tags = articleTags; 
      
      // 5. 保存到数据库
      await articleRepo.save(article);
      console.log(`✅ 成功导入: ${article.title}`);
      count++;

    } catch (error) {
      console.error(`❌ 处理文件失败 ${file}:`, error);
    }
  }

  console.log(`\n🎉 任务完成！共导入 ${count} 篇文章。`);
  await AppDataSource.destroy();
}

importPosts();