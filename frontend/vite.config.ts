import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // 👇👇👇 新增 server 配置
  server: {
    host: '0.0.0.0', // 允许局域网访问 (可选)
    port: 5173,      // 指定端口 (可选，默认就是 5173)
    
    // 核心：本地代理配置 (相当于本地的 Nginx)
    proxy: {
      '/api': {
        // 目标地址：你本地启动的 NestJS 后端地址
        // 如果你的后端是在 Docker 里跑的，且映射了 3721:3721，这里也是 localhost:3721
        // 如果你是 npm run start:dev 跑的，也是 localhost:3721
        target: 'http://localhost:3721', 
        
        changeOrigin: true, // 允许跨域
        
        // 路径重写：如果后端 Controller 本身就有 /api 前缀 (你设置了 setGlobalPrefix)，那就不需要 rewrite
        // 如果后端没有 /api 前缀，需要把 /api 去掉。
        // 根据你的代码：app.setGlobalPrefix('api')，所以后端是认 /api 的，不需要 rewrite！
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})