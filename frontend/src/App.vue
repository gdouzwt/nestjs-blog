<template>
  <div class="container">
    <header>
      <div class="brand">
        <h1><router-link to="/">文桃的技术博客</router-link></h1>
        <p>NestJS + Vue3 重构实战</p>
      </div>

      <div class="search-box">
        <input type="text" v-model="keyword" @keyup.enter="handleSearch" placeholder="Search articles..." />
      </div>
    </header>
    <hr />

    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')

const handleSearch = () => {
  if (keyword.value.trim()) {
    // 跳转到首页，带上查询参数
    router.push({ path: '/', query: { q: keyword.value } })
    // 清空输入框（可选）
    // keyword.value = '' 
  } else {
    router.push('/')
  }
}
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, sans-serif;
}

/* Header 布局调整 */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

header h1 {
  margin: 0;
  font-size: 1.8rem;
}

header h1 a {
  text-decoration: none;
  color: #333;
}

header p {
  margin: 5px 0 0;
  color: #666;
  font-size: 0.9rem;
}

/* 搜索框样式 */
.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  width: 200px;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #0070f3;
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
  width: 250px;
  /* 聚焦变长特效 */
}

a {
  color: #0070f3;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>