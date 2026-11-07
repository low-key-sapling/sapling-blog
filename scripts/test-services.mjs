import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  TEST_SERVICES: '1',
  PUBLIC_SITE_URL: 'https://example.com',
  PUBLIC_GISCUS_REPO: 'example/test-only',
  PUBLIC_GISCUS_REPO_ID: 'test-repo-id',
  PUBLIC_GISCUS_CATEGORY: 'Test',
  PUBLIC_GISCUS_CATEGORY_ID: 'test-category-id',
  PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN: 'test-only-token',
};
for (const args of [
  [
    'node_modules/astro/bin/astro.mjs',
    'build',
    '--force',
    '--outDir',
    './.runtime/services-dist',
  ],
  ['node_modules/@playwright/test/cli.js', 'test'],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
