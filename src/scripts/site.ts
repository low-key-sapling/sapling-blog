export function toast(message: string) {
  const element = document.querySelector<HTMLElement>('#toast')!;
  element.textContent = message;
  element.hidden = false;
  window.setTimeout(() => {
    element.hidden = true;
  }, 3000);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制到剪贴板');
  } catch {
    toast('复制失败，请手动选择并复制。');
  }
}

const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
const media = matchMedia('(prefers-color-scheme: dark)');
const updateTheme = (dark: boolean) => {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  document
    .querySelector('meta[name="theme-color"]')!
    .setAttribute('content', dark ? '#1c211e' : '#f8f8f2');
  window.dispatchEvent(
    new CustomEvent('theme-changed', { detail: dark ? 'dark' : 'light' }),
  );
};
updateTheme(document.documentElement.dataset.theme === 'dark');
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  updateTheme(dark);
  try {
    localStorage.setItem('sapling:theme', dark ? 'dark' : 'light');
  } catch {
    /* Theme still works for this visit. */
  }
});
media.addEventListener('change', (event) => {
  let saved = null;
  try {
    saved = localStorage.getItem('sapling:theme');
  } catch {}
  if (saved !== 'light' && saved !== 'dark') updateTheme(event.matches);
});

const dialog = document.querySelector<HTMLDialogElement>('#search-dialog')!;
document
  .querySelectorAll('[data-open-search]')
  .forEach((button) =>
    button.addEventListener('click', () => dialog.showModal()),
  );
document
  .querySelector('[data-close-search]')!
  .addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  }
});
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    dialog.open ? dialog.close() : dialog.showModal();
  }
});
