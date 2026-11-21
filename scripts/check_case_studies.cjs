const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');
const gallery = require('../_data/gallery.json');

const studies = [
  { card: 'propoint', path: 'super-salon-checkout', images: 2 },
  { card: 'indiana', path: 'indiana-case-archives', images: 0 },
  { card: 'bayer', path: 'bayer-aleve', images: 2 },
  { card: 'westinghouse', path: 'westinghouse-performance', images: 0 },
  { card: 'commondevops', path: 'scientific-ai-benchmark', images: 0 }
];

async function checkShareImage(page, file) {
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  assert.equal(image, 'https://www.aaronschneider.org/assets/portfolio/share/' + file);
  assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute('content'), 'summary_large_image');
  // The preview declares the production URL. Decode bytes from the deployment under test.
  const dimensions = await page.evaluate(async path => {
    const card = new Image();
    card.src = path;
    await card.decode();
    return [card.naturalWidth, card.naturalHeight];
  }, new URL(image).pathname);
  assert.deepEqual(dimensions, [1200, 630], 'Wrong share image dimensions for ' + image);
}

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
      const routes = studies.map(study => '/work/' + study.path + '/').sort();
      const entryLinks = page.locator('.study-directory a');
      assert.deepEqual(await entryLinks.evaluateAll(links => links.map(a => a.pathname).sort()), routes);
      if (width === 1280) await checkShareImage(page, 'aaron-schneider.jpg');
      for (const study of studies) {
        const link = page.locator('#' + study.card).getByRole('link', { name: /^Read case study/ });
        const label = await link.textContent();
        await link.click({ timeout: 5000 });
        assert.equal(page.url(), workUrl + study.path + '/');
        const title = await page.locator('main h1').innerText();
        assert.ok(title && label.includes(title), 'Case-study link and headline disagree');
        const ending = page.locator('.study-ending');
        const discuss = ending.getByRole('link', { name: 'Discuss this work' });
        assert.equal(await discuss.getAttribute('href'), '/#connect');
        assert.equal(await ending.locator('a[href="/work/#' + study.card + '"]').count(), 1);
        if (study.card === 'westinghouse') {
          assert.match(await page.locator('.case-study').innerText(), /Elasticsearch/i);
          if (width === 1280) await checkShareImage(page, 'westinghouse-performance.jpg');
        }
        if (study.card === 'commondevops') {
          if (width === 1280) await checkShareImage(page, 'tbs-meta-analysis.jpg');
          const dir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
          fs.mkdirSync(dir, { recursive: true });
          const version = new URL(workUrl).hostname === '127.0.0.1' ? 'preview' : 'live';
          await page.screenshot({ path: path.join(dir, version + '-benchmark-case-' + width + '.jpg'), fullPage: true, quality: 80 });
        }
        const images = page.locator('.study-evidence img');
        assert.equal(await images.count(), study.images);
        for (const image of await images.all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(img => img.decode());
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow on ' + page.url());
        if (study.card === 'westinghouse' || study.card === 'propoint') {
          await Promise.all([page.waitForURL(new URL('/#connect', workUrl).href), discuss.press('Enter')]);
          assert.equal(await page.locator('#connect .actions a').count(), 2);
          await page.goBack();
        }
        await page.getByRole('link', { name: 'Back to Selected Work' }).click();
        assert.equal(page.url(), workUrl + '#' + study.card);
      }
      console.log(width + 'px: verified ' + studies.length + ' case studies, contact paths and project returns.');
      await checkGallery(page, workUrl, width);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

check().catch(error => { console.error(error); process.exitCode = 1; });
