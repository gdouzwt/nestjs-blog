<template>
  <div class="container">
    <header>
      <h1><router-link to="/">ZWT's Blog</router-link></h1>
      <p>NestJS + Vue3 重构实战</p>
    </header>
    <hr/>
    <router-view></router-view>
  </div>
</template>

<style>
/* 偷懒大法：直接用简单的样式，或者引入 MVP.css */
.container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, sans-serif; }
header h1 a { text-decoration: none; color: #333; }
a { color: #0070f3; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>