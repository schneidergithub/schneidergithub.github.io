const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');

async function check() {
  const url = process.argv[2];
  const previews = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'experience-previews');
  fs.mkdirSync(previews, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of [1280, 375]) {
      const page = await browser.newPage({ viewport: { width, height: 960 } });
      const response = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      assert.ok(response.ok(), 'Experience page returned HTTP ' + response.status());
      const roles = page.locator('article.role');
      assert.equal(await roles.count(), 11);
      for (const role of await roles.all()) {
        const image = role.locator('img');
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(img => img.decode());
        const layout = await role.evaluate(article => {
          const img = article.querySelector('img');
          const rect = selector => article.querySelector(selector).getBoundingClientRect();
          return {
            name: article.querySelector('h2').textContent,
            imageLeft: img.getBoundingClientRect().left,
            imageRight: img.getBoundingClientRect().right,
            headingLeft: rect('.role-heading').left,
            headingBottom: rect('.role-heading').bottom,
            bodyLeft: rect('.role-details').left,
            bodyTop: rect('.role-details').top,
            fit: getComputedStyle(img).objectFit
          };
        });
        assert.equal(layout.fit, 'contain', layout.name);
        assert.ok(layout.imageRight <= layout.headingLeft, layout.name);
        assert.ok(layout.headingBottom <= layout.bodyTop, layout.name);
        const expectedLeft = width === 375 ? layout.imageLeft : layout.headingLeft;
        assert.ok(Math.abs(layout.bodyLeft - expectedLeft) < 1, layout.name);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflow');
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(previews, 'experience-' + width + '.png'), fullPage: true });
      console.log(width + 'px: 11 images decoded, role layouts and page width verified');
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
check().catch(error => { console.error(error); process.exitCode = 1; });
