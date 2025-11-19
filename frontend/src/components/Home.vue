<template>
  <div v-if="loading">加载中...</div>
  <div v-else>
    <div v-for="article in articles" :key="article.id" class="article-item">
      <h2>
        <router-link :to="'/posts/' + article.slug">{{ article.title }}</router-link>
      </h2>
      <small>{{ formatDate(article.createdAt) }} · {{ article.views }} 阅读</small>
      <p>{{ article.summary }}</p>
    </div>
    
    <div class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span> 第 {{ page }} 页 </span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { format } from 'date-fns'

const articles = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const fetchArticles = async (p: number) => {
  loading.value = true
  try {
    // ⚠️ 这里请求你的 NestJS 后端
    const res = await axios.get(`http://localhost:3000/articles?page=${p}&limit=5`)
    // 修改为：
    const responseData = res.data.data; // ✅ 取出包裹在里面的 data
    articles.value = responseData.items
    totalPages.value = responseData.totalPages
    page.value = responseData.page
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const changePage = (p: number) => fetchArticles(p)
const formatDate = (date: string) => format(new Date(date), 'yyyy-MM-dd')

onMounted(() => fetchArticles(1))
</script>

<style scoped>
.article-item { margin-bottom: 40px; }
.article-item h2 { margin-bottom: 10px; }
.pagination { margin-top: 40px; display: flex; gap: 10px; align-items: center; }
button { padding: 5px 15px; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>