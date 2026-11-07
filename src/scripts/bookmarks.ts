import { readState, toggleBookmark } from '@/lib/storage';
import { toast } from './site';

interface IndexedArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
}
const articles: IndexedArticle[] = JSON.parse(
  document.querySelector('#article-index')!.textContent!,
);
const list = document.querySelector('#bookmark-list')!;
const empty = document.querySelector<HTMLElement>('#bookmarks-empty')!;
function render() {
  const state = readState();
  list.replaceChildren();
  empty.hidden = state.bookmarks.length > 0;
  for (const id of [...state.bookmarks].reverse()) {
    const article = articles.find((entry) => entry.id === id);
    const item = document.createElement('article');
    item.className = 'bookmark-item';
    const content = document.createElement('div');
    const heading = document.createElement('h2');
    if (article) {
      const link = document.createElement('a');
      link.href = article.url;
      link.textContent = article.title;
      heading.append(link);
    } else heading.textContent = '这篇文章已移除';
    const summary = document.createElement('p');
    summary.textContent =
      article?.summary ?? `失效记录：${id}。可以移除此收藏。`;
    content.append(heading, summary);
    if (article && state.positions[id]) {
      const position = document.createElement('p');
      position.textContent = `上次阅读到 ${Math.round(state.positions[id].progress * 100)}%`;
      content.append(position);
    }
    const remove = document.createElement('button');
    remove.className = 'button secondary';
    remove.textContent = '移除收藏';
    remove.setAttribute('aria-label', `移除收藏：${article?.title ?? id}`);
    remove.addEventListener('click', () => {
      if (toggleBookmark(id)) {
        render();
        toast('已移除收藏');
      } else toast('浏览器存储不可用，无法移除收藏。');
    });
    item.append(content, remove);
    list.append(item);
  }
}
render();
window.addEventListener('storage', render);
