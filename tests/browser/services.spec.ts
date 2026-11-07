import { test, expect } from '@playwright/test';

test('configured service failures do not block reading or tools', async ({
  page,
}) => {
  await page.route('https://giscus.app/**', (route) => route.abort());
  await page.route('https://static.cloudflareinsights.com/**', (route) =>
    route.abort(),
  );
  await page.goto('/blog/digital-garden/');
  await page.locator('#comments').scrollIntoViewIfNeeded();
  const script = page.locator('#comments script');
  await expect(script).toHaveAttribute('data-mapping', 'specific');
  await expect(script).toHaveAttribute('data-term', '/blog/digital-garden/');
  await expect(page.locator('[data-comments-status]')).toContainText(
    '暂时无法连接',
  );
  await expect(page.locator('#article-body')).toBeVisible();
  await page.goto('/tools/json/');
  await page.getByLabel('输入内容').fill('{"ok":true}');
  await page.getByRole('button', { name: '校验并格式化' }).click();
  await expect(page.getByLabel('处理结果')).toHaveValue('{\n  "ok": true\n}');
  await expect(
    page.locator(
      'script[src="https://static.cloudflareinsights.com/beacon.min.js"]',
    ),
  ).toHaveAttribute('data-cf-beacon', '{"token":"test-only-token"}');
  await expect(page.locator('#comments')).toHaveCount(0);
});

test('giscus loads on demand and receives theme updates', async ({ page }) => {
  await page.route('https://static.cloudflareinsights.com/**', (route) =>
    route.abort(),
  );
  await page.route('https://giscus.app/client.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `const frame = document.createElement('iframe'); frame.className = 'giscus-frame'; frame.title = '测试评论'; frame.src = 'https://giscus.app/test-frame'; document.querySelector('.giscus').append(frame);`,
    }),
  );
  await page.route('https://giscus.app/test-frame', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><body><p id="theme">waiting</p><script>addEventListener('message', e => { if(e.data.giscus) document.querySelector('#theme').textContent = e.data.giscus.setConfig.theme; });</script></body></html>`,
    }),
  );
  await page.goto('/blog/digital-garden/');
  await expect(page.locator('#comments script')).toHaveCount(0);
  await page.locator('#comments').scrollIntoViewIfNeeded();
  await expect(page.frameLocator('.giscus-frame').locator('#theme')).toHaveText(
    'waiting',
  );
  await page.getByRole('button', { name: '切换明暗主题' }).click();
  await expect(page.frameLocator('.giscus-frame').locator('#theme')).toHaveText(
    'dark',
  );
});
