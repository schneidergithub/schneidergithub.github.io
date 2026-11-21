const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

const origin = process.argv[2];
const presentation = '/articles/#benchmark-presentation';

async function checkMedia(page, viewportWidth) {
  const publications = page.locator('li.publication');
  const articleCover = await page.locator('#october-review img').boundingBox();
  for (const row of await publications.all()) {
    const thumbnail = row.locator('.meta img');
    assert.equal(await thumbnail.count(), 1, 'Every item needs one thumbnail');
    await thumbnail.scrollIntoViewIfNeeded();
    await thumbnail.evaluate(img => img.decode());
    const box = await thumbnail.boundingBox();
    assert.equal(box.x, articleCover.x, 'Thumbnail columns should align');
    assert.equal(box.width, articleCover.width, 'Thumbnail widths should match');
  }

  const videos = publications.filter({ has: page.locator('.type', { hasText: /^Video$/ }) });
  assert.equal(await videos.count(), 3);
  assert.equal(await page.locator('iframe').count(), 0, 'Players should load on demand');

  for (const row of await videos.all()) {
    const title = row.locator('h2 a');
    const id = new URL(await title.getAttribute('href')).searchParams.get('v');
    const embed = 'https://www.youtube-nocookie.com/embed/' + id;
    const toggle = row.locator('summary');
    const response = page.waitForResponse(r => r.request().isNavigationRequest() && r.url().startsWith(embed + '?'));
    await toggle.focus();
    await toggle.press('Enter');
    const iframe = row.locator('iframe');
    await iframe.waitFor({ state: 'visible' });
    assert.equal(await page.locator('.publication-video[open]').count(), 1);
    assert.equal(await page.locator('iframe').count(), 1, 'Only the selected player should remain loaded');
    assert.ok(await iframe.getAttribute('title'));
    assert.ok((await response).ok(), 'YouTube embed failed to load for ' + id);
    const box = await iframe.boundingBox();
    assert.ok(box.width >= 200 && box.height >= 200 && box.x + box.width <= viewportWidth, 'Player does not fit');
  }

  const last = videos.last();
  await last.locator('summary').press('Space');
  await last.locator('iframe').waitFor({ state: 'detached' });
  assert.equal(await page.locator('iframe').count(), 0, 'Closing the player must stop playback');
  console.log(viewportWidth + 'px: all publication thumbnails decoded and aligned; all three YouTube embeds loaded, switched, and closed.');
}

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

      await checkMedia(page, width);
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
