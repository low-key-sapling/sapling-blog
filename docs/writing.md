# 写作与内容维护

## 创建文章

在 `src/content/articles/` 新建 Markdown 或 MDX 文件。可以为每篇文章建立独立目录，把正文和图片放在一起。

```yaml
---
slug: a-stable-article-id
title: 文章标题
summary: 说明这篇文章解决什么问题。
published: 2026-11-05
updated: 2026-11-06
category: Web 工程
tags: [Astro, 工程实践]
series: build-a-digital-garden
order: 4
cover: ./cover.png
coverAlt: 页面结构示意图
draft: true
featured: false
sample: false
---
```

`slug`、标题、摘要、发布日期、分类和至少一个标签必填。文章和项目的 `slug` 必须以小写英文字母开头，此后可用小写字母和数字，词段之间用单个连字符，例如 `astro-2`。纯数字路径（如 `/blog/2/`）留给分页。发布后保持 `slug` 不变，修改标题或文件名不会改变 `/blog/<slug>/` 地址。

`updated`、系列、顺序和封面可省略。加入系列时必须提供正整数 `order`；同一系列顺序不能重复。更新日期不能早于发布日期。`sample: true` 会显示示例标记，正式文章通常省略。

日期建议使用 `YYYY-MM-DD`，页面按 UTC 日期显示，避免不同构建主机时区改变发布日期。未来日期不自动隐藏：本项目采用手动发布，暂不支持定时发布。

## 草稿与发布

1. 保持 `draft: true`，在 `npm run dev` 中预览。
2. 完成文字、代码、图片替代文字和链接检查。
3. 修改为 `draft: false`，运行 `npm run verify`。
4. 用 `npm run preview` 检查正式页面和搜索。
5. 提交源码、图片和锁文件，再由托管平台从 Git 构建。

新增普通文章无需修改分页和 RSS 测试：它们按正式构建中的文章详情页数及归档顺序核对结果。替换或移除验收使用的示例文章、系列或项目时，同步调整 `tests/browser/` 中引用该示例的用例。

正式构建的公共内容查询会排除草稿，详情、分类、标签、归档、系列与列表共用该入口。搜索索引读取正式 HTML；RSS 和 sitemap 也只包含公开内容。草稿不提供线上私密预览。

文章页面不要直接使用原始 `getCollection('articles')` 绕过可见性规则；从 `src/lib/content.ts` 使用 `getArticles()`。新增需要文章数据的页面也遵守这一入口。

## 图片

正文用相对路径引用图片：

```md
![流程图的文字描述](./images/workflow.png)
```

Astro 在构建时处理本地正文图片。封面由 `Cover.astro` 的 `Image` 组件生成响应式 WebP 资源。无封面时使用同源的矢量默认封面。内容性图片需要准确的替代文字；纯装饰可以留空。避免依赖不受控的远程图床。

## 系列

在 `src/content/series.json` 添加唯一 `id`、`title` 与 `description`，然后在文章中通过 `series` 引用其标识并填写 `order`。目录按 `order` 排序，与发布日期无关。系列上一篇、下一篇只包含当前环境可见的文章；没有公开文章的系列不生成正式目录页。

## Markdown 与 MDX

普通文章优先用 `.md`。代码使用带语言的 fenced code block，自动提供 Shiki 高亮、行号和复制按钮。GFM 表格和引用开箱可用；行内公式使用 `$...$`，独立公式使用 `$$...$$`。

需要提示块、Mermaid 或 React 演示时使用 `.mdx`，见[组件说明](components.md)。Markdown 和 MDX 共用 unified、remark-math、rehype-katex 与 Shiki 配置。

## 项目与友链

`src/content/projects/` 中的项目正文使用 Markdown/MDX。必填 `slug`、`name`、`summary`、`stack`；可选 `cover`、`source`、`demo` 和 `sample`。项目路径为 `/projects/<slug>/`。截图可使用正文的相对图片路径。没有公开源码或演示就省略对应字段，不使用无效占位链接。

友链存放于 `src/content/friends.json`，每条包含唯一 `id`、`name`、`url`、`description`，可选 `avatar` 和 `sample`。头像优先使用 `public/` 内的本地资源；省略时显示文字头像。

## RSS 与搜索

RSS 输出最近 50 篇已发布文章的摘要、发布时间、标签和原文链接，不含完整正文。Pagefind 在构建后索引文章、项目详情、工具介绍、关于和友链。列表、导航、表单、评论与收藏状态不进入索引。

新增可搜索页面时，在内容容器使用 `data-pagefind-body`，提供 `title` 元数据和 `type` 过滤值。参考现有工具详情页，不把交互表单放进索引区域。
