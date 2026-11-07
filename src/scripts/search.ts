interface SearchData {
  url: string;
  excerpt: string;
  meta: { title: string; type: string };
}
interface SearchResult {
  data: () => Promise<SearchData>;
}
interface Pagefind {
  search: (
    query: string,
    options: { filters: Record<string, string> },
  ) => Promise<{ results: SearchResult[] }>;
}

const panel = document.querySelector<HTMLElement>('[data-search-panel]')!;
const form = panel.querySelector<HTMLFormElement>('form')!;
const input = panel.querySelector<HTMLInputElement>('input')!;
const filter = panel.querySelector<HTMLSelectElement>('select')!;
const status = panel.querySelector<HTMLElement>('[data-search-status]')!;
const list = panel.querySelector<HTMLUListElement>('[data-search-results]')!;
const more = panel.querySelector<HTMLButtonElement>('[data-search-more]')!;
let engine: Promise<Pagefind> | undefined;
let results: SearchResult[] = [];
let count = 0;
let request = 0;

async function appendResults(version: number) {
  more.disabled = true;
  const next = await Promise.all(
    results.slice(count, count + 12).map((result) => result.data()),
  );
  if (version !== request) return;
  for (const result of next) {
    const item = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = result.url;
    const type = document.createElement('span');
    type.className = 'eyebrow green';
    type.textContent = result.meta.type;
    const title = document.createElement('strong');
    title.textContent = result.meta.title;
    const excerpt = document.createElement('p');
    excerpt.textContent = new DOMParser().parseFromString(
      result.excerpt,
      'text/html',
    ).body.textContent;
    anchor.append(type, title, excerpt);
    item.append(anchor);
    list.append(item);
  }
  count += next.length;
  more.hidden = count >= results.length;
  more.disabled = false;
}

async function search() {
  const version = ++request;
  list.replaceChildren();
  more.hidden = true;
  count = 0;
  const query = input.value.trim();
  if (!query) {
    status.textContent = '输入关键词，发现一些新线索。';
    return;
  }
  status.textContent = '正在查找…';
  try {
    const path = '/pagefind/pagefind.js';
    engine ??= import(/* @vite-ignore */ path) as Promise<Pagefind>;
    const pagefind = await engine;
    const response = await pagefind.search(query, {
      filters: filter.value ? { type: filter.value } : {},
    });
    if (version !== request) return;
    results = response.results;
    status.textContent = results.length
      ? `找到 ${results.length} 条结果`
      : '没有找到相关内容，试试更短的关键词。';
    await appendResults(version);
  } catch {
    if (version !== request) return;
    engine = undefined;
    status.textContent = import.meta.env.DEV
      ? '搜索索引在构建后生成，请运行 npm run build 和 npm run preview。'
      : '搜索暂时不可用，请稍后重试。';
  }
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  void search();
});
filter.addEventListener('change', () => void search());
more.addEventListener('click', () => {
  void appendResults(request).catch(() => {
    status.textContent = '加载失败，请重试搜索。';
    more.disabled = false;
  });
});
