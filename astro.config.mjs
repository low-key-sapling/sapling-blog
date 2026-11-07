import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { loadEnv } from 'vite';
import rehypeAccessibleContent from './src/plugins/rehype-accessible-content.mjs';

const env = loadEnv(
  process.env.NODE_ENV ?? 'production',
  process.cwd(),
  'PUBLIC_',
);

export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'https://example.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    react(),
    sitemap({ filter: (url) => !/\/(bookmarks|search)\/$/.test(url) }),
  ],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeAccessibleContent],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
  devToolbar: { enabled: false },
});
