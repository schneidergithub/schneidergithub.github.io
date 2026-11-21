const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');

const origin = process.argv[2];
const presentation = '/articles/#benchmark-presentation';
const ids = ['e26_SSPpOP0', 'TZ04u6cj1ls', 'i0a7tXSLj3c'];
const reviewWidths = [375, 1280];

async function decodeCover(image) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(async img => {
    await img.decode();
    if (new URL(img.currentSrc).origin !== location.origin) throw new Error('Expected a local publication cover');
    if (!img.naturalWidth || !img.alt.trim()) throw new Error('Missing publication cover or description');
  });
}

async function checkPlayers(page) {
  const disclosures = page.locator('.publication-video');
  assert.equal(await disclosures.count(), ids.length);
  assert.equal(await page.locator('iframe').count(), 0, 'Players should load on demand');
  const seen = [];
  const start = page.url();
  for (const disclosure of await disclosures.all()) {
    const src = await disclosure.locator('template').evaluate(template => template.content.querySelector('iframe').src);
    const id = new URL(src).pathname.split('/').pop();
    assert.ok(ids.includes(id), 'Unknown YouTube video ' + id);
    seen.push(id);
    const embed = 'https://www.youtube-nocookie.com/embed/' + id;
    const toggle = disclosure.locator('summary');
    await toggle.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    const focusVisible = await toggle.evaluate(el => {
      const style = getComputedStyle(el);
      return el.matches(':focus-visible') && style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    });
    assert.ok(focusVisible, 'Missing keyboard focus outline for ' + id + ' on ' + start);
    const [response] = await Promise.all([
      page.waitForResponse(r => r.request().isNavigationRequest() && r.url().startsWith(embed + '?')),
      toggle.press('Enter')
    ]);
    const frame = disclosure.locator('iframe');
    await frame.waitFor({ state: 'visible' });
    assert.ok(response.ok(), 'YouTube embed failed to load for ' + id);
    assert.equal(await page.locator('.publication-video[open]').count(), 1);
    assert.equal(await page.locator('iframe').count(), 1);
    assert.ok(await frame.getAttribute('title'));
    const box = await frame.boundingBox();
    assert.ok(box.width >= 200 && box.height >= 200 && box.x >= 0 && box.x + box.width <= page.viewportSize().width, 'Player does not fit ' + start);
  }
  assert.deepEqual(seen.sort(), [...ids].sort());
  await disclosures.last().locator('summary').press('Space');
  await page.locator('iframe').waitFor({ state: 'detached' });
  assert.equal(page.url(), start, 'Playback should stay on the current page');
}

async function captureHome(page, version) {
  const dir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
  fs.mkdirSync(dir, { recursive: true });
  const prefix = path.join(dir, version + '-' + page.viewportSize().width);
  // Scrolling lazy images into view first also makes the full-page comparison reproducible.
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img => img.decode());
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: prefix + '-viewport.jpg', quality: 80, animations: 'disabled' });
  await page.screenshot({ path: prefix + '-full.jpg', quality: 76, fullPage: true, animations: 'disabled' });
}

async function checkHomepage(page) {
  const width = page.viewportSize().width;
  if (width <= 375) {
    const rows = await page.locator('.site-header nav a').evaluateAll(links => links.map(link => link.offsetTop));
    assert.ok(rows.length === 4 && rows[0] === rows[1] && rows[2] === rows[3] && rows[0] < rows[2], 'Expected two balanced navigation rows');
  }
  const heroLinks = page.locator('.hero h1 + .actions a');
  assert.deepEqual(await heroLinks.allTextContents(), ['Explore selected work', 'View experience']);
  assert.deepEqual(await heroLinks.evaluateAll(links => links.map(link => link.pathname)), ['/work/', '/experience/']);
  const hero = page.locator('.focus-panel');
  assert.equal(await hero.locator('.publication-video').count(), 1);
  const benchmark = hero.getByRole('link', { name: /presentation and task/i });
  assert.equal(await benchmark.getAttribute('href'), presentation);
  await decodeCover(hero.locator('.publication-video img'));

  const cards = page.locator('#home-media .media-card');
  assert.equal(await cards.count(), 4);
  if (width === 1280) {
    const heights = await cards.evaluateAll(items => items.map(item => item.clientHeight));
    assert.equal(new Set(heights).size, 1, 'Closed desktop media cards should align');
  }
  assert.equal(await cards.locator('.publication-video').count(), 2);
  const linkedCovers = cards.locator('a').filter({ has: page.locator('img') });
  assert.equal(await linkedCovers.count(), 2);
  assert.deepEqual((await linkedCovers.evaluateAll(links => links.map(a => a.href))).sort(), [
    'https://commondevops.com/node-ipc-supply-chain-incident-report/',
    'https://www.aaronschneider.org/common-devops-reports/reports/2026-10/'
  ]);
  for (const card of await cards.all()) {
    assert.equal(await card.locator('img').count(), 1);
    await decodeCover(card.locator('img'));
  }

  const projects = [
    ['/work/indiana-case-archives/', /92.*counties|counties.*92/is],
    ['/work/super-salon-checkout/', /1¢|one.cent|1.cent|\$0\.01/i],
    ['/work/#westinghouse', /3\s*[×x]|tripl|threefold/i]
  ];
  for (const [dest, result] of projects) {
    const project = page.locator('.feature').filter({ has: page.locator('a[href="' + dest + '"]') });
    assert.equal(await project.count(), 1, 'Missing featured project ' + dest);
    assert.match(await project.innerText(), result);
  }
  const contacts = page.locator('#connect a');
  const destinations = await contacts.evaluateAll(links => links.map(a => a.href));
  assert.deepEqual(destinations.sort(), [
    'https://www.linkedin.com/company/commondevops/',
    'https://www.linkedin.com/in/aarondrewschneider/',
    'https://www.youtube.com/@commondevops?sub_confirmation=1'
  ]);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Homepage overflows');
}

async function checkNoScript(browser) {
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  await page.goto(origin);
  const videos = page.locator('.publication-video');
  const urls = [];
  for (const video of await videos.all()) {
    await video.locator('summary').press('Enter');
    const fallback = video.getByRole('link', { name: /watch on youtube/i });
    assert.ok(await fallback.isVisible(), 'Missing visible no-JavaScript fallback');
    urls.push(await fallback.getAttribute('href'));
  }
  assert.deepEqual(urls.sort(), ids.map(id => 'https://www.youtube.com/watch?v=' + id).sort());
  assert.equal(await page.locator('iframe').count(), 0);
  await page.close();
}

async function checkCollection(page, width) {
  await page.locator('.focus-panel').getByRole('link', { name: /presentation and task/i }).click();
  assert.equal(page.url(), new URL(presentation, origin).href);
  const benchmark = page.locator('#benchmark-presentation');
  assert.equal(await benchmark.locator('h2 a').getAttribute('href'), 'https://www.youtube.com/watch?v=e26_SSPpOP0');
  assert.equal(await benchmark.getByRole('link', { name: /merged benchmark/ }).getAttribute('href'), 'https://github.com/harbor-framework/terminal-bench-science/pull/1513');
  const publications = page.locator('li.publication');
  const articleCover = await page.locator('#october-review img').boundingBox();
  for (const row of await publications.all()) {
    const cover = row.locator('.meta img');
    assert.equal(await cover.count(), 1);
    await decodeCover(cover);
    if (!(await row.locator('.publication-video').count())) {
      const imageLink = row.locator('a.collection-cover').filter({ has: page.locator('img') });
      assert.equal(await imageLink.getAttribute('href'), await row.locator('h2 a').getAttribute('href'), 'Cover and title should open the same publication');
    }
    const box = await cover.boundingBox();
    assert.equal(box.x, articleCover.x);
    assert.equal(box.width, articleCover.width);
  }
  await checkPlayers(page);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Publication list overflows');
  if (width === 1280) {
    const issue = page.locator('#october-review');
    const html = await page.request.get(await issue.locator('h2 a').getAttribute('href'));
    assert.ok(html.ok(), 'October HTML edition returned ' + html.status());
    assert.match(await html.text(), /<title>Cybersecurity Must Keep Pace with AI/);
    const pdf = await page.request.get(await issue.getByRole('link', { name: /PDF edition/ }).getAttribute('href'));
    assert.ok(pdf.ok(), 'October PDF returned ' + pdf.status());
    assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-');
  }
}

async function check() {
  const baseline = process.argv.includes('--capture-baseline');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of baseline ? reviewWidths : [320, 375, 768, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const home = await page.goto(origin);
      assert.ok(home.ok(), 'Homepage returned HTTP ' + home.status());
      if (baseline) {
        await captureHome(page, 'before');
      } else {
        await checkHomepage(page);
        if (reviewWidths.includes(width)) {
          await captureHome(page, new URL(origin).hostname === '127.0.0.1' ? 'preview' : 'live');
          await checkPlayers(page);
          await checkCollection(page, width);
          console.log(width + 'px: verified all three embedded players on both the homepage and Articles & Demos.');
        }
        console.log(width + 'px: verified five homepage covers, project results, navigation and fit.');
      }
      await page.close();
    }
    if (!baseline) await checkNoScript(browser);
  } finally {
    await browser.close();
  }
}

check().catch(error => { console.error(error); process.exitCode = 1; });
