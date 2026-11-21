const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const gallery = require('../_data/gallery.json');

const studies = [
  { card: 'propoint', path: 'super-salon-checkout', images: 2 },
  { card: 'indiana', path: 'indiana-case-archives', images: 0 },
  { card: 'bayer', path: 'bayer-aleve', images: 2 }
];

async function checkGallery(page, workUrl, width) {
  for (const group of gallery) {
    const fragment = '#gallery-' + group.id;
    await page.locator('.gallery-jumps').getByRole('link', { name: group.title + ' ' + group.items.length, exact: true }).click();
    assert.equal(page.url(), workUrl + fragment);
    const section = page.locator(fragment);
    assert.equal(await section.locator('h3').innerText(), group.title);
    assert.equal(await section.locator('.gallery-heading p').first().innerText(), group.description);
    const photos = section.locator('.thumbnail-card a');
    assert.deepEqual(await photos.evaluateAll(links => links.map(link => link.pathname)), group.items.map(item => item.image));
    for (const photo of await photos.all()) {
      const image = photo.locator('img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
    }
    if (width === 1280) {
      for (const item of group.items) {
        const full = await page.request.get(new URL(item.image, workUrl).href);
        assert.ok(full.ok() && full.headers()['content-type'].startsWith('image/'), 'Missing full-size image ' + item.image);
        await full.dispose();
      }
    }
    if (group.related) {
      const destination = new URL(group.related.url, workUrl);
      await section.getByRole('link', { name: group.related.label, exact: true }).click();
      assert.equal(page.url(), destination.href);
      if (destination.hash) {
        assert.ok(await page.locator(destination.hash).isVisible(), 'Missing project card');
      } else {
        assert.ok(await page.locator('.case-study h1').isVisible(), 'Missing case study');
      }
      await page.goto(workUrl);
    }
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Work page overflows');
  console.log(width + 'px: verified the gallery highlights, image groups, and related project links.');
}

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
      await checkGallery(page, workUrl, width);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

check().catch(error => { console.error(error); process.exitCode = 1; });
