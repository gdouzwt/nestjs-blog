<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import MarkdownIt from 'markdown-it'
import { format } from 'date-fns'
import { NButton, NSpin, NTag, NDivider, NResult } from 'naive-ui'
import hljs from 'highlight.js/lib/core';

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

.markdown-body pre {
  background: #f4f4f4;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-body blockquote {
  border-left: 4px solid #ddd;
  padding-left: 15px;
  color: #666;
  margin-left: 0;
}

.markdown-body img {
  max-width: 100%;
  border-radius: 4px;
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