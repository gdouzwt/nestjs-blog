import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { DataSource } from 'typeorm';
import { Article } from '../src/article/article.entity';
// 1. 引入 Tag 实体
import { Tag } from '../src/tag/tag.entity';

// ⚠️⚠️⚠️ 修改这里：指向你本地 Jekyll 博客的 _posts 目录 ⚠️⚠️⚠️
// 例如：'/Users/zwt/code/blog.zwt.io/_posts'
const JEKYLL_POSTS_PATH = '/Users/tao/Desktop/GitHub/blog/_posts';

// 数据库配置（需要和 app.module.ts 保持一致）
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'se1124',
  database: 'blog',
  entities: [Article, Tag],
  synchronize: false, // 脚本运行不需要同步表结构，因为已经建好了
});

async function importPosts() {
  console.log('🚀 开始连接数据库...');
  await AppDataSource.initialize();
  console.log('✅ 数据库连接成功！');

  const articleRepo = AppDataSource.getRepository(Article);

  if (!fs.existsSync(JEKYLL_POSTS_PATH)) {
    console.error(`❌ 找不到目录: ${JEKYLL_POSTS_PATH}`);
    console.error('请修改脚本中的 JEKYLL_POSTS_PATH 变量！');
    process.exit(1);
  }

  const files = fs.readdirSync(JEKYLL_POSTS_PATH);
  let count = 0;

  console.log(`📂 找到 ${files.length} 个文件，开始处理...`);

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    try {
      // 1. 解析文件名 (Jekyll 格式: 2023-08-04-title-slug.md)
      // 这里的正则假设文件名格式为: YYYY-MM-DD-slug.md
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

      // 解析 tags (Jekyll 的 front-matter 可能是 tags: ['A', 'B'] 或者 tags: "A B")
      let tagNames: string[] = [];
      if (Array.isArray(data.tags)) {
        tagNames = data.tags;
      } else if (typeof data.tags === 'string') {
        tagNames = data.tags.split(' ').filter(t => t.trim());
      }

      // 💾 智能标签处理逻辑
      const articleTags: Tag[] = [];
      const tagRepo = AppDataSource.getRepository(Tag); // 获取 Tag 仓库

      for (const tagName of tagNames) {
        // 先查库里有没有这个标签
        let tag = await tagRepo.findOneBy({ name: tagName });
        if (!tag) {
          // 没有才创建
          tag = new Tag();
          tag.name = tagName;
          await tagRepo.save(tag); // 先保存 Tag
        }
        articleTags.push(tag);
      }

      // 4. 创建实体对象
      const article = new Article();
      article.title = data.title || slug; // 如果没有标题，用 slug 代替
      article.slug = slug;
      article.content = content; // Markdown 正文
      article.isPublished = true; // 默认直接发布
      article.createdAt = new Date(dateStr); // 使用文件名里的日期
      // 兼容处理：如果 Jekyll 里有 description，就作为摘要，否则截取前 100 字
      article.summary = data.description || content.substring(0, 150).replace(/[\r\n#]/g, ' ') + '...';

      article.tags = articleTags; // 关联已存在的 Tag 对象
      
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