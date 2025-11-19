import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css' // 保持默认样式，或者一会儿我们换个好看的 CSS
import App from './App.vue'
import Home from './components/Home.vue'
import Post from './components/Post.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/posts/:slug', component: Post }
  ]
})

createApp(App).use(router).mount('#app')