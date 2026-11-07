import { readState, savePosition, toggleBookmark } from '@/lib/storage';
import { copyText, toast } from './site';

const id =
  document.querySelector<HTMLElement>('[data-article-id]')!.dataset.articleId!;
const body = document.querySelector<HTMLElement>('#article-body')!;
const progress =
  document.querySelector<HTMLProgressElement>('#reading-progress')!;
const bookmark = document.querySelector<HTMLButtonElement>('#bookmark-button')!;
const prompt = document.querySelector<HTMLElement>('#resume-prompt')!;
const saved = readState().positions[id];
const syncBookmark = () => {
  const active = readState().bookmarks.includes(id);
  bookmark.setAttribute('aria-pressed', String(active));
  bookmark.querySelector('span')!.textContent = active ? '已收藏' : '收藏文章';
};
syncBookmark();
bookmark.addEventListener('click', () => {
  const success = toggleBookmark(id);
  syncBookmark();
  toast(
    success
      ? readState().bookmarks.includes(id)
        ? '已加入收藏'
        : '已取消收藏'
      : '浏览器存储不可用，无法保存收藏。',
  );
});
window.addEventListener('storage', syncBookmark);

function bounds() {
  return {
    top: body.getBoundingClientRect().top + window.scrollY,
    distance: Math.max(1, body.offsetHeight - window.innerHeight),
  };
}
function currentProgress() {
  const { top, distance } = bounds();
  return Math.min(1, Math.max(0, (window.scrollY - top) / distance));
}
if (saved && saved.progress > 0.05 && saved.progress < 0.95) {
  prompt.hidden = false;
  document.querySelector('#resume-label')!.textContent =
    `上次读到约 ${Math.round(saved.progress * 100)}%，要从那里继续吗？`;
}
document.querySelector('#resume-reading')!.addEventListener('click', () => {
  prompt.hidden = true;
  const { top, distance } = bounds();
  window.scrollTo({
    top: top + distance * saved.progress,
    behavior: 'instant',
  });
});
document.querySelector('#dismiss-resume')!.addEventListener('click', () => {
  prompt.hidden = true;
  savePosition(id, 0);
});
let timer: ReturnType<typeof setTimeout>;
window.addEventListener(
  'scroll',
  () => {
    progress.value = currentProgress();
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (prompt.hidden) savePosition(id, currentProgress());
    }, 350);
  },
  { passive: true },
);
window.addEventListener('pagehide', () => {
  if (prompt.hidden && window.scrollY > 0) savePosition(id, currentProgress());
});
progress.value = currentProgress();

document
  .querySelector('#copy-link')!
  .addEventListener(
    'click',
    () => void copyText(new URL(location.pathname, location.origin).href),
  );
document.querySelector('#back-top')!.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth',
  });
});
for (const pre of body.querySelectorAll('pre.astro-code')) {
  const wrapper = document.createElement('div');
  wrapper.className = 'code-wrapper';
  pre.before(wrapper);
  wrapper.append(pre);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.textContent = '复制代码';
  button.setAttribute('data-pagefind-ignore', '');
  button.addEventListener(
    'click',
    () => void copyText(pre.querySelector('code')!.textContent!),
  );
  wrapper.append(button);
}
const headings = body.querySelectorAll('h2[id], h3[id]');
const links =
  document.querySelectorAll<HTMLAnchorElement>('.article-toc nav a');
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting)
        links.forEach((link) => {
          if (decodeURIComponent(link.hash.slice(1)) === entry.target.id)
            link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
  },
  { rootMargin: '-10% 0px -65% 0px' },
);
headings.forEach((heading) => observer.observe(heading));
