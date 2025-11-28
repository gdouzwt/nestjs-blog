<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { NCard, NSpace, NTag, NSkeleton, NButton, NEmpty, NResult } from 'naive-ui'

const router = useRouter()
const posts = ref<any[]>([])
const loading = ref(true) // 👈 加载状态
const error = ref(false)

const fetchPosts = async () => {
  try {
    loading.value = true
    error.value = false
    // ✅ 这里的接口已经在之前的对话中修好了
    const res = await axios.get('/articles?page=1&limit=10')
    posts.value = res.data.data?.items || []
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
}

const goToPost = (slug: string) => {
  router.push(`/posts/${slug}`)
}

onMounted(fetchPosts)
</script>

<template>
  <div class="home-container">
    <div class="welcome-banner">
      <h1>探索技术的边界</h1>
      <p>记录后端架构、容器化与全栈开发的思考</p>
    </div>

    <n-result v-if="error" status="500" title="服务器开小差了" description="请检查网络或稍后再试">
      <template #footer>
        <n-button @click="fetchPosts">重试</n-button>
      </template>
    </n-result>

    <n-space vertical v-else-if="loading">
      <n-card v-for="n in 3" :key="n" style="margin-bottom: 12px">
        <n-skeleton text style="width: 60%" />
        <n-skeleton text :repeat="2" />
      </n-card>
    </n-space>

    <n-empty v-else-if="posts.length === 0" description="暂无文章，博主正在努力码字中..." />

    <n-space vertical v-else>
      <n-card 
        v-for="post in posts" 
        :key="post.id" 
        :title="post.title" 
        hoverable 
        class="post-card"
        @click="goToPost(post.slug)"
      >
        <template #header-extra>
          <n-tag type="success" size="small">
             {{ format(new Date(post.createdAt), 'yyyy-MM-dd') }}
          </n-tag>
        </template>
        
        <p class="summary">{{ post.summary }}</p>
        
        <template #footer>
          <n-space>
             <n-tag v-for="tag in post.tags" :key="tag.id" size="tiny" :bordered="false" type="info">
              #{{ tag.name }}
            </n-tag>
          </n-space>
        </template>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.welcome-banner {
  margin-bottom: 30px;
  text-align: center;
}
.post-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.post-card:hover {
  transform: translateY(-2px);
}
.summary {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>