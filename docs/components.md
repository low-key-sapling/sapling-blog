# 组件与站点配置

## 站点配置

在 `src/config/site.ts` 修改站名、英文标识、作者简介、导航、社交链接、分页大小与主题强调色。明暗主题分别提供强调色，修改后需验证文字与背景对比度。

布局和新页面直接通过 Astro 组件扩展，不引入插件注册层。设计参数位于 `src/styles/global.css` 的 CSS 变量，Tailwind CSS 4 通过 Vite 插件提供工具类。

环境变量见根目录 `.env.example`。复制为 `.env` 后填写域名或服务公开标识。所有 `PUBLIC_` 值可能被写入静态页面，不应放密码或访问令牌。giscus 的仓库和分类 ID、Cloudflare Web Analytics token 都是嵌入前端所需的公开配置。

## 新增页面

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import PageHeading from '@/components/PageHeading.astro';
---

<BaseLayout title="新页面" description="页面的简短说明">
  <div class="container page-content">
    <PageHeading
      eyebrow="A NEW PAGE"
      title="新页面"
      description="介绍这页的用途。"
    />
    <p>页面内容。</p>
  </div>
</BaseLayout>
```

`BaseLayout` 提供主题、主导航、搜索对话框、页脚、canonical、RSS 链接和分享元数据。`noindex` 用于收藏、搜索、404 与本地草稿。站点部署在域名根路径，首版不支持子目录 `base` 部署。

## 提示块

```mdx
import Callout from '@/components/Callout.astro';

<Callout title="一个提示">这里写补充说明。</Callout>

<Callout title="需要留意" tone="warning">
  这里写与当前操作直接相关的限制。
</Callout>
```

## Mermaid

```mdx
import Mermaid from '@/components/Mermaid.astro';

<Mermaid
  caption="从写作到发布"
  chart={`flowchart LR
    A[写作] --> B[构建]
    B --> C[发布]`}
/>
```

只有使用该组件的页面加载 Mermaid。图表使用严格模式，支持主题切换，保留可展开的源码；加载失败时可阅读源码。`caption` 必填，描述图表的意义。

## React 交互演示

在 `src/components/demos/` 编写类型明确的 React 组件，再从 MDX 导入。普通演示优先用 `client:visible`；需要立即交互的工具使用 `client:load`。客户端状态只处理当前交互，不借用收藏存储保存工具输入。

完整示例：`src/content/articles/mdx-interactions.mdx` 和 `src/components/demos/GrowthDemo.tsx`。

```mdx
import GrowthDemo from '@/components/demos/GrowthDemo';

<GrowthDemo client:visible />
```

这是作者预先编写的演示组件，不是读者可编辑、执行任意代码的 Playground。

## 普通页面交互

`src/scripts/site.ts` 维护主题、搜索对话框与复制提示；`article.ts` 维护目录、进度、复制和续读。使用原生 DOM 事件，无前端路由器或全站 React 状态树。

`src/lib/storage.ts` 是收藏和进度的唯一浏览器存储边界。存储键为 `sapling:reading:v1`，记录文章固定标识、进度比例与更新时间。读写不可用时返回空状态或失败结果，调用页面提供必要反馈。失效收藏在收藏页可移除；续读由读者确认后恢复。

## 依赖约定

不手工修改 `package-lock.json`。使用 Node 24 执行 npm 安装并提交锁文件。项目统一覆盖 KaTeX 到已安装版本，使数学解析与渲染使用同一版本，避免多个旧版本混入构建。性能工具固定在 Lighthouse 13.5.0，更新时重新检查依赖与验收结果。

构建使用 `astro build --force`，保证自定义 rehype 插件修改后重新渲染 Markdown。Astro 的内容缓存不会总是因插件实现变化而失效，这个小站优先保证每次正式构建可重复。

Markdown 渲染依据 [Astro unified 接口](https://docs.astro.build/en/reference/markdown-processors/unified/)，内容校验依据 [Content Collections](https://docs.astro.build/en/guides/content-collections/)。Pagefind 的 npm CLI 默认使用支持中文分词的扩展构建，见[多语言说明](https://pagefind.app/docs/multilingual/)。
