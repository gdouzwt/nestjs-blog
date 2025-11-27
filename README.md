## 项目介绍

[新的技术博客](https://zwt.io) 使用 NestJS 和 Vue3 构建

## 启动运行

后端，在根目录

```bash
$ npm install
```

前端，则要进入 `frontend` 子目录，然后

```bash
$ npm install
```

## 数据库和Redis

使用 docker
数据库 PostgreSQL 18.1
用户 postgres
密码 se1124
库 blog

Redis 最新版本 8.4

## 先运行代码，让 ORM 框架创建表

```bash
$ npm run start:dev
```

## 然后导入 Markdown 文件内容

```bash
npx ts-node scripts/import-posts.ts
```

不过这个首先要安装

```bash
npm install gray-matter
```

## 本地运行测试

根目录：

```bash
npm run start:dev
```

前端子目录：

```bash
cd frontend && npm run dev
```
