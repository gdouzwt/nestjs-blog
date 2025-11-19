<template>
  <div class="post-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div> 正在加载文章...
    </div>

    <div v-else class="post-content">
      <h1 class="title">{{ article.title }}</h1>
      
      <div class="meta">
        <span>📅 {{ formatDate(article.createdAt) }}</span>
        <span class="divider">|</span>
        <span>🔥 {{ article.views }} 阅读</span>
      </div>

      <hr />

      <div v-html="renderedContent" class="markdown-body"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import MarkdownIt from 'markdown-it'
import { format } from 'date-fns'
// 👇 引入 GitHub 风格样式
import 'github-markdown-css/github-markdown-light.css'

const route = useRoute()
const md = new MarkdownIt({ html: true, linkify: true }) // 允许 HTML 标签
const article = ref<any>({})
const loading = ref(true)

const renderedContent = computed(() => {
  return article.value.content ? md.render(article.value.content) : ''
})

const formatDate = (date: string) => date ? format(new Date(date), 'yyyy-MM-dd HH:mm') : ''

onMounted(async () => {
  try {
    const slug = route.params.slug
    const res = await axios.get(`http://localhost:3000/articles/${slug}`)
    article.value = res.data.data // ✅ 取出包裹在里面的 data
  } catch (e) {
    console.error("加载失败", e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #24292e;
}

.meta {
  color: #586069;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.divider {
  margin: 0 10px;
  color: #ddd;
}

/* 微调 markdown-body 的边距 */
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 15px 0;
}

/* 简单的 Loading 动画 */
.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>