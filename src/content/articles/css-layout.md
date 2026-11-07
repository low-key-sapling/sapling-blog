---
slug: css-layout
title: 用 Grid 整理一个安静的页面
summary: 从内容关系出发，用少量布局规则适配不同屏幕。
published: 2026-10-12
category: 设计与体验
tags: [CSS, 响应式]
sample: true
---

本篇是响应式布局的简短示例。卡片、正文和侧栏不必使用同一套布局规则。

## 把关系交给布局

```css
.article-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}
```

`minmax(0, 1fr)` 允许列收缩，避免长内容把整个布局撑开。长代码仍应在自己的容器中滚动。

## 在窄屏上重新排序

手机上把侧栏目录放到正文前面，给正文完整宽度。页面结构仍保持合理顺序，让键盘和辅助技术也能理解。
