# 博客 v1 本地验收记录

2026-11-06，v1 本地验收通过。正式产物在 `dist/`；本轮使用示例域名 `https://example.com`，未配置真实评论或统计，未执行公网发布。

## 环境与结果

Windows 10 专业版 x64，项目 Node 24.22.2、npm 11.19.1；Astro 7.4.5、Pagefind 1.6.0、Playwright 1.64.1、本机 Chrome 156.0.8078.74、Python 3.12.10。

| 检查           | 本轮结果                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 格式与类型     | Prettier 通过；Astro 检查 52 个文件，0 errors、0 warnings、0 hints。                                                                                 |
| 单元测试       | 59/59 通过。覆盖 JSON 精度与非法输入、UTF-8 Base64、时间转换及浏览器存储异常。                                                                       |
| 正式构建       | 52 个 HTML 页面（含 404）、4 个优化 WebP；Pagefind 索引 17 页：10 篇文章、2 个项目、3 个工具、关于和友链。                                           |
| 主浏览器套件   | 19/19 通过。覆盖站内链接与资源、分页、系列、键盘导航与搜索、无 JavaScript 阅读、主题、收藏与续读、工具、Mermaid、公式和 React 演示。                 |
| 布局与可访问性 | 首页、普通文章、JSON 工具在 390／768／1440 px、明暗两种主题下的 18 个场景均无页面横向溢出；axe 的 WCAG 2 A/AA 与 2.1 AA 规则未报告违规，截图已复核。 |
| 服务模拟       | 2/2 通过。独立构建由 Python 静态服务器提供；使用测试标识并拦截 giscus、统计请求。验证加载失败仍可阅读和使用工具、按需加载、稳定路径映射及主题同步。  |
| 依赖           | npm 将 `chrome-launcher` 和 `unist-util-visit` 归入开发依赖，`@types/node` 锁定为 24.19.2；本次安装审计报告 0 个已知漏洞。                           |

## 内容与产物核对

- **地址和分页**：在临时副本中，内容校验拒绝了字符串 slug `"2"`。保留 slug、同时改动文件名和标题，原文章地址仍有效。将公开文章增至 51 篇后，用相同浏览器用例验证了 6 页（9/9/9/9/9/6）及 RSS 最新 50 篇，最早一篇未进入订阅。正式内容仍为 10 篇公开文章、1 篇草稿。
- **草稿和搜索**：开发模式的草稿详情返回 200 并带 `noindex`，正式预览同路径返回 404。全部 17 个索引片段的 URL 均属于预期内容；检查了草稿标记和应排除的导航、评论、表单、收藏控件文本。在“全部内容”中精确搜索 `"DRAFT_ONLY_SENTINEL_7F31"` 无结果，同一查询在刻意包含该标记的临时索引中有结果。未加引号的 `draft` 可以匹配公开文章的代码示例。
- **阅读和项目**：实测手机宽度下用 Enter 展开原生菜单、用 Tab 进入导航并用 Enter 打开项目页。另核对了分类与标签归属、归档月份、系列前后篇、正文目录跳转与进度条，以及项目示例的源码／演示链接目标和窄屏截图显示。
- **订阅和元数据**：10 条 RSS 的摘要及链接与正式文章一致，发布日期倒序。52 页的 canonical、Open Graph 地址与本地分享图片核对通过；sitemap 恰好包含 49 个可索引页面，robots 指向 sitemap 索引。

## 移动端性能

Lighthouse 13.5.0，对 `127.0.0.1:4321` 的最终正式预览各运行一次。使用移动端模拟（412×823，模拟 RTT 150 ms、吞吐量 1638.4 Kbps、CPU 减速 4 倍）。目标为性能 ≥90、可访问性 ≥95。

| 页面                                 | 性能 | 可访问性 | 最佳实践 | SEO |   LCP | CLS |  TBT |
| ------------------------------------ | ---: | -------: | -------: | --: | ----: | --: | ---: |
| 首页 `/`                             |  100 |      100 |      100 | 100 | 1.2 s |   0 | 0 ms |
| 普通文章 `/blog/reading-experience/` |   99 |      100 |      100 | 100 | 1.7 s |   0 | 0 ms |

Vite 仍提示部分构建分块超过 500 kB；两份报告的实际请求均未加载 Mermaid。上述分数是本地实验室测量，不代表公网访问表现。

## 复现与报告

在项目根目录、端口 4321 和 4322 空闲时执行。Windows 可使用已准备好的项目 Node：

```powershell
$env:ASTRO_TELEMETRY_DISABLED = '1'
$env:CI = '1'
./scripts/npm.ps1 run format:check
./scripts/npm.ps1 run verify
./scripts/npm.ps1 run preview -- --port 4321
```

`verify` 依次执行类型检查、单测、正式构建（含 Pagefind）、主浏览器和服务模拟。服务模拟单独构建到 `.runtime/services-dist/`，在端口 4322 串行运行两个用例。保持正式预览开启，在另一个 PowerShell 窗口执行：

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
./scripts/npm.ps1 run test:performance
```

本次完整验证日志为 `.runtime/verify.log`，边界样本结果为 `.runtime/content-boundaries.log`。截图位于 `.runtime/screenshots/`；性能报告位于 `.runtime/lighthouse/`（`home.html`、`article.html`、对应 JSON 与 `summary.json`）。这些是本机验证产物，不随源码提交。

## 发布阶段待验

真实域名下的 HTTPS、RSS、sitemap 与分享卡片；真实 GitHub Discussions 的登录和评论；Cloudflare Web Analytics 面板收数；托管部署及中国大陆公网可达性和性能。操作步骤见[部署与迁移](deployment.md)。
