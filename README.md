# 青苗手记 / Sapling Blog

基于 Astro、TypeScript、Tailwind CSS、MDX 与 Pagefind 的静态个人技术博客。React 仅用于浏览器工具与文章中的交互演示。

青苗手记由低调D树苗维护。面向读者的文章放在 `src/content/articles/`，站点维护文档放在 `docs/`。v1 已通过[本地验收](docs/verification.md)，可预览 `dist/` 中的正式构建。示例内容带有单独标记。

## 启动

环境：Node 24 LTS、npm。精确 Node 版本记录在 `.node-version` 和 `.nvmrc`，依赖版本锁定在 `package-lock.json`。

```sh
npm ci
npm run dev
```

Windows 当前全局 Node 版本不足时，使用项目独立环境，不修改全局 Node：

```powershell
./scripts/setup-node.ps1
./scripts/npm.ps1 ci
./scripts/npm.ps1 run dev
```

本机已准备 `.runtime/` 环境，可直接执行最后一条命令。开发地址为 `http://127.0.0.1:4321`。开发模式包含草稿；搜索索引需要正式构建。

```sh
npm run build
npm run preview
```

构建输出为 `dist/`，包含静态页面、优化图片、脚本、中文搜索索引、RSS 与 sitemap。使用普通静态服务器即可部署。

## 常用命令

| 命令                       | 用途                                                         |
| -------------------------- | ------------------------------------------------------------ |
| `npm run dev`              | 含草稿的本地开发预览                                         |
| `npm run check`            | Astro 与 TypeScript 检查                                     |
| `npm test`                 | 工具逻辑与浏览器存储边界测试                                 |
| `npm run build`            | 生成正式静态页面和 Pagefind 索引                             |
| `npm run preview`          | 验证正式产物，包括搜索                                       |
| `npm run test:e2e`         | Chrome 浏览器流程、链接和可访问性检查；先构建                |
| `npm run test:services`    | 在独立产物和 Python 静态服务器上验证服务配置、失败与主题同步 |
| `npm run test:performance` | 对运行中的正式预览执行移动端 Lighthouse                      |
| `npm run verify`           | 类型检查 → 单元测试 → 构建 → 浏览器与服务集成验证            |
| `npm run format`           | 使用 Prettier 格式化源码                                     |
| `npm run format:check`     | 检查格式                                                     |

Windows 可以将上述 `npm` 替换为 `./scripts/npm.ps1`。浏览器测试使用已安装的 Chrome；CI 安装方式见工作流文件。服务集成测试另外需要 Python 3；所有外部请求由测试拦截，不使用真实服务标识。

## 项目结构

```text
src/
  config/site.ts          站点信息、导航、主色与服务配置
  content.config.ts      内容字段校验
  content/articles/      Markdown / MDX 文章和相邻图片
  content/projects/      项目详情和截图
  content/series.json     系列元数据
  content/friends.json    友链
  components/            Astro 组件、React 工具和演示
  layouts/               全站布局与元数据
  lib/                   内容查询、纯工具逻辑、浏览器存储
  scripts/               普通页面的浏览器交互
  pages/                 文件路由
  styles/                设计参数、响应式布局与正文样式
tests/                   单元与浏览器测试
deploy/nginx.conf        静态服务器配置示例
```

## 维护文档

- [写作与发布](docs/writing.md)：内容字段、草稿、图片、系列、项目与友链。
- [组件与配置](docs/components.md)：布局、正文组件、MDX 演示与主题。
- [部署与迁移](docs/deployment.md)：Cloudflare Pages、Nginx、域名、giscus 与统计。
- [验收记录](docs/verification.md)：执行环境、验证结果与仍需发布阶段检查的事项。
- [实施基线](docs/plans/blog-v1-implementation-plan.md)：确认的范围与验收清单。

源码使用 `main` 分支维护，远程 `origin` 指向[青苗手记的 GitHub 仓库](https://github.com/low-key-sapling/sapling-blog)。
