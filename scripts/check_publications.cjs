const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');

const origin = process.argv[2];
const presentation = '/articles/#benchmark-presentation';
const graderGuide = '/work/scientific-ai-benchmark/#checking-the-grader';
const ids = ['e26_SSPpOP0', 'TZ04u6cj1ls', 'i0a7tXSLj3c'];
const reviewWidths = [375, 768, 1280];
const publications = JSON.parse(execFileSync('ruby', [
  '-ryaml', '-rjson', '-e', 'puts JSON.generate(YAML.load_file(ARGV.fetch(0)))',
  path.join(__dirname, '../_data/publications.yml')
], { encoding: 'utf8' }));
const monthlyIssues = publications.filter(item => item.issue_month)
  .sort((a, b) => b.issue_month.localeCompare(a.issue_month));
const publicationGroups = {
  recordings: ['benchmark-presentation', 'node-ipc-interview', 'security-livestream'],
  'engineering-essays': ['fresh-sandbox-github'],
  'monthly-reviews': monthlyIssues.map(item => item.id),
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
    assert.equal(await toggle.locator('.play-caption').innerText(), 'Play here');
    const source = disclosure.locator('..').getByRole('link', { name: /watch on youtube/i });
    const spotlight = new URL(start).pathname === '/' && id === ids[0];
    if (spotlight) {
      assert.equal(await source.count(), 0, 'Use the player as the single spotlight action');
    } else {
      assert.ok(await source.isVisible(), 'Expose the original recording before playback');
      assert.equal(await source.getAttribute('href'), 'https://www.youtube.com/watch?v=' + id);
      assert.equal(await disclosure.locator('..').locator('details + a.watch-source').count(), 1);
    }
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
    if (!spotlight) assert.ok(await source.isVisible(), 'Keep the source available while playing');
    assert.equal(page.url(), start);
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

async function captureSection(page, section, name) {
  const dir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
  fs.mkdirSync(dir, { recursive: true });
  const version = new URL(origin).hostname === '127.0.0.1' ? 'preview' : 'live';
  const viewport = page.viewportSize();
  if (viewport.width === 375) await page.setViewportSize({ width: 375, height: 812 });
  await section.evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.screenshot({ path: path.join(dir, version + '-' + name + '-' + viewport.width + '.jpg'), quality: 82, animations: 'disabled' });
  if (viewport.width === 375) await page.setViewportSize(viewport);
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
  assert.equal(await panel.locator('h2').innerText(), 'Terminal-Bench-Science');
  assert.equal(await panel.getByRole('link').count(), 0, 'Keep extra navigation out of the spotlight');
  const summary = panel.locator(':scope > p');
  assert.match(await summary.innerText(), /AI agents on scientific workflows.*approved.*MDD Executive Function.*maintainer and reviewer.*paper.*ongoing work.*coming soon/s);
  const heading = await panel.locator('h2').boundingBox();
  const player = await panel.locator('summary').boundingBox();
  const copy = await summary.boundingBox();
  assert.ok(heading.y + heading.height <= player.y + 1 && player.y + player.height <= copy.y + 1,
    'Present the project name, video and short summary in order');
  if (width === 375) assert.ok(player.y + player.height <= 812, 'The whole spotlight poster fits on the first phone screen');
  const cover = panel.locator('.publication-video img');
  await decodeCover(cover);
  const artPath = await cover.evaluate(img => new URL(img.currentSrc).pathname);
  assert.equal(artPath, width <= 850 ? '/assets/publications/benchmark-session.jpg' : '/assets/publications/benchmark-meta-analysis.jpg');
  const dimensions = await cover.evaluate(img => ({
    width: img.naturalWidth, height: img.naturalHeight,
    declaredWidth: Number(img.getAttribute('width')), declaredHeight: Number(img.getAttribute('height'))
  }));
  assert.ok(dimensions.width >= 960 && dimensions.width * 9 === dimensions.height * 16, 'Expected a high-resolution 16:9 research poster');
  assert.equal(dimensions.declaredWidth, dimensions.width);
  assert.equal(dimensions.declaredHeight, dimensions.height);
}

async function checkContactCard(page, width) {
  const card = page.locator('section#connect');
  assert.ok(await card.getByRole('heading', { name: 'Work with me', exact: true }).isVisible());
  const portrait = card.getByRole('img', { name: 'Aaron Schneider', exact: true });
  await decodeCover(portrait);
  const frame = await portrait.locator('..').boundingBox();
  const title = await card.locator('h2').boundingBox();
  assert.ok(frame.width >= 72 && frame.width <= 96 && Math.abs(frame.width - frame.height) < 1, 'Keep the portrait square at its display size');
  if (width >= 375) assert.ok(frame.x + frame.width <= title.x && frame.y < title.y + title.height && title.y < frame.y + frame.height,
    'Place the portrait alongside the contact heading');
  const routes = [
    ['Individual consulting', 'Aaron Schneider on LinkedIn', 'https://www.linkedin.com/in/aarondrewschneider/'],
    ['Team consulting', 'CommonDevOps on LinkedIn', 'https://www.linkedin.com/company/commondevops/']
  ];
  const originalViewport = page.viewportSize();
  const rows = card.locator('dl > div');
  const links = card.getByRole('link');
  assert.equal(await rows.count(), routes.length);
  assert.equal(await links.count(), routes.length);
  for (const [index, [audience, recipient, url]] of routes.entries()) {
    const row = rows.nth(index);
    assert.equal(await row.locator('dt').innerText(), audience);
    const contact = row.locator('dd').getByRole('link', { name: recipient, exact: true });
    assert.equal(await contact.getAttribute('href'), url);
    assert.equal(await card.locator('a[href="' + url + '"]').count(), 1, 'Offer each consulting contact once in the card');
  }
  assert.equal(await page.getByRole('link', { name: 'Subscribe on YouTube' }).count(), 0);
  const footer = page.getByRole('contentinfo');
  assert.equal((await footer.innerText()).trim(), 'Aaron Schneider');
  const signature = footer.locator('.footer-signature');
  const fontLoaded = await signature.evaluate(async el => {
    const style = getComputedStyle(el);
    const faces = await document.fonts.load(style.fontStyle + ' ' + style.fontSize + ' "Instrument Serif"', el.textContent);
    return style.fontFamily.includes('Instrument Serif') && faces.some(face => face.status === 'loaded');
  });
  assert.ok(fontLoaded, 'Render the signature with its local italic font');
  const profiles = footer.getByRole('link');
  assert.equal(await profiles.count(), 2);
  for (const [label, url] of [
    ['Aaron Schneider on LinkedIn', 'https://www.linkedin.com/in/aarondrewschneider/'],
    ['CommonDevOps on YouTube', 'https://www.youtube.com/@commondevops']
  ]) {
    const link = footer.getByRole('link', { name: label, exact: true });
    assert.equal(await link.getAttribute('href'), url);
    const box = await link.boundingBox();
    assert.ok(box.width >= 48 && box.height >= 48, 'Give each icon a generous touch target');
    const mark = await link.locator('svg use').evaluate(use => {
      const { width, height } = use.getBBox();
      return { width, height };
    });
    assert.ok(mark.width >= 30 && mark.height >= 30, 'Render a recognizable footer icon');
  }

  if (width === 320) {
    const larger = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    for (const item of await card.locator('h2, .contact-portrait, dt, dd a').all()) {
      const fits = await item.evaluate(el => {
        const box = el.getBoundingClientRect();
        const text = document.createRange();
        text.selectNodeContents(el);
        return box.left >= -1 && box.right <= innerWidth + 1 &&
          [...text.getClientRects()].every(line => line.left >= -1 && line.right <= innerWidth + 1) &&
          (el.tagName !== 'A' || (box.height >= 44 && box.width >= 44));
      });
      assert.ok(fits, 'The contact row must fit at 320px with doubled text: ' + await item.innerText());
    }
    assert.ok(await footer.evaluate(el => el.scrollWidth <= innerWidth && [...el.querySelectorAll('.footer-signature, a')].every(item => {
      const box = item.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth;
    })), 'The footer name and social profiles must fit with doubled text');
    await larger.evaluate(el => el.remove());
  }
  if (width === 375 || width === 1280) {
    if (width === 375) await page.setViewportSize({ width, height: 812 });
    await page.goto(new URL('/#connect', origin).href);
    assert.equal(await page.locator(':target').getAttribute('id'), 'connect');
    const rectangles = await links.evaluateAll(items => items.map(el => el.getBoundingClientRect().toJSON()));
    assert.ok(rectangles.every(box => box.top >= -1 && box.bottom <= page.viewportSize().height + 1), 'Both contacts should be visible at #connect');
    if (width === 375) assert.ok(rectangles[0].bottom <= rectangles[1].top, 'Stack the contact routes on phones');
    await captureSection(page, card, 'home-contact-card');
    const precedingLink = page.locator('#home-media a:visible').last();
    await precedingLink.focus();
    for (const link of [...await links.all(), ...await profiles.all()]) {
      await page.keyboard.press('Tab');
      const isContact = await link.evaluate(el => Boolean(el.closest('#connect')));
      const focusColor = isContact ? 'rgb(255, 213, 138)' : 'rgb(48, 37, 29)';
      assert.ok(await link.evaluate((el, expectedOutline) => {
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return el === document.activeElement && el.matches(':focus-visible') && style.outlineStyle !== 'none' &&
          parseFloat(style.outlineWidth) > 0 && box.width >= 44 && box.height >= 44 && style.outlineColor === expectedOutline;
      }, focusColor), 'Tab should reach the consulting contacts and then both social profiles in order');
      if (isContact) {
        const clearance = await link.evaluate(el => {
          const text = document.createRange();
          text.selectNodeContents(el.closest('dl > div').querySelector('dt'));
          const style = getComputedStyle(el);
          return el.getBoundingClientRect().top - parseFloat(style.outlineOffset) -
            parseFloat(style.outlineWidth) - text.getBoundingClientRect().bottom;
        });
        assert.ok(clearance >= 1, 'Keep the focus ring below the audience label at ' + width + 'px; clearance ' + clearance + 'px');
      }
      if (await link.getAttribute('href') === routes[1][2]) await captureSection(page, card, 'home-contact-keyboard');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await links.first().focus();
    const arrow = await links.first().evaluate(el => {
      const style = getComputedStyle(el, '::after');
      return [style.transform, style.transitionDuration];
    });
    assert.deepEqual(arrow, ['none', '0s'], 'Keep the focused contact arrow still with reduced motion');
    await page.emulateMedia({ reducedMotion: null });
    if (width === 375) await page.setViewportSize(originalViewport);
  }
}

async function checkHomepage(page) {
  const width = page.viewportSize().width;
  const sequence = await page.locator('main > .hero, main > .selected-results, main > #home-media, main > #connect')
    .evaluateAll(items => items.map(el => el.id || (el.classList.contains('hero') ? 'hero' : 'results')));
  assert.deepEqual(sequence, ['hero', 'results', 'home-media', 'connect'], 'Show engineering results before the media collection and contacts');
  const nav = page.locator('.site-header nav');
  if (width >= 768) {
    assert.ok(await nav.isVisible(), 'Show the main links when there is room');
    const brand = await page.locator('.site-header .brand').boundingBox();
    const links = await nav.boundingBox();
    const navRows = await nav.locator('a').evaluateAll(items => items.map(a => Math.round(a.getBoundingClientRect().top)));
    assert.ok(Math.min(brand.y + brand.height, links.y + links.height) > Math.max(brand.y, links.y) && new Set(navRows).size === 1,
      'Keep the brand and all four links on one row at ' + width + 'px: ' + JSON.stringify({ brand, links, navRows }));
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
  assert.equal(await page.locator('.hero > div > .eyebrow, .hero a[href="/work/westinghouse-performance/"]').count(), 0);
  assert.deepEqual(await heroLinks.allTextContents(), ['Explore selected work', 'View experience']);
  assert.deepEqual(await heroLinks.evaluateAll(links => links.map(link => link.pathname)), ['/work/', '/experience/']);
  await checkActionTargets(heroLinks, width === 375);
  if (width === 320 || width === 375) {
    const largerText = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await checkActionTargets(heroLinks);
    const menu = page.locator('.site-header').getByRole('button', { name: /menu/i });
    await menu.press('Enter');
    const controls = page.locator('.site-header a, .site-header button');
    assert.ok(await controls.evaluateAll(items => items.every(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.left >= -1 && r.right <= innerWidth + 1 && el.scrollWidth <= el.clientWidth + 1;
    })), 'Menu controls must fit at enlarged text size');
    await menu.press('Escape');
    await largerText.evaluate(style => style.remove());
  }
  if (width === 375) {
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
  await checkResearchFeature(hero, width);

  const cards = page.locator('#home-media .media-card');
  assert.equal(await cards.count(), 4);
  if (width === 1280) {
    const heights = await cards.evaluateAll(items => items.map(item => item.clientHeight));
    assert.equal(new Set(heights).size, 1, 'Closed desktop media cards should align');
  }
  const recordings = cards.filter({ has: page.locator('details.publication-video') });
  assert.equal(await recordings.count(), 2);
  assert.equal(await recordings.locator('h3 a').count(), 0, 'Recording headings should not take the visitor off site');
  const linkedCovers = cards.locator('a').filter({ has: page.locator('img') });
  assert.equal(await linkedCovers.count(), 2);
  assert.deepEqual((await linkedCovers.evaluateAll(links => links.map(a => a.href))).sort(), [
    'https://commondevops.com/node-ipc-supply-chain-incident-report/',
    monthlyIssues[0].url
  ].sort());
  const newsletter = cards.first();
  assert.equal(await newsletter.locator('.media-story').getAttribute('href'), monthlyIssues[0].url);
  assert.equal(await newsletter.locator('h3').textContent(), monthlyIssues[0].title);
  assert.equal(await newsletter.getByRole('link', { name: 'Newsletter archive' }).getAttribute('href'), '/articles/#monthly-reviews');
  for (const card of await cards.all()) {
    assert.equal(await card.locator('img').count(), 1);
    await decodeCover(card.locator('img'));
    const isWritten = (await card.locator('a.media-story').count()) === 1;
    const cue = await card.locator('h3').evaluate(el => getComputedStyle(el, '::after').content);
    assert.equal(cue.includes('↗'), isWritten, 'Give linked written headlines a cue distinct from recording headings');
    if (isWritten) {
      const isNewsletter = (await card.locator('.media-story').getAttribute('href')) === monthlyIssues[0].url;
      assert.equal(await card.getByRole('link').count(), isNewsletter ? 2 : 1);
    }
  }
  if (width === 375 || width === 1280) await captureSection(page, page.locator('#home-media'), 'home-media');

  const projects = [
    ['/work/indiana-case-archives/', /92.*counties|counties.*92/is],
    ['/work/westinghouse-performance/', /3\s*[×x]|tripl|threefold/i]
  ];
  for (const [dest, result] of projects) {
    const project = page.locator('.feature').filter({ has: page.locator('a[href="' + dest + '"]') });
    assert.equal(await project.count(), 1, 'Missing featured project ' + dest);
    assert.match(await project.innerText(), result);
  }
  const results = page.locator('.selected-results');
  assert.equal(await results.getByRole('link', { name: 'Browse project summaries' }).getAttribute('href'), '/work/#project-summaries');
  const mediaHeading = page.locator('#home-media').getByRole('heading', { name: 'Articles & Demos', exact: true });
  const collectionLink = mediaHeading.getByRole('link', { name: 'Articles & Demos', exact: true });
  assert.equal(await collectionLink.getAttribute('href'), '/articles/');
  assert.ok((await collectionLink.boundingBox()).height >= 44, 'Keep the linked collection heading easy to activate');
  if (width === 320) {
    const largeText = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    assert.ok(await collectionLink.evaluate(el => el.scrollWidth <= el.clientWidth + 1 && el.getBoundingClientRect().right <= innerWidth),
      'The linked heading should wrap at doubled phone text sizes');
    await largeText.evaluate(style => style.remove());
  }
  for (const card of await results.locator('.feature').all()) {
    assert.equal(await card.getByRole('link').count(), 1, 'Give each result a single link');
    assert.ok(await card.locator('h3 a').isVisible(), 'The result heading opens the evidence');
  }
  if (width === 375 || width === 1280) await captureSection(page, results, 'home-results');
  const checkout = page.locator('.feature').filter({ has: page.locator('a[href="/work/super-salon-checkout/"]') });
  assert.match(await checkout.locator('h3').innerText(), /caught.*checkout.*before release/i);
  assert.match(await checkout.locator('p').last().innerText(), /automated test.*one.cent.*online.*desktop/i);
  await checkContactCard(page, width);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Homepage overflows');
  if (width === 1280) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const immediate = await page.locator('.hero .button, .hero .play-mark, #connect a, .social-links a').evaluateAll(controls =>
      controls.every(el => getComputedStyle(el).transitionDuration.split(',').every(value => parseFloat(value) === 0)));
    assert.ok(immediate, 'Respect reduced motion for hero, contact and footer controls');
    await page.emulateMedia({ reducedMotion: null });
  }
}

async function checkFallbacks(page) {
  const videos = page.locator('.publication-video');
  const urls = [];
  for (const video of await videos.all()) {
    const container = video.locator('..');
    const fallback = container.getByRole('link', { name: /on youtube/i });
    assert.ok(await fallback.isVisible(), 'Expose the original with JavaScript disabled');
    if (await container.locator('noscript > a.video-poster').count()) {
      assert.equal(await video.isVisible(), false, 'Show one working poster when scripting is disabled');
      assert.ok(await fallback.locator('img').isVisible());
    }
    urls.push(await fallback.getAttribute('href'));
  }
  assert.deepEqual(urls.sort(), ids.map(id => 'https://www.youtube.com/watch?v=' + id).sort());
  assert.equal(await page.locator('iframe').count(), 0);
}

async function checkGraderGuide(page, directEntry = false) {
  const url = new URL(graderGuide, origin).href;
  if (directEntry) {
    await page.goto(url);
  } else {
    const entry = page.locator('#benchmark-presentation').getByRole('link', { name: 'Grader guide' });
    assert.equal(await entry.getAttribute('href'), graderGuide);
    await Promise.all([page.waitForURL(url), entry.press('Enter')]);
  }
  const heading = page.locator('.study-copy h2:target');
  await heading.waitFor({ state: 'visible', timeout: 5000 });
  assert.equal(await heading.getAttribute('id'), 'checking-the-grader');
  const target = await heading.evaluate(el => {
    const box = el.getBoundingClientRect();
    return { focused: document.activeElement === el, inViewport: box.top >= -1 && box.bottom <= innerHeight };
  });
  assert.ok(target.focused && target.inViewport, 'The guide link must land on its visible, focused heading');

  const sources = page.locator('.study-copy a[href^="https://www.youtube.com/watch?"]');
  assert.equal(await sources.count(), 3);
  for (const [id, seconds, label] of [
    ['ICz5Q1s5QAg', 471, '7:51'], ['zPNJW0DI5PA', 806, '13:26'], ['fN4p2HbGkog', 791, '13:11']
  ]) {
    const link = sources.filter({ hasText: label });
    assert.ok(await link.isVisible(), 'Missing source timestamp ' + label);
    const sourceUrl = new URL(await link.getAttribute('href'));
    assert.equal(sourceUrl.searchParams.get('v'), id);
    assert.equal(sourceUrl.searchParams.get('t'), seconds + 's');
    assert.ok(await link.evaluate(el => Boolean(document.querySelector('h2:target').compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)),
      'Timestamp should appear in the guide after its heading');
  }
  const mergedTask = page.locator('.study-copy a[href="https://github.com/harbor-framework/terminal-bench-science/pull/1513"]');
  assert.ok(await mergedTask.isVisible());
  if (directEntry || page.viewportSize().width === 1280) {
    const dir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
    fs.mkdirSync(dir, { recursive: true });
    const version = new URL(origin).hostname === '127.0.0.1' ? 'preview' : 'live';
    await page.screenshot({ path: path.join(dir, version + '-grader-guide-' + page.viewportSize().width + '.jpg'), quality: 82, animations: 'disabled' });
  }
  const overview = page.locator('.case-study').getByRole('link', { name: 'Case overview', exact: true });
  assert.equal(await overview.getAttribute('href'), '#case-title');
  await overview.press('Enter');
  assert.ok(await page.locator('h1#case-title:target').evaluate(el => el === document.activeElement));
  const back = page.locator('.case-study').getByRole('link', { name: 'Benchmark recording', exact: true });
  assert.equal(await back.getAttribute('href'), presentation);
  await Promise.all([page.waitForURL(new URL(presentation, origin).href), back.press('Enter')]);
  assert.ok(await page.locator('#benchmark-presentation:target summary').isVisible());
}

async function checkEssay(page, { capture = false, directEntry = false } = {}) {
  const title = 'What a fresh sandbox inherits from GitHub';
  const essayPath = '/articles/fresh-sandbox-github/';
  const directory = page.locator('.publication-group[aria-labelledby="engineering-essays"]');
  const entry = directory.locator('#fresh-sandbox-github');
  assert.equal((await entry.locator('.attribution').innerText()).trim(), 'By Aaron Schneider');
  const coverLink = entry.locator('a.collection-cover');
  const cover = coverLink.locator('img');
  await decodeCover(cover);
  assert.equal(await coverLink.getAttribute('href'), essayPath);
  assert.ok(await cover.evaluate(img => new URL(img.currentSrc).pathname === '/assets/publications/chess-render.jpg' &&
    img.naturalWidth === 1280 && img.naturalHeight === 720 && /chess|board/i.test(img.alt)));
  const frame = await coverLink.boundingBox();
  assert.ok(frame.width > 0 && Math.abs(frame.width - frame.height) <= 2, 'The chessboard thumbnail should have a square frame');
  if (capture) await captureSection(page, directory, 'engineering-essays-entry');
  const link = entry.locator('h3').getByRole('link', { name: title, exact: true });
  assert.equal(await link.getAttribute('href'), essayPath);
  await Promise.all([page.waitForURL(new URL(essayPath, origin).href), link.press('Enter')]);
  if (directEntry) await page.reload();
  const article = page.locator('.engineering-essay');
  assert.equal(await article.getByRole('heading', { level: 1, name: title, exact: true }).count(), 1);
  assert.equal(await article.locator('.essay-meta').count(), 1);
  assert.equal((await article.locator('.essay-meta').innerText()).trim(), 'By Aaron Schneider');
  assert.equal(await page.locator('.site-header [aria-current="location"]').getAttribute('href'), '/articles/');
  const recording = article.locator('a[href="https://www.youtube.com/watch?v=i0a7tXSLj3c&t=3571s"]');
  assert.ok(await recording.isVisible());
  const milestone = 'https://github.com/commondevops/llm-chess-experiment/blob/8d660666fc25a99a8846a2867089f8cfe6381f63/milestone1_local_recreation_instructions.md#L16-L51';
  assert.ok(await article.locator('a[href="' + milestone + '"]').isVisible(), 'Link the example to the pinned project instructions');
  if (capture) {
    await captureSection(page, article, 'engineering-essay');
    if (page.viewportSize().width === 375) {
      const normal = page.viewportSize();
      await page.setViewportSize({ width: 320, height: 812 });
      const larger = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      assert.ok(await article.evaluate(el => {
        return document.documentElement.scrollWidth <= innerWidth + 1 &&
          [...el.querySelectorAll('h1, h2, p, a')].every(node => {
            const range = document.createRange();
            range.selectNodeContents(node);
            return [...range.getClientRects()].every(rect => rect.left >= -1 && rect.right <= innerWidth + 1);
          });
      }), 'The engineering essay should reflow at 320px with doubled text');
      await larger.evaluate(el => el.remove());
      await page.setViewportSize(normal);
    }
  }
  const returnLink = article.getByRole('link', { name: 'Engineering essays', exact: true });
  const section = '/articles/#engineering-essays';
  assert.equal(await returnLink.getAttribute('href'), section);
  await Promise.all([page.waitForURL(new URL(section, origin).href), returnLink.press('Enter')]);
  assert.ok(await page.locator('h2#engineering-essays:target').evaluate(el => el === document.activeElement),
    'Return to the focused section heading using the native collection link');
}

async function checkDiscovery(page) {
  const collection = new URL('/articles/', origin).href;
  const benchmark = page.locator('#benchmark-presentation');
  const mergedTask = 'https://github.com/harbor-framework/terminal-bench-science/pull/1513';
  assert.equal(await benchmark.getByRole('link', { name: 'Merged task on GitHub' }).getAttribute('href'), mergedTask);
  const caseLinks = benchmark.locator('a[href^="/work/scientific-ai-benchmark/"]');
  assert.deepEqual(await caseLinks.evaluateAll(links => links.map(a => a.pathname + a.hash)), [graderGuide]);
  const headings = await page.locator('.publication-group > h2').evaluateAll(items => items.map(el => el.id));
  assert.deepEqual(headings, Object.keys(publicationGroups), 'Keep all four publication sections in reading order');
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
      const title = (await row.locator('h3 .publication-title').textContent()).trim();
      assert.equal(await permalink.getAttribute('href'), '#' + entry);
      assert.ok(await row.getByRole('link', { name: 'Link to ' + title, exact: true }).isVisible(), 'Missing descriptive permalink for ' + entry);
      assert.ok(await permalink.evaluate(el => { const box = el.getBoundingClientRect(); return box.width >= 44 && box.height >= 44; }));
      await permalink.press('Enter');
      assert.equal(page.url(), collection + '#' + entry);
      assert.ok(await row.locator('h3').isVisible());
    }
  }
  for (const [from, to, jumpLabel] of [
    ['node-ipc-report', 'node-ipc-interview', 'Interview details on this page'],
    ['node-ipc-interview', 'node-ipc-report', 'Report details on this page']
  ]) {
    const row = page.locator('#' + from);
    const incident = row.locator('.publication-case');
    const incidentPath = '/work/node-ipc-investigation/';
    assert.equal(await incident.getAttribute('href'), incidentPath);
    assert.ok(await row.getByRole('link', { name: 'node-ipc investigation', exact: true }).isVisible());
    if (from === 'node-ipc-report') {
      await Promise.all([page.waitForURL(new URL(incidentPath, origin).href), incident.press('Enter')]);
      const reportEntry = page.locator('.study-copy a[href="/articles/#node-ipc-report"]');
      await Promise.all([page.waitForURL(collection + '#' + from), reportEntry.press('Enter')]);
      assert.ok(await page.locator('li.publication:target h3').isVisible());
    }
    const link = row.getByRole('link', { name: jumpLabel, exact: true });
    assert.equal(await link.getAttribute('href'), '#' + to);
    await link.press('Enter');
    assert.equal(page.url(), collection + '#' + to);
    assert.ok(await page.locator('li.publication:target h3').isVisible());
  }
}

async function checkEnlargedCollection(page) {
  const original = page.viewportSize();
  await page.setViewportSize({ width: 320, height: 812 });
  const largerText = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  const interview = page.locator('#node-ipc-interview');
  const title = interview.locator('.publication-title');
  assert.ok(await title.evaluate(el => {
    const text = el.firstChild;
    return ['Brandon', 'Miller'].every(word => {
      const index = text.textContent.indexOf(word);
      if (index === -1) return false;
      const range = document.createRange();
      range.setStart(text, index);
      range.setEnd(text, index + word.length);
      const rects = Array.from(range.getClientRects());
      return rects.length === 1 && rects[0].width > 0 && rects[0].left >= -1 && rects[0].right <= innerWidth + 1;
    });
  }), 'Keep each word of the guest’s name legible at 320px with doubled text');
  const report = page.locator('#node-ipc-report .report-masthead');
  await decodeCover(report.locator('img'));
  const crop = await report.evaluate(frame => {
    const img = frame.querySelector('img');
    const view = frame.getBoundingClientRect();
    const art = img.getBoundingClientRect();
    const scale = art.width / img.naturalWidth;
    // The printed NODE-IPC heading occupies x=147–292 of the 640px original.
    return {
      source: new URL(img.currentSrc).pathname, aspect: view.width / view.height,
      left: (view.left - art.left) / scale, right: (view.right - art.left) / scale,
      clipped: getComputedStyle(frame).overflowX === 'hidden'
    };
  });
  assert.equal(crop.source, '/assets/experience/commondevops.png');
  assert.ok(crop.clipped && Math.abs(crop.aspect - 16 / 7) < 0.08 && crop.left <= 147 && crop.right >= 292,
    'Keep the printed report name inside its compact masthead: ' + JSON.stringify(crop));
  for (const item of [interview, page.locator('#node-ipc-report')]) {
    for (const control of await item.locator('h3, .entry-permalink, .meta, .watch-source, .publication-actions a').all()) {
      const box = await control.boundingBox();
      assert.ok(box && box.width > 0 && box.x >= -1 && box.x + box.width <= 321,
        'A compact publication control overflows at 320px with doubled text: ' + JSON.stringify(box));
    }
  }
  await captureSection(page, interview, 'articles-interview-double-text');
  await largerText.evaluate(style => style.remove());
  await page.setViewportSize(original);
}

async function checkPhoneEntry(browser) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(new URL('/articles/', origin).href);
  const header = page.locator('.site-header');
  const menu = header.getByRole('button', { name: /menu/i });
  const nav = header.locator('nav');
  const headerBox = await header.boundingBox();
  const menuBox = await menu.boundingBox();
  assert.ok(headerBox.height <= 80 && menuBox.width >= 44 && menuBox.height >= 44, 'Compact header needs a 44px Menu target');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await nav.isVisible(), false);

  const featured = page.locator('#benchmark-presentation');
  const title = await featured.locator('h3').boundingBox();
  const poster = await featured.locator('picture.benchmark-cover').boundingBox();
  const play = await featured.locator('summary .play-mark').boundingBox();
  const row = await featured.boundingBox();
  const source = await featured.getByRole('link', { name: /watch on youtube/i }).boundingBox();
  assert.ok(await featured.locator('h3 .keep-term').evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return el.textContent === 'meta-analysis' && range.getClientRects().length === 1;
  }), 'Keep meta-analysis together in the phone recording title');
  for (const [name, box] of Object.entries({ title, poster, play, source })) {
    assert.ok(box.y >= 0 && box.y + box.height <= 812 && box.x >= 0 && box.x + box.width <= 376,
      'First recording ' + name + ' must fit before scrolling at 375×812: ' + JSON.stringify(box));
  }
  assert.ok(title.y + title.height <= poster.y + 1 && poster.width >= row.width * 0.9 &&
    Math.abs(poster.width / poster.height - 16 / 9) < 0.04, 'Feature the recording title above a wide 16:9 poster');
  const dir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
  fs.mkdirSync(dir, { recursive: true });
  const version = new URL(origin).hostname === '127.0.0.1' ? 'preview' : 'live';
  await page.screenshot({ path: path.join(dir, version + '-articles-375x812.jpg'), quality: 85, animations: 'disabled' });
  await featured.locator('summary').press('Enter');
  const frame = featured.locator('iframe');
  await frame.waitFor({ state: 'visible' });
  assert.ok((await frame.boundingBox()).width >= row.width - 4, 'The open phone player should span the available row');
  await featured.locator('summary').press('Space');
  await frame.waitFor({ state: 'detached' });
  for (const entry of publicationGroups.recordings.slice(1)) {
    const other = page.locator('#' + entry);
    const art = await other.locator('.video-poster img').boundingBox();
    const heading = await other.locator('h3').boundingBox();
    assert.ok(art.width < poster.width / 2 && art.x + art.width <= heading.x + 1 &&
      Math.min(art.y + art.height, heading.y + heading.height) > Math.max(art.y, heading.y),
      'Compact recording should pair its cover with its title: ' + entry);
  }

  await checkEnlargedCollection(page);
  await menu.press('Enter');
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  const links = nav.locator('a');
  assert.deepEqual(await links.evaluateAll(items => items.map(a => a.pathname)), ['/', '/experience/', '/work/', '/articles/']);
  const currentPage = nav.locator('a[aria-current="page"]');
  assert.equal(await currentPage.getAttribute('href'), '/articles/');
  assert.ok(await currentPage.evaluate(el => parseFloat(getComputedStyle(el, '::after').height) >= 2),
    'Mark the current section visually in the expanded menu');
  await captureSection(page, header, 'mobile-menu-open');
  for (const link of await links.all()) {
    await page.keyboard.press('Tab');
    assert.ok(await link.evaluate(el => {
      const b = el.getBoundingClientRect();
      return document.activeElement === el && el.matches(':focus-visible') && getComputedStyle(el).outlineStyle !== 'none' &&
        b.width >= 44 && b.height >= 48;
    }), 'Menu links need keyboard focus in document order and 48px rows');
  }
  await page.keyboard.press('Escape');
  assert.equal(await nav.isVisible(), false);
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.ok(await menu.evaluate(el => document.activeElement === el), 'Escape should return focus to Menu');
  await menu.press('Space');
  await page.mouse.click(2, 12);
  await nav.waitFor({ state: 'hidden' });
  assert.equal(await menu.getAttribute('aria-expanded'), 'false', 'An outside click should close the menu');

  await page.setViewportSize({ width: 1024, height: 812 });
  await nav.waitFor({ state: 'visible' });
  await links.first().focus();
  await page.setViewportSize({ width: 375, height: 812 });
  await nav.waitFor({ state: 'hidden' });
  assert.ok(await menu.evaluate(el => document.activeElement === el), 'Move focus from a hidden link to Menu on resize');

  await page.setViewportSize({ width: 1024, height: 812 });
  await menu.waitFor({ state: 'hidden' });
  assert.ok(await currentPage.evaluate(el => document.activeElement === el), 'Restore focus to the current desktop section');
  await page.setViewportSize({ width: 375, height: 812 });
  await menu.waitFor({ state: 'visible' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await menu.locator('.menu-glyph').evaluate(el => getComputedStyle(el, '::before').transitionDuration), '0s');
  await menu.press('Space');
  const workUrl = new URL('/work/', origin).href;
  await Promise.all([page.waitForURL(workUrl), nav.getByRole('link', { name: 'Selected Work' }).press('Enter')]);
  await page.close();
}

async function checkNoScript(browser) {
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  await page.goto(origin);
  const reviewDir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
  fs.mkdirSync(reviewDir, { recursive: true });
  const version = new URL(origin).hostname === '127.0.0.1' ? 'preview' : 'live';
  const checkout = page.locator('.feature').filter({ has: page.locator('a[href="/work/super-salon-checkout/"]') });
  await checkout.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: path.join(reviewDir, version + '-super-salon-outcome-375x812.jpg'), quality: 82 });
  const header = page.locator('.site-header');
  const links = header.locator('nav a');
  assert.deepEqual(await links.evaluateAll(items => items.map(a => a.pathname)), ['/', '/experience/', '/work/', '/articles/']);
  await header.locator('.brand').focus();
  for (const link of await links.all()) {
    await page.keyboard.press('Tab');
    assert.ok(await link.evaluate(el => el === document.activeElement && el.getBoundingClientRect().height > 0), 'No-script navigation must be visible and reachable by keyboard');
  }
  await checkFallbacks(page);
  const deepLink = new URL('/articles/#node-ipc-interview', origin).href;
  await page.goto(deepLink);
  await page.reload();
  assert.equal(page.url(), deepLink);
  assert.ok(await page.locator(':target h3').isVisible(), 'Shared entry must resolve without JavaScript');
  assert.ok(await page.locator(':target').evaluate(el => getComputedStyle(el).outlineStyle === 'none'), 'A shared URL should emphasize the title without outlining the whole article row');
  assert.ok(await page.locator(':target h3').evaluate(el => parseFloat(getComputedStyle(el, '::before').borderInlineStartWidth) > 0), 'Mark the heading of the incoming publication');
  await page.screenshot({ path: path.join(reviewDir, version + '-shared-recording-375x812.jpg'), quality: 82 });
  await checkGraderGuide(page, true);
  await checkDiscovery(page);
  await checkEssay(page, { directEntry: true });
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
  const collectionLink = page.locator('#writing-title').getByRole('link', { name: 'Articles & Demos', exact: true });
  const collectionUrl = new URL('/articles/', origin).href;
  await Promise.all([page.waitForURL(collectionUrl), collectionLink.press('Enter')]);
  const benchmark = page.locator('#benchmark-presentation');
  const preview = benchmark.locator('picture.benchmark-cover img');
  await decodeCover(preview);
  assert.equal(await preview.evaluate(img => new URL(img.currentSrc).pathname), '/assets/publications/benchmark-session.jpg');
  assert.equal(await benchmark.getByRole('link', { name: /watch on youtube/i }).getAttribute('href'), 'https://www.youtube.com/watch?v=e26_SSPpOP0');
  assert.equal(await page.locator('#node-ipc-report').getByRole('link', { name: 'Report on Figshare' }).getAttribute('href'), 'https://doi.org/10.6084/m9.figshare.33865414');
  await checkGraderGuide(page);
  await checkDiscovery(page);
  await checkEssay(page, { capture: true });
  const publications = page.locator('li.publication');
  assert.equal(await publications.count(), Object.values(publicationGroups).flat().length);
  for (const row of await publications.all()) {
    const cover = row.locator('img');
    assert.equal(await cover.count(), 1);
    await decodeCover(cover);
    if (!(await row.locator('.publication-video').count())) {
      const imageLink = row.locator('a.collection-cover').filter({ has: page.locator('img') });
      assert.equal(await imageLink.getAttribute('href'), await row.locator('h3 a').getAttribute('href'), 'Cover and title should open the same publication');
    } else {
      assert.equal(await row.locator('h3 a').count(), 0, 'Keep the title distinct from playback and source links');
      assert.ok(await row.getByRole('link', { name: /watch on youtube/i }).isVisible());
      assert.ok(await row.locator('summary .play-caption').isVisible(), 'Identify inline playback on the poster');
    }
    const frame = row.locator('.video-poster, a.collection-cover');
    const box = await frame.boundingBox();
    assert.ok(box.width > 0 && box.x >= -1 && box.x + box.width <= width + 1, 'Publication cover must fit its row');
  }
  const issue = page.locator('#october-review');
  const issueUrl = 'https://www.aaronschneider.org/common-devops-reports/reports/2026-10/';
  const archive = page.getByRole('region', { name: 'Monthly newsletter archive' });
  assert.match(await archive.locator('.archive-source').textContent(), /CommonDevOps.*LinkedIn/);
  assert.deepEqual(await archive.locator('time').evaluateAll(items => items.map(el => el.dateTime)),
    monthlyIssues.map(item => item.issue_month));
  assert.deepEqual(await archive.locator('.archive-year').allTextContents(),
    [...new Set(monthlyIssues.map(item => item.issue_month.slice(0, 4)))]);
  for (const item of monthlyIssues) {
    assert.equal(await archive.locator('#' + item.id + ' h3 a').getAttribute('href'), item.url);
  }
  assert.equal(await issue.getByRole('link', { name: 'Are AI Security Controls Keeping Up?', exact: true }).getAttribute('href'),
    'https://www.linkedin.com/pulse/october-2026-ai-security-controls-keeping-up-commondevops-a632c/');
  assert.equal(await issue.getByRole('link', { name: 'Web edition' }).getAttribute('href'), issueUrl);
  assert.equal(await issue.getByRole('link', { name: 'PDF edition' }).getAttribute('href'), issueUrl + 'common-devops-october-2026.pdf');
  const issueLink = issue.locator('h3 a');
  assert.ok(await issueLink.evaluate(el => !getComputedStyle(el).textDecorationLine.includes('underline')),
    'The structured October title should be quiet at rest');
  await issueLink.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  assert.ok(await issueLink.evaluate(el => {
    const style = getComputedStyle(el);
    return el === document.activeElement && el.matches(':focus-visible') &&
      style.textDecorationLine.includes('underline') && style.outlineStyle !== 'none';
  }), 'Keyboard focus should visibly identify the October title as an action');
  await page.locator('#monthly-reviews').focus();
  assert.equal(await page.locator('#september-review').getByRole('link', { name: 'Web edition', exact: true }).getAttribute('href'),
    'https://www.aaronschneider.org/common-devops-reports/reports/2026-09/');
  await captureSection(page, archive, 'newsletter-archive');
  for (const entry of ['october-review', 'node-ipc-report', 'node-ipc-interview']) {
    await captureSection(page, page.locator('#' + entry), 'articles-' + entry);
  }
  await checkPlayers(page);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Publication list overflows');
  if (width === 1280) {
    const html = await page.request.get(await issue.getByRole('link', { name: 'Web edition' }).getAttribute('href'));
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
    if (!baseline) {
      await checkPhoneEntry(browser);
      await checkNoScript(browser);
    }
  } finally {
    await browser.close();
  }
}

check().catch(error => { console.error(error); process.exitCode = 1; });
