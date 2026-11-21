const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

const origin = process.argv[2];
const presentation = '/articles/#benchmark-presentation';

async function check() {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of [375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(origin);
      await page.locator('.focus-panel').getByRole('link', { name: /presentation and task/ }).click({ timeout: 5000 });
      assert.equal(page.url(), new URL(presentation, origin).href);
      const video = page.locator('#benchmark-presentation');
      assert.equal(await video.locator('h2 a').getAttribute('href'), 'https://www.youtube.com/watch?v=e26_SSPpOP0');
      assert.equal(await video.getByRole('link', { name: /merged benchmark/ }).getAttribute('href'), 'https://github.com/harbor-framework/terminal-bench-science/pull/1513');

      for (const id of ['october-review', 'node-ipc-report']) {
        const cover = page.locator('#' + id + ' img');
        await cover.scrollIntoViewIfNeeded();
        await cover.evaluate(img => img.decode());
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Publication list overflows at ' + width + 'px');

      if (width === 1280) {
        // These editions are published by a separate Pages repository on the custom domain.
        const issue = page.locator('#october-review');
        const html = await page.request.get(await issue.locator('h2 a').getAttribute('href'));
        assert.ok(html.ok(), 'October HTML edition returned ' + html.status());
        assert.match(await html.text(), /<title>Cybersecurity Must Keep Pace with AI/);
        const pdf = await page.request.get(await issue.getByRole('link', { name: /PDF edition/ }).getAttribute('href'));
        assert.ok(pdf.ok(), 'October PDF returned ' + pdf.status());
        assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-');
        console.log('Read the published October HTML and PDF editions.');
      }
      console.log(width + 'px: opened the benchmark feature, verified its links, and loaded both publication covers.');
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

check().catch(error => { console.error(error); process.exitCode = 1; });
