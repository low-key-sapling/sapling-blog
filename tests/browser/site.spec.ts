import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdir, readFile, access, glob, mkdir } from 'node:fs/promises';
import path from 'node:path';

async function articlePageCount() {
  const pages = await Array.fromAsync(glob('dist/blog/[a-z]*/index.html'));
  return pages.length;
}

test('static build excludes every draft surface and produces RSS and sitemap', async ({
  page,
  request,
}) => {
  const files = await readdir('dist', { recursive: true });
  for (const name of files.filter((name) => /\.(html|xml|json)$/.test(name))) {
    const text = await readFile(path.join('dist', name), 'utf8');
    expect(text, name).not.toMatch(
      /DRAFT_ONLY_SENTINEL|draft-example|草稿专属/,
    );
  }
  const rss = await (await request.get('/rss.xml')).text();
  await page.goto('/archives/');
  const entries = page.locator('.archive-entry a');
  await expect(entries).toHaveCount(await articlePageCount());
  const latest = await entries.evaluateAll((links) => {
    const canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )!.href;
    return links
      .slice(0, 50)
      .map((link) => new URL(link.getAttribute('href')!, canonical).href);
  });
  const feedLinks = await page.evaluate((xml) => {
    const feed = new DOMParser().parseFromString(xml, 'application/xml');
    return Array.from(
      feed.querySelectorAll('item > link'),
      (link) => link.textContent,
    );
  }, rss);
  expect(feedLinks).toEqual(latest);
  expect(rss).not.toContain('<content:encoded>');
  expect((await request.get('/sitemap-index.xml')).ok()).toBeTruthy();
  expect((await request.get('/blog/draft-example/')).status()).toBe(404);
});

test('all generated internal links and assets resolve', async () => {
  const files = (await readdir('dist', { recursive: true })).filter((name) =>
    name.endsWith('.html'),
  );
  const targets = new Set<string>();
  for (const file of files) {
    const html = await readFile(path.join('dist', file), 'utf8');
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const url = decodeURIComponent(match[1]);
      if (url.startsWith('//')) continue;
      const target = path.join(
        'dist',
        url,
        url.endsWith('/') ? 'index.html' : '',
      );
      targets.add(target);
    }
  }
  for (const target of targets)
    await expect(access(target), target).resolves.toBeUndefined();
});

test('articles paginate and series follow explicit order', async ({ page }) => {
  const total = await articlePageCount();
  const pageSize = 9;
  await page.goto('/blog/');
  const next = page.getByRole('link', { name: '下一页 →' });
  for (let offset = 0; offset < total; offset += pageSize) {
    if (offset > 0) await next.click();
    await expect(page.locator('.article-card')).toHaveCount(
      Math.min(pageSize, total - offset),
    );
  }
  await expect(next).toHaveCount(0);
  await page.goto('/blog/digital-garden/');
  await page
    .getByRole('link', { name: '下一篇：好的阅读体验', exact: false })
    .click();
  await expect(page).toHaveURL(/reading-experience/);
  await expect(page.locator('.series-box ol li')).toHaveCount(3);
});

test('theme follows the system, persists a manual choice and respects reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '切换明暗主题' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe('auto');
});

test('mobile navigation works with a keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.mobile-menu summary');
  const navigation = page.getByRole('navigation', { name: '移动端导航' });
  await menu.press('Enter');
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(navigation.getByRole('link').first()).toBeFocused();
  await navigation
    .getByRole('link', { name: '项目', exact: true })
    .press('Enter');
  await expect(page.locator('h1')).toContainText('让想法落地');
  await expect(page.locator('.project-grid article')).toHaveCount(2);
});

test('content and navigation remain readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/blog/reading-experience/');
  await expect(page.locator('#article-body')).toContainText(
    '给文字一个合适的宽度',
  );
  await expect(page.locator('table').first()).toHaveAttribute('tabindex', '0');
  await page.getByRole('link', { name: '所有手记', exact: true }).click();
  await expect(page.locator('.article-card')).toHaveCount(9);
  await context.close();
});

test('search supports Chinese, mixed terms, content types and empty results', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  const input = page.getByRole('searchbox');
  await input.fill('静态');
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(page.locator('.search-results li').first()).toBeVisible();
  await input.fill('React 组件');
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(page.locator('.search-results')).toContainText('在 MDX 里');
  await page.getByLabel('内容类型').selectOption('工具');
  await input.fill('JSON');
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(page.locator('.search-results')).toContainText('JSON 格式化');
  await expect(page.locator('.search-results li')).toHaveCount(1);
  await page.getByLabel('内容类型').selectOption('');
  await input.fill('"DRAFT_ONLY_SENTINEL_7F31"');
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(page.locator('[data-search-status]')).toContainText('没有找到');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('JSON and Base64 tools preserve values and do not store inputs', async ({
  page,
}) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4321'))
      external.push(request.url());
  });
  await page.goto('/tools/json/');
  await page.getByLabel('输入内容').fill('{"id":9007199254740993}');
  await page.getByRole('button', { name: '校验并格式化' }).click();
  await expect(page.getByLabel('处理结果')).toHaveValue(
    '{\n  "id": 9007199254740993\n}',
  );
  await page.getByLabel('输入内容').fill('{bad}');
  await page.getByRole('button', { name: '校验并格式化' }).click();
  await expect(page.locator('.tool-status')).toContainText('JSON 无效');
  await page.reload();
  await expect(page.getByLabel('输入内容')).toHaveValue('');
  await page.goto('/tools/base64/');
  await page.getByLabel('输入内容').fill('你好 🌱');
  await page.getByRole('button', { name: '编码 → Base64' }).click();
  const encoded = await page.getByLabel('处理结果').inputValue();
  await page.getByLabel('输入内容').fill(encoded);
  await page.getByRole('button', { name: '解码 → 文本' }).click();
  await expect(page.getByLabel('处理结果')).toHaveValue('你好 🌱');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(external).toEqual([]);
});

test('timestamp tool switches unit and timezone', async ({ page }) => {
  await page.goto('/tools/timestamp/');
  await page.getByLabel('整数时间戳').fill('0');
  await page.getByRole('button', { name: '转为日期', exact: true }).click();
  await expect(page.getByLabel('转换结果')).toHaveText(
    '1970-01-01 08:00:00.000',
  );
  await page.getByLabel('日期时区').selectOption('UTC');
  await page.getByRole('button', { name: '转为日期', exact: true }).click();
  await expect(page.getByLabel('转换结果')).toHaveText(
    '1970-01-01 00:00:00.000',
  );
  await page.getByLabel('时间戳单位').selectOption('seconds');
  await page.getByLabel('日期时间（所选时区）').fill('1970-01-01T00:00:01');
  await page.getByRole('button', { name: '转为时间戳', exact: true }).click();
  await expect(page.getByLabel('转换结果')).toHaveText('1');
});

test('bookmarks persist, stale records can be removed and corrupt storage is safe', async ({
  page,
}) => {
  await page.goto('/blog/digital-garden/');
  await page.getByRole('button', { name: '收藏文章', exact: true }).click();
  await page.reload();
  await expect(page.locator('#bookmark-button')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.goto('/bookmarks/');
  await expect(page.locator('#bookmark-list')).toContainText('从一篇文章开始');
  await page.getByRole('button', { name: '移除收藏', exact: false }).click();
  await expect(page.locator('#bookmarks-empty')).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      'sapling:reading:v1',
      JSON.stringify({ bookmarks: ['removed'], positions: {} }),
    ),
  );
  await page.reload();
  await expect(page.locator('#bookmark-list')).toContainText('这篇文章已移除');
  await page.getByRole('button', { name: '移除收藏', exact: false }).click();
  await expect(page.locator('#bookmarks-empty')).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem('sapling:reading:v1', '{broken'),
  );
  await page.goto('/blog/digital-garden/');
  await expect(page.locator('#article-body')).toBeVisible();
  await page.getByRole('button', { name: '收藏文章', exact: true }).click();
  await expect(page.locator('#bookmark-button')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('resume is opt-in and article controls work', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/blog/reading-experience/');
  await page.locator('#article-body h2').nth(2).scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('sapling:reading:v1') ?? '{}')
            .positions?.['reading-experience']?.progress ?? 0,
      ),
    )
    .toBeGreaterThan(0.05);
  await page.goto('/');
  await page.goto('/blog/reading-experience/');
  await expect(page.locator('#resume-prompt')).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('button', { name: '继续阅读', exact: true }).click();
  await expect(page.locator('#resume-prompt')).toBeHidden();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(500);
  await page.getByRole('button', { name: '复制代码' }).first().click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('.article-body');
  await page.getByRole('button', { name: '复制链接' }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('/blog/reading-experience/');
  await page.getByRole('button', { name: '↑ 返回顶部' }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test('storage unavailable still allows reading and reports failed bookmark', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  await page.goto('/blog/digital-garden/');
  await page.getByRole('button', { name: '收藏文章', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('浏览器存储不可用');
  await expect(page.locator('#article-body')).toBeVisible();
});

test('Mermaid, math and React demos render', async ({ page }) => {
  await page.goto('/blog/digital-garden/');
  await expect(page.locator('.mermaid svg')).toBeVisible();
  await page.goto('/blog/mdx-interactions/');
  await expect(page.locator('.katex')).toBeVisible();
  const slider = page.getByRole('slider');
  await slider.scrollIntoViewIfNeeded();
  await expect(slider).toBeEnabled();
  await slider.fill('20');
  await expect(page.locator('.demo')).toContainText('每一步增长 20%');
});

for (const width of [390, 768, 1440]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`layout and accessibility at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      for (const url of ['/', '/blog/reading-experience/', '/tools/json/']) {
        await page.goto(url);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          url,
        ).toBeTruthy();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          results.violations.map(({ id, nodes }) => ({
            id,
            elements: nodes.map((node) => node.target),
          })),
        ).toEqual([]);
        await mkdir('.runtime/screenshots', { recursive: true });
        await page.screenshot({
          path: `.runtime/screenshots/${url === '/' ? 'home' : url.includes('blog') ? 'article' : 'tool'}-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    });
  }
}
