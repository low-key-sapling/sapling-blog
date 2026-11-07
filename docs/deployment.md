# 部署与迁移

当前交付仅在本地验证，未创建托管账户、绑定域名或执行公网发布。所有部署方式使用同一份 `dist/` 静态产物。

## 发布前配置

1. 在 `src/config/site.ts` 替换示例站名、作者资料和社交链接。
2. 设置 `PUBLIC_SITE_URL=https://你的域名`。本地默认 `https://example.com` 只是生成 canonical、RSS、sitemap 和分享信息的占位地址。
3. 替换、删除或继续明确标注示例文章、项目和友链。
4. 可选配置 giscus 与统计；未配置时不请求外部服务。
5. 执行 `npm run verify`，再用静态预览核对实际内容。

## Cloudflare Pages Git 部署

按 [Cloudflare 官方 Astro 部署指南](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) 连接自己的 Git 仓库并创建 Pages 项目。

| 设置              | 值                                           |
| ----------------- | -------------------------------------------- |
| 框架              | Astro                                        |
| 仓库根目录        | 本项目根目录                                 |
| 构建命令          | `npm run check && npm test && npm run build` |
| 输出目录          | `dist`                                       |
| `NODE_VERSION`    | 与 `.node-version` 一致，当前为 `24.22.2`    |
| `PUBLIC_SITE_URL` | 正式 HTTPS 站点地址                          |

提交 `package-lock.json`，使用 npm 安装锁定依赖。生产与预览环境分别填写自己的构建变量。Pagefind 必须在 Astro 之后生成，不能将构建命令简化为单独的 `astro build`。

`public/_headers` 提供哈希资源缓存规则。搜索入口文件不使用长期不可变缓存，避免发布后页面与搜索索引版本不同。根目录的 `404.html` 用于不存在的路径，不把所有未知 URL 重写成首页。

首次上线后检查 HTTPS、文章路径、中文搜索、RSS 和 sitemap。实际中国大陆网络速度及可达性需要在发布环境验证。

## 自有服务器与 Nginx

1. 在构建机器用 Node 24 执行 `npm ci` 和 `npm run verify`。
2. 将完整 `dist/` 上传到服务器的一次性发布目录，例如 `/srv/sapling/releases/2026-11-05/`。
3. 将 `deploy/nginx.conf` 中的域名和根路径替换为自己的值。
4. 运行 `nginx -t`，成功后重新加载 Nginx。
5. 使用现有反向代理或证书管理方案配置 HTTPS，再验证功能。

提供的 Nginx 配置是 HTTP 静态托管示例；证书路径与 TLS 配置由服务器实际环境决定。不要给 `.html` 或 Pagefind 入口文件设置永久缓存。带哈希的 `_astro/` 资源可以长期缓存。

切换版本时让 Nginx 的站点根目录或软链接指向新的完整产物，保留上一份目录便于回退。不要只复制 HTML 而漏掉搜索索引、字体或脚本。

## giscus

根据 [giscus 配置页](https://giscus.app/zh-CN) 准备公开仓库，启用 Discussions，并安装 giscus App。把生成的公开参数写入构建环境：

```dotenv
PUBLIC_GISCUS_REPO=owner/repository
PUBLIC_GISCUS_REPO_ID=从配置页获取
PUBLIC_GISCUS_CATEGORY=Announcements
PUBLIC_GISCUS_CATEGORY_ID=从配置页获取
```

四项齐全后，只在文章页接近评论区域时加载。使用 `specific` 映射，明确把稳定路径 `/blog/<slug>/` 作为 `term`，开启严格匹配。换域名和改标题不改变讨论关联；不要随意更改已发布文章的 `slug`。

主题通过 giscus 的消息接口同步。脚本失败时显示提示，正文可继续阅读。真实评论的登录、发表及主题同步仍需正式仓库配置后的公网验收。

## Cloudflare Web Analytics

参考 [Web Analytics 官方接入说明](https://developers.cloudflare.com/web-analytics/get-started/)，添加正式域名，从提供的嵌入代码取出 token：

```dotenv
PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=公开的站点统计标识
```

构建后页面会独立延迟加载统计脚本。此项目不主动上报搜索词、工具输入或收藏内容，搜索也不把查询词写进 URL。统计只由站主在 Cloudflare 面板查看，不展示公开阅读量。

如果 Pages 已启用自动注入 Web Analytics，请关闭自动注入或留空本项目 token，避免重复加载。迁移到 Nginx 后仍可使用同样的手工脚本接入方式。

## 域名迁移

修改 `PUBLIC_SITE_URL` 后重新构建并部署，文章和项目路径保持不变。旧域名可在托管层做逐路径 301 跳转。验证 canonical、Open Graph、RSS、sitemap 的域名，并重新确认统计域名和 giscus 允许来源配置。

收藏和阅读位置属于浏览器源内的本地数据，域名变更后不会自动迁移；这是浏览器本地存储的范围限制。正文、图片与索引可以随静态产物一起迁移。
