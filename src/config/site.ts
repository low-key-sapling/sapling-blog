export const site = {
  name: '青苗手记',
  englishName: 'SAPLING',
  description:
    '记录技术的生长，也留一点空间给好奇心。关于 Web、工程实践与日常创造的个人技术博客。',
  socialImage: '/social-card.png',
  author: {
    name: '博客作者（占位）',
    avatar: '',
    bio: '在这里记录学习、构建与思考。作者资料和站名为示例，请在正式发布前替换。',
  },
  pageSize: 9,
  theme: { light: '#356548', dark: '#a3c9a8' },
  navigation: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/blog/' },
    { label: '项目', href: '/projects/' },
    { label: '工具箱', href: '/tools/' },
    { label: '关于', href: '/about/' },
  ],
  socials: [{ label: 'RSS 订阅', href: '/rss.xml' }],
  giscus: {
    repo: import.meta.env.PUBLIC_GISCUS_REPO,
    repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID,
    category: import.meta.env.PUBLIC_GISCUS_CATEGORY,
    categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID,
  },
  analyticsToken: import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN,
};

export const toolbox = [
  {
    slug: 'json',
    symbol: '{ }',
    title: 'JSON 格式化',
    description: '校验、格式化与压缩 JSON，完整保留大整数和数字精度。',
    tags: '开发 · 数据处理',
  },
  {
    slug: 'base64',
    symbol: 'Aa',
    title: 'Base64 编解码',
    description: '在 UTF-8 文本和 Base64 之间转换，支持中文与 Unicode。',
    tags: '编码 · 文本转换',
  },
  {
    slug: 'timestamp',
    symbol: '↗',
    title: '时间戳转换',
    description: '转换秒、毫秒与日期时间，在北京时间和 UTC 之间切换。',
    tags: '时间 · 调试辅助',
  },
] as const;
