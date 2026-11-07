import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdir, writeFile } from 'node:fs/promises';

const directory = '.runtime/lighthouse';
await mkdir(directory, { recursive: true });
const chrome = await launch({
  chromeFlags: ['--headless=new', '--no-first-run'],
  chromePath: process.env.CHROME_PATH,
});
const results = [];
try {
  for (const [name, route] of [
    ['home', '/'],
    ['article', '/blog/reading-experience/'],
  ]) {
    const result = await lighthouse(`http://127.0.0.1:4321${route}`, {
      port: chrome.port,
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      logLevel: 'error',
    });
    if (!result || result.lhr.runtimeError)
      throw new Error(
        result?.lhr.runtimeError?.message ??
          'Lighthouse did not return a result',
      );
    await writeFile(`${directory}/${name}.html`, result.report);
    await writeFile(
      `${directory}/${name}.json`,
      JSON.stringify(result.lhr, null, 2),
    );
    const { lhr } = result;
    const summary = {
      page: route,
      lighthouseVersion: lhr.lighthouseVersion,
      formFactor: lhr.configSettings.formFactor,
      throttlingMethod: lhr.configSettings.throttlingMethod,
      scores: Object.fromEntries(
        Object.entries(lhr.categories).map(([key, category]) => [
          key,
          Math.round(category.score * 100),
        ]),
      ),
      lcp: lhr.audits['largest-contentful-paint'].displayValue,
      cls: lhr.audits['cumulative-layout-shift'].displayValue,
      tbt: lhr.audits['total-blocking-time'].displayValue,
    };
    results.push(summary);
    console.log(JSON.stringify(summary));
  }
} finally {
  chrome.kill();
}
await writeFile(`${directory}/summary.json`, JSON.stringify(results, null, 2));
if (
  results.some(
    (result) =>
      result.scores.performance < 90 || result.scores.accessibility < 95,
  )
)
  process.exitCode = 1;
