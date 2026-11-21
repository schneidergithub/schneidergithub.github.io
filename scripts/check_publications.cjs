const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');

const origin = process.argv[2];
const presentation = '/articles/#benchmark-presentation';
const ids = ['e26_SSPpOP0', 'TZ04u6cj1ls', 'i0a7tXSLj3c'];
const reviewWidths = [375, 768, 1280];
const publicationGroups = {
  recordings: ['benchmark-presentation', 'node-ipc-interview', 'security-livestream'],
  'monthly-reviews': ['october-review', 'september-review', 'august-review', 'july-review'],
  investigations: ['node-ipc-report']
};

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

async function checkActionTargets(links, sameRow = false) {
  const boxes = await links.evaluateAll(items => items.map(link => {
    const box = link.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(link);
    const text = range.getBoundingClientRect();
    return {
      top: box.top, bottom: box.bottom, left: box.left, right: box.right,
      label: link.textContent, textBounds: text.toJSON(),
      fits: box.height >= 44 && box.left >= 0 && box.right <= innerWidth &&
        text.left >= box.left - 1 && text.right <= box.right + 1 &&
        text.top >= box.top - 1 && text.bottom <= box.bottom + 1
    };
  }));
  for (const box of boxes) assert.ok(box.fits, 'Clipped hero action: ' + JSON.stringify(box));
  const [work, experience] = boxes;
  assert.ok(work.right <= experience.left || work.bottom <= experience.top, 'Hero actions overlap');
  if (sameRow) assert.ok(Math.min(work.bottom, experience.bottom) > Math.max(work.top, experience.top), 'Hero actions must share a row at 375px');
}

async function checkResearchFeature(panel, width) {
  assert.equal((await panel.locator('.eyebrow').textContent()).trim(), 'Terminal-Bench-Science');
  assert.equal((await panel.locator('h2').textContent()).trim(), 'Can an AI agent reproduce a scientific result?');
  const byPosition = await panel.evaluate(element => {
    const label = element.querySelector('.eyebrow');
    const question = element.querySelector('h2');
    const player = element.querySelector('summary');
    return {
      documentOrder: !!(label.compareDocumentPosition(question) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        !!(question.compareDocumentPosition(player) & Node.DOCUMENT_POSITION_FOLLOWING),
      visualOrder: label.getBoundingClientRect().bottom <= question.getBoundingClientRect().top + 1 &&
        question.getBoundingClientRect().bottom <= player.getBoundingClientRect().top + 1,
      playBottom: player.querySelector('.play-mark').getBoundingClientRect().bottom + scrollY
    };
  });
  assert.ok(byPosition.documentOrder && byPosition.visualOrder, 'Identify the research before playback at ' + width + 'px');
  if (width === 375) assert.ok(byPosition.playBottom <= panel.page().viewportSize().height, 'Play control must fit on the first phone screen');
  const cover = panel.locator('.publication-video img');
  await decodeCover(cover);
  const dimensions = await cover.evaluate(img => ({
    width: img.naturalWidth, height: img.naturalHeight,
    declaredWidth: Number(img.getAttribute('width')), declaredHeight: Number(img.getAttribute('height'))
  }));
  assert.ok(dimensions.width >= 960 && dimensions.width * 9 === dimensions.height * 16, 'Expected a high-resolution 16:9 research poster');
  assert.equal(dimensions.declaredWidth, dimensions.width);
  assert.equal(dimensions.declaredHeight, dimensions.height);
}

async function checkHomepage(page) {
  const width = page.viewportSize().width;
  if (width <= 375) {
    const rows = await page.locator('.site-header nav a').evaluateAll(links => links.map(link => link.offsetTop));
    assert.ok(rows.length === 4 && rows[0] === rows[1] && rows[2] === rows[3] && rows[0] < rows[2], 'Expected two balanced navigation rows');
  }
  const signature = page.locator('.hero h1 .hero-signature');
  assert.equal(await signature.textContent(), 'A systematic approach.');
  const signatureLayout = await signature.evaluate(element => {
    const column = element.closest('h1').getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(element);
    const lines = [...range.getClientRects()];
    return {
      lines: lines.length,
      fits: lines.every(line => line.width > 0 && line.left >= column.left - 1 && line.right <= column.right + 1)
    };
  });
  assert.ok(signatureLayout.lines > 0 && signatureLayout.fits, 'Headline must fit its column at ' + width + 'px');
  if (width > 850) assert.equal(signatureLayout.lines, 1, 'Desktop signature wrapped at ' + width + 'px');
  const heroLinks = page.locator('.hero h1 + .actions a');
  const caseLink = page.locator('.hero a[href="/work/westinghouse-performance/"]');
  assert.match(await caseLink.innerText(), /tripled Elasticsearch throughput at Westinghouse/i);
  assert.deepEqual(await heroLinks.allTextContents(), ['Explore selected work', 'View experience']);
  assert.deepEqual(await heroLinks.evaluateAll(links => links.map(link => link.pathname)), ['/work/', '/experience/']);
  await checkActionTargets(heroLinks, width === 375);
  if (width === 320 || width === 375) {
    const largerText = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await checkActionTargets(heroLinks);
    assert.ok(await caseLink.evaluate(link => {
      const rect = link.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth + 1 && link.scrollWidth <= link.clientWidth + 1;
    }), 'Enlarged Westinghouse link must fit on the phone');
    await largerText.evaluate(style => style.remove());
  }
  if (width === 375) {
    const grouped = await page.locator('.hero > div > .eyebrow').evaluate(label => {
      const range = document.createRange();
      const text = label.firstChild;
      const phrase = text.textContent.match(/AI\s+Research/);
      if (!phrase) return false;
      range.setStart(text, phrase.index);
      range.setEnd(text, phrase.index + phrase[0].length);
      return range.getClientRects().length === 1;
    });
    assert.ok(grouped, 'Keep AI Research together on phones');
    assert.ok(await heroLinks.last().evaluate(link => getComputedStyle(link).textDecorationLine.includes('underline')), 'The secondary phone action must read as a link');
    await heroLinks.last().focus();
    await page.keyboard.press('Shift+Tab');
    for (const link of await heroLinks.all()) {
      assert.ok(await link.evaluate(el => el.matches(':focus-visible') && getComputedStyle(el).outlineStyle !== 'none'), 'Hero action must show keyboard focus');
      await page.keyboard.press('Tab');
    }
  }
  const hero = page.locator('.focus-panel');
  assert.equal(await hero.locator('.publication-video').count(), 1);
  const benchmark = hero.getByRole('link', { name: /presentation and task/i });
  assert.equal(await benchmark.getAttribute('href'), presentation);
  await checkResearchFeature(hero, width);

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
    ['/work/westinghouse-performance/', /3\s*[×x]|tripl|threefold/i]
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
  if (width === 1280) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const immediate = await page.locator('.hero .button, .hero .play-mark').evaluateAll(controls =>
      controls.every(el => getComputedStyle(el).transitionDuration.split(',').every(value => parseFloat(value) === 0)));
    assert.ok(immediate, 'Reduced motion must make hero controls respond without a transition');
    await page.emulateMedia({ reducedMotion: null });
  }
}

async function checkFallbacks(page) {
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
}

async function checkDiscovery(page) {
  const collection = new URL('/articles/', origin).href;
  for (const [group, entries] of Object.entries(publicationGroups)) {
    const jump = page.locator('.publication-jumps a[href="#' + group + '"]');
    assert.match(await jump.innerText(), new RegExp('\\b' + entries.length + '\\b'));
    await jump.press('Enter');
    assert.equal(page.url(), collection + '#' + group);
    const heading = page.locator('h2#' + group);
    assert.ok(await heading.isVisible());
    const rows = page.locator('.publication-group').filter({ has: heading }).locator('li.publication');
    assert.deepEqual((await rows.evaluateAll(items => items.map(item => item.id))).sort(), [...entries].sort());
    for (const entry of entries) {
      const row = page.locator('li#' + entry);
      const permalink = row.locator('.entry-permalink');
      assert.ok(await permalink.isVisible(), 'Missing entry link for ' + entry);
      await permalink.press('Enter');
      assert.equal(page.url(), collection + '#' + entry);
      assert.ok(await row.locator('h3 a').isVisible());
    }
  }
  for (const [from, to] of [['node-ipc-report', 'node-ipc-interview'], ['node-ipc-interview', 'node-ipc-report']]) {
    const link = page.locator('#' + from + ' .publication-context');
    await link.press('Enter');
    assert.equal(page.url(), collection + '#' + to);
  }
}

async function checkNoScript(browser) {
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  await page.goto(origin);
  await checkFallbacks(page);
  const deepLink = new URL('/articles/#node-ipc-interview', origin).href;
  await page.goto(deepLink);
  await page.reload();
  assert.equal(page.url(), deepLink);
  assert.ok(await page.locator(':target h3').isVisible(), 'Shared entry must resolve without JavaScript');
  await checkDiscovery(page);
  await checkFallbacks(page);
  await page.close();
}

async function captureCollection(page, version) {
  const dir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
  const prefix = path.join(dir, version + '-articles-' + page.viewportSize().width);
  await page.goto(new URL('/articles/', origin).href);
  for (const cover of await page.locator('li.publication img').all()) await decodeCover(cover);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: prefix + '-viewport.jpg', quality: 80, animations: 'disabled' });
  await page.screenshot({ path: prefix + '-full.jpg', quality: 76, fullPage: true, animations: 'disabled' });
}

async function checkCollection(page, width) {
  const homePoster = await page.locator('.focus-panel .video-poster img').getAttribute('src');
  await page.locator('.focus-panel').getByRole('link', { name: /presentation and task/i }).click();
  assert.equal(page.url(), new URL(presentation, origin).href);
  const benchmark = page.locator('#benchmark-presentation');
  assert.equal(await benchmark.locator('.video-poster img').getAttribute('src'), homePoster, 'Both benchmark entries should use the shared cover');
  assert.equal(await benchmark.locator('h3 a').getAttribute('href'), 'https://www.youtube.com/watch?v=e26_SSPpOP0');
  assert.equal(await benchmark.getByRole('link', { name: /merged benchmark/ }).getAttribute('href'), 'https://github.com/harbor-framework/terminal-bench-science/pull/1513');
  assert.equal(await page.locator('#node-ipc-report .publication-related').getAttribute('href'), 'https://doi.org/10.6084/m9.figshare.33865414');
  await checkDiscovery(page);
  const publications = page.locator('li.publication');
  const articleCover = await page.locator('#october-review img').boundingBox();
  for (const row of await publications.all()) {
    const cover = row.locator('.meta img');
    assert.equal(await cover.count(), 1);
    await decodeCover(cover);
    if (!(await row.locator('.publication-video').count())) {
      const imageLink = row.locator('a.collection-cover').filter({ has: page.locator('img') });
      assert.equal(await imageLink.getAttribute('href'), await row.locator('h3 a').getAttribute('href'), 'Cover and title should open the same publication');
    } else {
      assert.match(await row.locator('h3 a').innerText(), /YouTube/i, 'Identify the outbound video destination');
      assert.ok(await row.locator('summary .play-caption').isVisible(), 'Identify inline playback on the poster');
    }
    const box = await cover.boundingBox();
    assert.equal(box.x, articleCover.x);
    assert.equal(box.width, articleCover.width);
  }
  await checkPlayers(page);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Publication list overflows');
  if (width === 1280) {
    const issue = page.locator('#october-review');
    const html = await page.request.get(await issue.locator('h3 a').getAttribute('href'));
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
    for (const width of baseline ? reviewWidths : [320, 375, 768, 851, 1024, 1280, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const home = await page.goto(origin);
      assert.ok(home.ok(), 'Homepage returned HTTP ' + home.status());
      if (baseline) {
        await captureHome(page, 'before');
        if (width === 375 || width === 1280) await captureCollection(page, 'before');
      } else {
        await checkHomepage(page);
        if (reviewWidths.includes(width)) await captureHome(page, new URL(origin).hostname === '127.0.0.1' ? 'preview' : 'live');
        if (width === 375 || width === 1280) {
          await checkPlayers(page);
          await checkCollection(page, width);
          await captureCollection(page, new URL(origin).hostname === '127.0.0.1' ? 'preview' : 'live');
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
