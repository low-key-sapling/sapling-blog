import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '@/config/site';
import { getArticles, articleUrl } from '@/lib/content';

export async function GET(context: APIContext) {
  const articles = (await getArticles()).filter(
    (article) => !article.data.draft,
  );
  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items: articles.slice(0, 50).map((article) => ({
      title: article.data.title,
      pubDate: article.data.published,
      description: article.data.summary,
      link: articleUrl(article),
      categories: article.data.tags,
    })),
    customData: '<language>zh-CN</language>',
  });
}
