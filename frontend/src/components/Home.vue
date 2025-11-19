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
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { format } from 'date-fns'
import { useRoute } from 'vue-router'

const articles = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const route = useRoute()

const fetchArticles = async (p: number) => {
  loading.value = true
  try {
    const searchQuery = route.query.q
    
    let url = ''
    // 🔄 分支逻辑：有 q 参数就搜，没有就查列表
    if (searchQuery) {
      console.log('正在搜索:', searchQuery)
      url = `http://localhost:3000/articles/search?q=${searchQuery}`
    } else {
      url = `http://localhost:3000/articles?page=${p}&limit=5`
    }

    const res = await axios.get(url)
    
    // 搜索接口返回的是数组，分页接口返回的是 { items: [] }，这里要做个兼容
    if (searchQuery) {
      articles.value = res.data.data // 搜索结果直接是数组
      totalPages.value = 1 // 搜索暂不做分页
      page.value = 1
    } else {
      const responseData = res.data.data
      articles.value = responseData.items
      totalPages.value = responseData.totalPages
      page.value = responseData.page
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const changePage = (p: number) => fetchArticles(p)
const formatDate = (date: string) => format(new Date(date), 'yyyy-MM-dd')

// 监听路由参数变化（比如从普通列表切换到搜索结果）
watch(() => route.query, () => {
  fetchArticles(1)
})

onMounted(() => fetchArticles(1))
</script>

<style scoped>
.article-item { margin-bottom: 40px; }
.article-item h2 { margin-bottom: 10px; }
.pagination { margin-top: 40px; display: flex; gap: 10px; align-items: center; }
button { padding: 5px 15px; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>