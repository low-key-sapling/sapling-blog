import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

const slug = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
    '标识须以小写英文字母开头，仅使用小写字母、数字和分隔词段的连字符',
  );
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z
      .object({
        slug,
        title: z.string().min(1),
        summary: z.string().min(1),
        published: z.coerce.date(),
        updated: z.coerce.date().optional(),
        category: z.string().min(1),
        tags: z.array(z.string().min(1)).min(1),
        series: reference('series').optional(),
        order: z.number().int().positive().optional(),
        cover: image().optional(),
        coverAlt: z.string().default(''),
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),
        sample: z.boolean().default(false),
      })
      .refine(
        (data) => !data.series || data.order !== undefined,
        '系列文章必须指定 order',
      )
      .refine(
        (data) => !data.updated || data.updated >= data.published,
        '更新日期不能早于发布日期',
      ),
});

const series = defineCollection({
  loader: file('src/content/series.json'),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      slug,
      name: z.string().min(1),
      summary: z.string().min(1),
      stack: z.array(z.string()).min(1),
      cover: image().optional(),
      source: z.url().optional(),
      demo: z.url().optional(),
      sample: z.boolean().default(false),
    }),
});

const friends = defineCollection({
  loader: file('src/content/friends.json'),
  schema: z.object({
    name: z.string().min(1),
    url: z.url(),
    description: z.string().min(1),
    avatar: z.string().optional(),
    sample: z.boolean().default(false),
  }),
});

export const collections = { articles, series, projects, friends };
