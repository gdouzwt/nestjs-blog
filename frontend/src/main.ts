import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios' // 👈 引入 axios
import 'highlight.js/styles/atom-one-dark.min.css' // 换个好看的 CSS
import App from './App.vue'
import Home from './components/Home.vue'
import Post from './components/Post.vue'

// 1. 配置 Axios 全局拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    // 判断是不是 429 Too Many Requests
    if (error.response && error.response.status === 429) {
      alert('🚫 手速太快啦！系统开启了限流保护，请休息一分钟再试。');
      // 可以选择不抛出错误，返回一个空结构，防止页面崩溃
      // return Promise.resolve({ data: { data: { items: [] } } }); 
    }
    return Promise.reject(error);
  }
);

axios.defaults.baseURL = '/api';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/posts/:slug', component: Post }
  ]
})

createApp(App).use(router).mount('#app')