<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import MarkdownIt from 'markdown-it'
import { format } from 'date-fns'
import { NButton, NSpin, NTag, NDivider, NResult } from 'naive-ui'

// 👇👇👇 核心修复开始：引入高亮核心和语言包
import hljs from 'highlight.js/lib/core';

// 按需引入你博客里用到的语言 (缺哪个引哪个)
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import java from 'highlight.js/lib/languages/java';       // 👈 Java 文章必须
import sql from 'highlight.js/lib/languages/sql';         // 👈 数据库文章必须
import bash from 'highlight.js/lib/languages/bash';       // 👈 Linux 命令必须
import xml from 'highlight.js/lib/languages/xml';         // HTML/XML
import yaml from 'highlight.js/lib/languages/yaml';       // Docker Compose/K8s
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext'; // 兜底用

// 注册语言 (必须执行！)
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash); // 兼容 shell 写法
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);   // 兼容 html 写法
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', plaintext);
// 👆👆👆 核心修复结束

const route = useRoute()
const router = useRouter()
const md = new MarkdownIt({
  html: true, linkify: true,
  highlight: function (str, lang): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>';
      } catch (__) { }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
})

const post = ref<any>(null)
const loading = ref(true)
const htmlContent = ref('')

// 👇 新增：错误状态码，默认 null
const errorStatus = ref<number | null>(null)

onMounted(async () => {
  const slug = route.params.slug
  try {
    loading.value = true
    errorStatus.value = null // 重置错误

    const res = await axios.get(`/articles/${slug}`)

    // 兼容剥壳逻辑
    const articleData = res.data?.data || res

    post.value = articleData

    // 设置标题
    document.title = `${articleData.title} - 文桃的技术博客`

    // 渲染 Markdown
    htmlContent.value = md.render(articleData.content || '')

    await nextTick()
    hljs.highlightAll()

  } catch (e: any) {
    console.error(e)
    // 👇 核心逻辑：捕获 404 状态码
    if (e.response && e.response.status === 404) {
      errorStatus.value = 404
    } else {
      errorStatus.value = 500
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="post-container">
    <n-button text @click="router.push('/')" style="margin-bottom: 20px">
      &lt; 返回首页
    </n-button>

    <div v-if="loading" class="loading-box">
      <n-spin size="large" description="文章加载中..." />
    </div>

    <div v-else-if="errorStatus" class="error-box">
      <n-result v-if="errorStatus === 404" status="404" title="文章不存在或已下架" description="这篇内容可能已经被博主吃掉了，去看看别的吧">
        <template #footer>
          <n-button type="primary" @click="router.push('/')">回到首页</n-button>
        </template>
      </n-result>

      <n-result v-else status="500" title="服务器出错了" description="后端服务可能正在重启，请稍后再试">
        <template #footer>
          <n-button @click="router.go(0)">刷新页面</n-button>
        </template>
      </n-result>
    </div>

    <article v-else-if="post" class="article-content">
      <h1 class="title">{{ post.title }}</h1>

      <div class="meta">
        <span>发布于 {{ format(new Date(post.createdAt), 'yyyy年MM月dd日') }}</span>
        <n-divider vertical />
        <n-tag v-for="tag in post.tags" :key="tag.id" size="small" type="primary" style="margin-right: 5px">
          {{ tag.name }}
        </n-tag>
      </div>

      <n-divider />

      <div class="markdown-body" v-html="htmlContent"></div>
    </article>
  </div>
</template>

<style>
/* 增加错误页面的居中样式 */
.error-box {
  padding: 60px 0;
  display: flex;
  justify-content: center;
}
.loading-box {
  padding: 100px 0;
  text-align: center;
}
/* 这里写一些简单的 Markdown 样式，或者引入 prismjs 高亮代码 */
.markdown-body {
  line-height: 1.8;
  font-size: 1.05rem;
  color: #333;
}

.markdown-body h2 {
  margin-top: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

/* 👇👇👇【核心修复】Markdown 代码块样式重置 */
.markdown-body pre {
  background-color: #282c34; /* 强制深色背景 (配合 atom-one-dark) */
  border-radius: 6px;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto; /* 允许左右滑动 */
  
  /* 🚨 强制左对齐，解决居中问题 */
  text-align: left; 
  line-height: 1.5;
}

.markdown-body code {
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  
  /* 🚨 修复 Inline Code 的样式 */
  background-color: rgba(175, 184, 193, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

/* 避免 pre 里的 code 重复背景色 */
.markdown-body pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit; /* 继承 highlight.js 的颜色 */
}

/* 修复图片过大撑破布局 */
.markdown-body img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 20px auto; /* 图片居中 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 修复列表缩进 */
.markdown-body ul, .markdown-body ol {
  padding-left: 2em;
  margin-bottom: 1em;
  text-align: left; /* 强制列表也左对齐 */
}

.title {
  font-size: 2rem;
  margin-bottom: 10px;
}

.meta {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.loading-box {
  text-align: center;
  padding: 50px;
}
</style>