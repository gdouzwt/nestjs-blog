<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider, NLayout, NLayoutHeader, NLayoutContent, NLayoutFooter } from 'naive-ui'
</script>

<template>
  <n-config-provider>
    <n-global-style />
    <n-message-provider>
      
      <n-layout class="layout-container">
        
        <n-layout-header bordered class="header">
          <div class="nav-content">
            <h2 class="logo" @click="$router.push('/')">文桃的技术博客</h2>
            <div class="nav-links">
               </div>
          </div>
        </n-layout-header>

        <n-layout-content content-style="padding: 24px; max-width: 800px; margin: 0 auto; min-height: 80vh;">
          <router-view />
        </n-layout-content>

        <n-layout-footer bordered class="footer">
          <p>© 2025 ZWT's Blog | Powered by NestJS & Docker</p>
        </n-layout-footer>

      </n-layout>

    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
}
.nav-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
}
.footer {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>