import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

export async function getArticles() {
  const articles = await getCollection(
    'articles',
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  const seriesOrders = new Set<string>();
  for (const article of articles) {
    if (article.data.series) {
      const key = `${article.data.series.id}:${article.data.order}`;
      if (seriesOrders.has(key)) throw new Error(`系列顺序重复：${key}`);
      seriesOrders.add(key);
    }
  }
  return articles.sort(
    (a, b) =>
      b.data.published.valueOf() - a.data.published.valueOf() ||
      a.id.localeCompare(b.id),
  );
}

export const articleUrl = (article: Article) => `/blog/${article.id}/`;
export const taxonomyUrl = (kind: 'tags' | 'categories', value: string) =>
  `/${kind}/${encodeURIComponent(value)}/`;
export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  })
    .format(date)
    .replaceAll('/', '.');
export const readingMinutes = (body: string = '') =>
  Math.max(1, Math.ceil(body.replace(/\s/g, '').length / 450));
