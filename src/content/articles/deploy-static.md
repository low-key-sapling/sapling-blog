---
slug: deploy-static
title: 从本地到静态托管：一次可以重复的发布
summary: 把类型检查、测试和构建串起来，让发布成为可以重复执行的流程。
published: 2026-10-28
category: Web 工程
tags: [Astro, 部署, 工程实践]
series: build-a-digital-garden
order: 3
sample: true
---

这篇示例记录静态站点的发布思路，不代表已经完成公网部署。

## 构建之前，统一环境

使用固定的 Node 主版本，提交 npm 锁文件。在持续集成中运行 `npm ci`，让本地与部署环境安装同一份依赖。

```sh
npm ci
npm run check
npm test
npm run build
```

## 检查最终产物

搜索索引在页面生成后构建，因此需要在静态预览中验证。检查正文、项目详情、RSS 与 sitemap，确认草稿没有进入输出目录。

## 迁移时带走什么

保留源码和内容的 Git 历史，部署时上传完整 `dist/` 目录。更换域名需要重新设置站点地址并构建，稳定的文章路径不变。

## 发布后的检查

正式上线后再验证真实域名、评论与统计服务，并用实际访问网络检查加载表现。本地测试不能代替公网验证。
