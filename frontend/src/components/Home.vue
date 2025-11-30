<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import {
  NGrid, NGridItem, NSkeleton, NEmpty, NResult, NButton,
  NPagination,
} from 'naive-ui'

const router = useRouter()
const posts = ref<any[]>([])
const loading = ref(true)
const error = ref(false)

// 👇👇👇 分页核心逻辑
const page = ref(1)
const pageSize = ref(12) // 12 是网格布局的最佳数字 (能被 2,3,4 整除)
const totalCount = ref(0)

// 🎨 生成随机渐变背景 (模拟封面图)
const getCoverStyle = (id: string) => {
  const colors = [
    ['#ff9a9e', '#fecfef'], ['#a18cd1', '#fbc2eb'], ['#84fab0', '#8fd3f4'],
    ['#cfd9df', '#e2ebf0'], ['#e0c3fc', '#8ec5fc'], ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#667eea', '#764ba2']
  ]
  const index = id.charCodeAt(0) % colors.length

  // 👇 修改这里：解构赋值，并给一个默认值 || colors[0]
  // 👇 加上 "as string[]" 强制类型断言
  const [colorStart, colorEnd] = (colors[index] || colors[0]) as string[]

  return {
    background: `linear-gradient(120deg, ${colorStart} 0%, ${colorEnd} 100%)`,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '2.5rem',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
  }
}

const fetchPosts = async () => {
  try {
    loading.value = true
    error.value = false

    // 发起请求
    const res = await axios.get(`/articles?page=${page.value}&limit=${pageSize.value}`)

    // 🛡️ 健壮的数据解构 (无论你有没有拦截器剥壳，这行都能工作)
    const responseData = res.data?.data || res.data || res

    // 赋值
    posts.value = responseData.items || []
    totalCount.value = responseData.total || 0

  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 📄 翻页事件
const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchPosts()
  // 翻页后平滑回到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPost = (slug: string) => {
  router.push(`/posts/${slug}`)
}

onMounted(fetchPosts)
</script>

<template>
  <div class="home-wrapper">

    <div class="header-section">
      <h2>最新更新</h2>
      <span class="count-badge" v-if="totalCount > 0">{{ totalCount }} 部</span>
    </div>

    <n-result v-if="error" status="500" title="连接超时" description="服务器正在全力加载中...">
      <template #footer><n-button @click="fetchPosts">刷新重试</n-button></template>
    </n-result>

    <n-grid v-else-if="loading" cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="16" :y-gap="24">
      <n-grid-item v-for="n in 8" :key="n">
        <div class="skeleton-card">
          <n-skeleton height="0" style="padding-bottom: 56.25%; border-radius: 8px;" />
          <n-skeleton text style="width: 80%; margin-top: 10px; height: 18px;" />
          <n-skeleton text style="width: 40%; margin-top: 5px;" />
        </div>
      </n-grid-item>
    </n-grid>

    <n-empty v-else-if="posts.length === 0" description="暂无内容" style="margin-top: 100px" />

    <div v-else>
      <n-grid cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="16" :y-gap="24">
        <n-grid-item v-for="post in posts" :key="post.id">

          <div class="video-card" @click="goToPost(post.slug)">

            <div class="cover-box">
              <div :style="getCoverStyle(post.id)">
                {{ post.title.charAt(0).toUpperCase() }}
              </div>

              <div class="badge-duration">
                {{ format(new Date(post.createdAt), 'MM-dd') }}
              </div>

              <div v-if="post.tags && post.tags.length" class="badge-quality">
                {{ post.tags[0].name }}
              </div>
            </div>

            <div class="info-box">
              <h3 class="title" :title="post.title">{{ post.title }}</h3>

              <div class="meta">
                <span class="views">{{ post.views || 0 }} 次观看</span>
                <span class="date">{{ format(new Date(post.createdAt), 'yyyy-MM-dd') }}</span>
              </div>
            </div>

          </div>
        </n-grid-item>
      </n-grid>

      <div class="pagination-box">
        <n-pagination v-model:page="page" :item-count="totalCount" :page-size="pageSize" @update:page="handlePageChange"
          size="medium" />
      </div>
    </div>

  </div>
</template>

<style scoped>
.home-wrapper {
  padding-bottom: 60px;
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.header-section h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #111;
}

.count-badge {
  background: #f0f0f0;
  color: #666;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
}

/* --- 卡片核心样式 --- */
.video-card {
  cursor: pointer;
  group: hover;
  /* 用于后续 hover 效果 */
}

/* 封面容器 16:9 */
.cover-box {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  /* 16:9 比例黑魔法 */
  background: #eee;
  border-radius: 8px;
  /* 现在的流行趋势是圆角 */
  overflow: hidden;
  transition: box-shadow 0.2s;
}

/* 渐变层绝对定位 */
.cover-box>div:first-child {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
}

/* Hover 效果：图片轻微放大 */
.video-card:hover .cover-box>div:first-child {
  transform: scale(1.05);
}

.video-card:hover .title {
  color: #18a058;
  /* Naive Green */
}

/* 角标样式 */
.badge-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  padding: 1px 4px;
  border-radius: 4px;
  font-family: Arial, sans-serif;
}

.badge-quality {
  position: absolute;
  top: 6px;
  left: 6px;
  background: #d03050;
  /* 类似 VIP/HD 的红色 */
  color: white;
  font-size: 0.7rem;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: bold;
  text-transform: uppercase;
}

/* 文字信息 */
.info-box {
  padding-top: 8px;
}

.title {
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0 0 4px 0;
  color: #222;
  /* 限制两行，多出省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
}

/* 分页 */
.pagination-box {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}
</style>