const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

const studies = [
  { card: 'propoint', path: 'super-salon-checkout', images: 2 },
  { card: 'indiana', path: 'indiana-case-archives', images: 0 },
  { card: 'bayer', path: 'bayer-aleve', images: 2 }
];

async function check() {
  const workUrl = new URL('/work/', process.argv[2]).href;
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of [375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const index = await page.goto(workUrl);
      assert.ok(index.ok(), 'Selected Work failed to load');
      for (const study of studies) {
        const link = page.locator('#' + study.card).getByRole('link', { name: /^Read case study/ });
        const label = await link.textContent();
        await link.click({ timeout: 5000 });
        assert.equal(page.url(), workUrl + study.path + '/');
        const title = await page.locator('main h1').innerText();
        assert.ok(title && label.includes(title), 'Case-study link and headline disagree');
        const images = page.locator('.study-evidence img');
        assert.equal(await images.count(), study.images);
        for (const image of await images.all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(img => img.decode());
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow on ' + page.url());
        await page.getByRole('link', { name: 'Back to Selected Work' }).click();
        assert.equal(page.url(), workUrl + '#' + study.card);
      }
      console.log(width + 'px: opened all three case studies from their cards, decoded all four screenshots, and returned to the original cards.');
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

check().catch(error => { console.error(error); process.exitCode = 1; });
