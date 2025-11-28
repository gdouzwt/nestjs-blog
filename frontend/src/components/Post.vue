<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import MarkdownIt from 'markdown-it'
import { format } from 'date-fns'
import { NButton, NSpin, NTag, NDivider } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const md = new MarkdownIt({ html: true, linkify: true })

const post = ref<any>(null)
const loading = ref(true)
const htmlContent = ref('')

onMounted(async () => {
  const slug = route.params.slug
  try {
    // 调用后端详情接口
    const res = await axios.get(`/articles/${slug}`)
    post.value = res.data
    // 渲染 Markdown
    htmlContent.value = md.render(res.data.content || '')
  } catch (e) {
    console.error(e)
    // 这里可以加个 404 跳转
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="post-container">
    <n-button text @click="router.back()" style="margin-bottom: 20px">
      &lt; 返回列表
    </n-button>

    <div v-if="loading" class="loading-box">
      <n-spin size="large" />
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
/* 这里写一些简单的 Markdown 样式，或者引入 prismjs 高亮代码 */
.markdown-body {
  line-height: 1.8;
  font-size: 1.05rem;
  color: #333;
}
.markdown-body h2 { margin-top: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.markdown-body pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
.markdown-body blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #666; margin-left: 0; }
.markdown-body img { max-width: 100%; border-radius: 4px; }

.title { font-size: 2rem; margin-bottom: 10px; }
.meta { color: #888; font-size: 0.9rem; margin-bottom: 20px; }
.loading-box { text-align: center; padding: 50px; }
</style>