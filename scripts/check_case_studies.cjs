const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium, webkit } = require('playwright-core');
const gallery = require('../_data/gallery.json');

const studies = [
  { card: 'propoint', path: 'from-booking-to-checkout', images: 4 },
  { card: 'propoint', path: 'super-salon-checkout', images: 2 },
  { card: 'indiana', path: 'indiana-case-archives', images: 0 },
  { card: 'bayer', path: 'bayer-aleve', images: 12 },
  { card: 'westinghouse', path: 'westinghouse-performance', images: 0 },
  { card: 'case-studies-title', path: 'scientific-ai-benchmark', images: 0 },
  { card: 'node-ipc', path: 'node-ipc-investigation', images: 0 },
  { card: 'chess-benchmarks', path: 'chess-puzzle-qa', images: 1 }
];
const projectNames = {
  propoint: 'ProPoint Global', indiana: 'Indiana State Department', bayer: 'Bayer',
  westinghouse: 'Westinghouse'
};

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

async function captureWork(page, name) {
  const dir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
  fs.mkdirSync(dir, { recursive: true });
  const version = new URL(page.url()).hostname === '127.0.0.1' ? 'preview' : 'live';
  await page.screenshot({ path: path.join(dir, version + '-work-' + name + '-' + page.viewportSize().width + '.jpg'), quality: 82, animations: 'disabled' });
}

async function checkDirectory(page, workUrl) {
  const feature = page.locator('.benchmark-feature');
  const read = feature.getByRole('link', { name: 'Explore the research task' });
  assert.match(await feature.locator('.benchmark-byline').innerText(), /^I co-authored “MDD Executive Function\.”.*effect sizes/);
  assert.equal(await feature.locator('.research-process').count(), 0);
  const action = await read.boundingBox();
  assert.ok(action.y + action.height <= page.viewportSize().height, 'Lead action fits the first screen');
  assert.deepEqual(await page.locator('.work-support').evaluateAll(items => items.map(el => el.id)), ['propoint', 'westinghouse', 'indiana']);
  assert.match(await page.locator('#propoint').innerText(), /Around 30,000[\s\S]*hundreds of millions/i);
  assert.match(await page.locator('#westinghouse .project-heading').innerText(), /3×\s+Elasticsearch throughput/);
  assert.match(await page.locator('#indiana .project-heading').innerText(), /92\s+counties/);
  const map = page.locator('#indiana .project-banner img');
  assert.match(await map.getAttribute('alt'), /Indiana.*92 counties/);
  assert.equal(await page.locator('#indiana .project-banner :is(a, button)').count(), 0);
  const first = await page.locator('#propoint .project-heading').boundingBox();
  assert.ok(first.y >= 0 && first.y + first.height <= page.viewportSize().height, 'The second project is identifiable without scrolling');
  if (page.viewportSize().width === 1280) {
    const cards = await page.locator('.work-support').evaluateAll(items => items.map(el => el.getBoundingClientRect().top));
    assert.ok(cards.every(top => Math.abs(top - cards[0]) <= 1), 'The three engineering projects share a row');
    const media = await page.locator('.featured-projects :is(.project-gallery, .project-banner)').evaluateAll(items =>
      items.map(el => el.getBoundingClientRect().top));
    assert.equal(media.length, 3);
    assert.ok(media.every(top => Math.abs(top - media[0]) <= 1), 'Featured project images align on desktop');
  }
  const routes = await page.locator('.benchmark-actions a, .work-links a').evaluateAll(items =>
    [...new Set(items.filter(a => a.pathname.startsWith('/work/') && !a.hash).map(a => a.pathname))].sort());
  assert.deepEqual(routes, studies.map(study => '/work/' + study.path + '/').sort());
  assert.equal(await page.locator('.project-card').count(), 7);
  const report = page.locator('#node-ipc');
  assert.match(await report.innerText(), /Three releases appeared on npm.*primary author/s);
  assert.deepEqual(await report.locator('a').evaluateAll(links => links.map(a => a.getAttribute('href'))), [
    '/work/node-ipc-investigation/', 'https://doi.org/10.6084/m9.figshare.33865414.v1'
  ]);
  const chess = page.locator('#chess-benchmarks');
  assert.equal(await chess.locator('a').count(), 2);
  assert.equal(await chess.getByRole('link', { name: 'View recording details' }).getAttribute('href'),
    '/articles/#chess-benchmark-presentation');
  assert.equal(await page.locator('.work-mast a, .portfolio-gallery > nav').count(), 0);
  assert.equal(await page.getByRole('heading', {name:'Gallery',exact:true}).count(), 0);
  assert.equal(await page.getByText('Project summaries', {exact:true}).count(), 0);
  assert.equal(await page.locator('main a[href="/experience/#nuix"]').count(), 0);
  await captureWork(page, 'directory');
  await map.scrollIntoViewIfNeeded();
  await map.evaluate(img => img.decode());
  await read.press('Enter');
  assert.equal(page.url(), workUrl + 'scientific-ai-benchmark/');
  await page.getByRole('link', {name:'Back to Selected Work',exact:true}).press('Enter');
  assert.equal(page.url(), workUrl + '#case-studies-title');
  assert.ok(await page.locator('h2:target').evaluate(el => el === document.activeElement));
}

async function checkGallery(page, workUrl, width, directEntry) {
  await page.goto(workUrl);
  for (const group of gallery) {
    await page.goto(workUrl + '#gallery-' + group.id);
    const section = page.locator('#gallery-' + group.id);
    if (group.static_on_work_index) {
      const banner = section.getByRole('img', { name: group.items[0].alt });
      assert.equal(await banner.getAttribute('src'), group.items[0].image);
      await banner.evaluate(img => img.decode());
      assert.equal(await section.locator('a, button').count(), 0);
      continue;
    }
    const links = section.locator('.thumbnail-card a');
    const displayed = group.id === 'propoint'
      ? group.items.filter(item => ['Book a service', 'Desktop checkout'].includes(item.title)) : group.items;
    assert.equal(await section.locator('h3').innerText(), group.title + ' images');
    assert.equal(await section.locator('details').count(), 0, 'Every displayed thumbnail is directly available');
    assert.deepEqual(await links.evaluateAll(items => items.map(a => a.pathname)), displayed.map(item => item.image));
    if (width === 1280 && group.contact_sheet) {
      const featured = group.items.filter(item => item.preview_label);
      assert.deepEqual(await section.locator('figcaption:visible').allTextContents(), featured.map(item => item.preview_label));
      const frames = await section.locator('.thumbnail-frame:visible').evaluateAll(items => items.map(item => item.getBoundingClientRect().toJSON()));
      assert.ok(frames[0].width > frames[1].width && frames[0].height > frames[1].height);
      const openAll = section.getByRole('button', { name: /View all/ });
      await openAll.click();
      const dialog = page.getByRole('dialog');
      for (const [i, item] of group.items.entries()) {
        assert.equal(await dialog.locator('.viewer-original').getAttribute('href'), new URL(item.image, workUrl).href);
        if (i < group.items.length - 1) await page.keyboard.press('ArrowRight');
      }
      await page.keyboard.press('Escape');
      await page.waitForFunction(id => document.activeElement === document.querySelector('#gallery-' + id + ' [data-open-collection]'), group.id);
    }
    for (const img of await links.locator('img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
    }
    if (width === 1280) {
      await captureWork(page, group.id + '-images');
      for (const item of group.items) {
        const response = await page.request.get(new URL(item.image, workUrl).href);
        assert.ok(response.ok() && response.headers()['content-type'].startsWith('image/'));
        await response.dispose();
      }
    }
  }
  const oldImages = page.locator('#gallery-propoint .old-image-bookmark');
  for (const link of await oldImages.all()) {
    await page.goto(workUrl + '#' + await link.getAttribute('id'));
    assert.ok(await link.isVisible(), 'Older individual image bookmarks still expose the original');
    assert.ok(await link.getAttribute('href'));
  }
  if (directEntry) {
    await page.goto(workUrl + '#westinghouse');
    assert.ok(await page.locator(':target').getByRole('heading').first().isVisible());
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Work page overflows');
  console.log(width + 'px: verified project thumbnails, original files and legacy bookmarks.');
}

async function openImageAndReturn(page, control) {
  const sourceUrl = page.url();
  const imageUrl = new URL(await control.getAttribute('href'), sourceUrl).href;
  const tabs = page.context().pages().length;
  assert.ok([null, '', '_self'].includes(await control.getAttribute('target')), 'Image link must open in the current tab');
  await control.scrollIntoViewIfNeeded();
  await control.focus();
  const before = await control.evaluate(el => ({
    id: el.id, focused: document.activeElement === el, bounds: el.getBoundingClientRect().toJSON(),
    scrollY, viewport: innerHeight, open: [...document.querySelectorAll('details[open]')].map(group => group.id)
  }));
  assert.ok(before.focused && before.bounds.top < before.viewport && before.bounds.bottom > 0,
    'The image link must have focus and be on screen before Enter: ' + JSON.stringify(before));
  await Promise.all([page.waitForURL(imageUrl, { waitUntil: 'load', timeout: 7000 }), page.keyboard.press('Enter')]);
  assert.equal(page.context().pages().length, tabs);
  const original = page.locator('img');
  await original.evaluate(async image => {
    await image.decode();
    if (!image.naturalWidth) throw new Error('The full-size image did not load');
  });
  await page.goBack({ waitUntil: 'load' });
  assert.equal(page.url(), sourceUrl);
  const sample = await page.evaluateHandle(() => ({ top: null, stableFrames: 0 }));
  try {
    // Poll a synchronous observation. An async predicate returns a truthy
    // Promise even on frames where the browser is still restoring focus.
    await page.waitForFunction(({ id, href, sample }) => {
      const el = document.activeElement;
      const bounds = el?.getBoundingClientRect();
      if (el?.id !== id || el.href !== href || !bounds.width || !bounds.height ||
          bounds.top >= innerHeight || bounds.bottom <= 0) {
        sample.stableFrames = 0;
        sample.top = null;
        return false;
      }
      sample.stableFrames = sample.top !== null && Math.abs(bounds.top - sample.top) <= 1
        ? sample.stableFrames + 1 : 1;
      sample.top = bounds.top;
      return sample.stableFrames >= 4;
    }, { href: imageUrl, id: before.id, sample }, { polling: 'raf', timeout: 7000 });
  } catch (error) {
    const after = await control.evaluate(el => ({
      id: el.id, activeId: document.activeElement?.id, activeHref: document.activeElement?.href,
      bounds: el.getBoundingClientRect().toJSON(), scrollY, viewport: innerHeight, fragment: location.hash,
      open: [...document.querySelectorAll('details[open]')].map(group => group.id), returnState: history.state?.imageReturn,
      navigation: performance.getEntriesByType('navigation')[0]?.type
    }));
    throw new Error('Back failed in ' + page.context().browser().browserType().name() + ': ' +
      JSON.stringify({ sourceUrl, imageUrl, before, after }), { cause: error });
  } finally {
    await sample.dispose();
  }
  assert.ok(await control.evaluate(el => el === document.activeElement), 'Return keyboard focus to the image that opened the original');
}

async function checkJoinedArrows(plate) {
  const buttons = plate.getByRole('button');
  assert.deepEqual(await buttons.allTextContents(), ['←', '→']);
  const [left, right] = await buttons.evaluateAll(items => items.map(item => item.getBoundingClientRect().toJSON()));
  assert.ok([left, right].every(box => box.width >= 44 && box.height >= 44));
  assert.ok(Math.abs(left.right - right.left) <= 1 && Math.abs(left.top - right.top) <= 1,
    'Previous and Next should share one edge');
}

async function checkRoleGalleries(browser, origin) {
  const url = new URL('/experience/', origin).href;
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(url);
  assert.equal(await page.locator('.role-gallery').count(), 3);
  const viewer = page.getByRole('dialog');

  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 812 });
    for (const group of gallery) {
      const role = page.locator('.role').filter({ has: page.locator('h2#' + group.role_id) });
      const strip = role.locator('.role-thumbnails');
      const links = strip.locator('a');
      if (group.items.length === 1) {
        assert.equal(await role.locator('a.image-enlarge').count(), 0);
        assert.ok(await role.locator('img.role-thumbnail').isVisible());
        continue;
      }
      const items = await links.evaluateAll(anchors => anchors.map(a => ({
        path: a.pathname, top: a.offsetTop, width: a.offsetWidth, height: a.offsetHeight
      })));
      assert.deepEqual(items.map(item => item.path), group.items.map(item => item.image));
      assert.ok(items.every(item => item.top === items[0].top && item.width >= 44 && item.height >= 44 && item.height <= 100));
      const row = await strip.evaluate(el => ({
        full: el.scrollWidth, visible: el.clientWidth, left: el.getBoundingClientRect().left
      }));
      assert.ok(Math.abs(row.left - await role.locator('.role-details').evaluate(el => el.getBoundingClientRect().left)) < 1);
      const [back, forward] = await role.locator('.role-gallery-controls button').all();
      if (width === 1280 && row.full > row.visible + 1) {
        assert.ok(await forward.isVisible());
        await checkJoinedArrows(role.locator('.role-gallery-controls'));
        await forward.click();
        await page.waitForFunction(id => document.getElementById(id).scrollLeft > 0, 'thumbnails-' + group.id);
        await back.click();
      } else {
        assert.ok(await forward.isHidden());
      }
      if (width === 375) assert.ok(row.full > row.visible, 'Expose a swipeable row on mobile');
      const index = group.items.length - 1;
      const link = links.nth(index);
      await link.scrollIntoViewIfNeeded();
      await link.focus();
      const position = await strip.evaluate(el => [el.scrollLeft, scrollY]);
      await link.press('Enter');
      await viewer.waitFor({ state: 'visible' });
      await checkJoinedArrows(viewer.locator('.gallery-plate'));
      assert.equal(await viewer.locator('h2').innerText(), group.title);
      assert.equal(await viewer.locator('.viewer-original').getAttribute('href'), new URL(group.items[index].image, url).href);
      assert.equal(await viewer.locator('.viewer-caption').innerText(),
        group.items.length + ' of ' + group.items.length + ' · ' + (group.items[index].caption || group.items[index].title));
      assert.ok(await viewer.getByRole('button', { name: 'Next', exact: true }).isDisabled());
      await page.keyboard.press('ArrowLeft');
      assert.equal(await viewer.locator('.viewer-original').getAttribute('href'), new URL(group.items[index - 1].image, url).href);
      await viewer.locator('.viewer-stage img').evaluate(img => img.decode());
      await page.keyboard.press('Escape');
      await viewer.waitFor({ state: 'hidden' });
      await page.waitForFunction(({ id, stripId, position }) =>
        document.activeElement === document.getElementById(id) &&
        Math.abs(document.getElementById(stripId).scrollLeft - position[0]) <= 2 &&
        Math.abs(scrollY - position[1]) <= 2,
        { id: await link.getAttribute('id'), stripId: 'thumbnails-' + group.id, position });
    }
  }
  await page.setViewportSize({ width: 320, height: 812 });
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Gallery overflow stays within its row at enlarged text sizes');
  await page.close();

  const plain = await browser.newPage({ javaScriptEnabled: false });
  await plain.goto(url);
  const fallback = plain.locator('#images-berkeley .role-thumbnails a').first();
  const original = await fallback.getAttribute('href');
  await Promise.all([plain.waitForURL(new URL(original, url).href), fallback.click()]);
  await plain.locator('img').evaluate(img => img.decode());
  await plain.close();
}

async function checkImageReturns(browser, workUrl) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(workUrl);
  const control = page.locator('#gallery-propoint a[aria-label="Open full-size image of Book a service"]');
  await control.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  await control.press('Enter');
  const viewer = page.getByRole('dialog');
  await viewer.waitFor({state:'visible'});
  assert.equal(page.url(), workUrl);
  assert.match(await viewer.locator('.viewer-caption').innerText(), /^1 of 2/);
  assert.ok(await viewer.getByRole('button', {name:'Close',exact:true}).evaluate(el => el === document.activeElement));
  await page.keyboard.press('Shift+Tab');
  assert.ok(await viewer.getByRole('button', {name:'Next',exact:true}).evaluate(el => el === document.activeElement));
  await page.keyboard.press('Tab');
  assert.ok(await viewer.getByRole('button', {name:'Close',exact:true}).evaluate(el => el === document.activeElement));
  await page.keyboard.press('ArrowLeft');
  assert.ok(await viewer.getByRole('button', {name:'Previous',exact:true}).isDisabled());
  await checkJoinedArrows(viewer.locator('.gallery-plate'));
  await page.keyboard.press('ArrowRight');
  assert.match(await viewer.locator('.viewer-caption').innerText(), /^2 of 2/);
  assert.ok(await viewer.getByRole('button', {name:'Next',exact:true}).isDisabled());
  await viewer.locator('img').evaluate(img => img.decode());
  await captureWork(page, 'image-viewer');
  await page.keyboard.press('Escape');
  await viewer.waitFor({state:'hidden'});
  assert.ok(await control.evaluate(el => el === document.activeElement));
  assert.ok(Math.abs((await page.evaluate(() => scrollY)) - before) <= 2);

  await control.press('Enter');
  await page.setViewportSize({width:1280,height:900});
  await page.waitForFunction(() => innerWidth === 1280 && innerHeight === 900);
  await page.keyboard.press('Escape');
  await viewer.waitFor({state:'hidden'});
  // The native close event restores scroll after the dialog stops rendering.
  try {
    await page.waitForFunction(id => {
      const el = document.getElementById(id);
      const box = el.getBoundingClientRect();
      const visibleHeight = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0);
      return document.activeElement === el && visibleHeight >= Math.min(box.height, innerHeight) - 2;
    }, await control.getAttribute('id'), {timeout:5000});
  } catch (error) {
    const state = await control.evaluate(el => ({bounds:el.getBoundingClientRect().toJSON(), active:document.activeElement?.id, width:innerWidth, height:innerHeight, scrollY}));
    throw new Error('Resize return: ' + JSON.stringify(state), {cause:error});
  }
  await page.setViewportSize({width:375,height:812});

  // Loading failure leaves the original and Close available.
  const broken = await browser.newPage({viewport:{width:375,height:812}});
  await broken.route('**/assets/portfolio/supersalon.webp', route => route.abort());
  await broken.goto(workUrl);
  await broken.locator('#gallery-propoint a[aria-label="Open full-size image of Book a service"]').press('Enter');
  const failedViewer = broken.getByRole('dialog');
  await failedViewer.getByRole('button', {name:'Next',exact:true}).click();
  await failedViewer.locator('.viewer-error').waitFor({state:'visible'});
  assert.equal(await failedViewer.getByRole('link', {name:'Open original'}).getAttribute('href'), new URL('/assets/portfolio/supersalon.webp',workUrl).href);
  await failedViewer.getByRole('button', {name:'Close',exact:true}).click();
  await broken.close();

  await page.goto(workUrl + '#gallery-bayer');
  assert.equal(await page.locator('#images-bayer .image-enlarge:visible').count(), 12);
  const strip = page.locator('#gallery-bayer');
  await strip.getByRole('button', {name:'Next screenshot'}).click();
  await strip.getByText('2 of 12 · Aleve story page', {exact:true}).waitFor();
  await strip.locator('.thumbnail-card a').nth(1).press('Enter');
  assert.match(await viewer.locator('.viewer-caption').innerText(), /^2 of 12/);
  await page.keyboard.press('Escape');
  await page.goto(workUrl + 'bayer-aleve/');
  await page.locator('.study-image').nth(1).press('Enter');
  assert.match(await viewer.locator('.viewer-caption').innerText(), /^2 of 5/);
  await page.goBack();
  assert.equal(page.url(), workUrl + '#gallery-bayer');
  await page.goForward();
  assert.equal(await page.locator('dialog[open]').count(), 0, 'Back/Forward does not revive the overlay');

  await page.goto(workUrl);
  await page.locator('#gallery-bucky-ball .image-enlarge').press('Enter');
  assert.ok(await viewer.locator('.gallery-plate').isHidden(), 'Single originals need no gallery arrows');
  assert.ok(await viewer.getByRole('link', {name:'Open original'}).isVisible());
  await page.keyboard.press('Escape');
  await viewer.waitFor({state:'hidden'});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.ok(await page.locator('#case-studies-title').evaluate(el => !CSS.supports('view-transition-name: none') || getComputedStyle(el).viewTransitionName === 'none'));
  await page.setViewportSize({width:320,height:812});
  await page.addStyleTag({content:'html { font-size: 200% !important; }'});
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Directory reflows at 200% text');
  await control.press('Enter');
  for (const button of await viewer.getByRole('button').all()) {
    const box = await button.boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44);
  }
  const closeBounds = await viewer.getByRole('button',{name:'Close',exact:true}).boundingBox();
  assert.ok(closeBounds.y >= 0 && closeBounds.y + closeBounds.height <= 812, 'Close stays visible');
  await page.keyboard.press('Escape');
  await page.close();

  // Native fallback retains the existing same-tab Back/focus behavior.
  const fallback = await browser.newPage({viewport:{width:375,height:812}});
  await fallback.addInitScript(() => { HTMLDialogElement.prototype.showModal = undefined; });
  await fallback.goto(workUrl + '#gallery-bayer');
  await openImageAndReturn(fallback, fallback.locator('#gallery-bayer .thumbnail-card a').first());
  assert.ok(await fallback.locator('#images-bayer .image-enlarge').first().isVisible());
  await fallback.close();
  console.log('Verified image viewer, keyboard/focus, errors, history, bookmarks, reduced motion and native fallback.');
}

async function check() {
  const workUrl = new URL('/work/', process.argv[2]).href;
  const webkitOnly = process.argv.includes('--webkit-gallery');
  const browser = webkitOnly ? await webkit.launch() : await chromium.launch({ channel: 'chrome' });
  try {
    await checkRoleGalleries(browser, workUrl);
    await checkImageReturns(browser, workUrl);
    if (webkitOnly) return;
    for (const width of [375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: width === 375 ? 812 : 900 } });
      await page.goto(new URL('/', workUrl).href);
      const allProjects = page.locator('.section-heading a[href="/work/"], .selected-results a[href="/work/"]').first();
      const entries = page.getByRole('link', { name: 'Explore selected work', exact: true });
      assert.equal(await entries.count(), 2);
      for (let i = 0; i < 2; i++) {
        await entries.nth(i).press('Enter');
        assert.equal(page.url(), workUrl);
        assert.ok((await page.locator('.benchmark-feature').boundingBox()).y < page.viewportSize().height);
        if (i === 0) await page.goBack();
      }
      await checkDirectory(page, workUrl);
      if (width === 1280) await checkShareImage(page, 'aaron-schneider.jpg');
      for (const study of studies) {
        const casePath = '/work/' + study.path + '/';
        const link = page.locator('.benchmark-actions, .work-links').locator('a[href="' + casePath + '"]');
        assert.equal(await link.count(), 1);
        await link.click({ timeout: 5000 });
        assert.equal(page.url(), workUrl + study.path + '/');
        const title = await page.locator('main h1').innerText();
        assert.ok(title);
        const ending = page.locator('.study-ending');
        const directory = page.locator('.study-header').getByRole('link', { name: 'Back to Selected Work', exact: true });
        assert.equal(await directory.getAttribute('href'), '/work/#' + study.card);
        const actions = ending.getByRole('link');
        const footerLinks = page.getByRole('contentinfo').getByRole('link');
        assert.deepEqual(await footerLinks.evaluateAll(items => items.map(a => a.href)), [
          new URL('/', workUrl).href, 'https://www.linkedin.com/in/aarondrewschneider/',
          'https://www.youtube.com/@commondevops', new URL('/pgp/', workUrl).href
        ]);
        assert.equal(await actions.count(), 2);
        const discuss = ending.getByRole('link', { name: 'Discuss a project', exact: true });
        assert.equal(await discuss.getAttribute('href'), '/#connect');
        const returnLabels = { 'case-studies-title': 'Terminal-Bench-Science feature', 'node-ipc': 'Node-IPC investigation section', 'chess-benchmarks': 'Chess benchmarks section' };
        const projectReturn = ending.getByRole('link', { name: returnLabels[study.card] || projectNames[study.card] + ' project summary', exact: true });
        assert.equal(await projectReturn.getAttribute('href'), '/work/#' + study.card);
        if (study.card === 'bayer') {
          if (width === 1280) await checkShareImage(page, 'bayer-aleve.jpg');
          assert.match(await page.locator('.study-header .lead').innerText(), /lead software developer for Aleve\.com/i);
          assert.equal(await page.locator('.study-header + .study-evidence').count(), 1, 'Show project images directly after the role');
          const choices = page.locator('.index-choices a');
          assert.deepEqual(await choices.allTextContents(), ['Brand websites', 'Joint Visualizer', 'Pest Management', 'Lawn & Landscape']);
          for (const [i, size] of [5, 1, 3, 3].entries()) {
            await choices.nth(i).click();
            const panel = page.locator('.index-panel:visible');
            assert.equal(await panel.count(), 1);
            assert.equal(await panel.locator('.study-image').count(), size);
            await panel.locator('.study-image').first().press('Enter');
            assert.match(await page.getByRole('dialog').locator('.viewer-caption').innerText(), new RegExp('^1 of ' + size + ' '));
            await page.keyboard.press('Escape');
          }
          await choices.first().click();
          await captureWork(page, 'bayer-showcase');
        }
        if (study.card === 'westinghouse') {
          const lead = await page.locator('.study-header .lead').innerText();
          assert.match(lead, /13 projects.*20-person offshore.*vendor/i);
          assert.match(title, /QA across 13 projects at Westinghouse/i);
          const copy = await page.locator('.study-copy').innerText();
          for (const detail of ['QTP/UFT', 'LoadRunner', 'JMeter', 'BlazeMeter', 'playbooks', 'documentation',
            'Two weeks', '$20 million website', 'internal server errors', 'Elasticsearch', 'three times as many requests']) {
            assert.ok(copy.includes(detail), 'Missing Westinghouse case detail: ' + detail);
          }
          if (width === 1280) await checkShareImage(page, 'westinghouse-performance.jpg');
        }
        if (study.card === 'indiana') {
          const lead = await page.locator('.study-header .lead').innerText();
          for (const detail of [/one.county pilot/i, /filename/i, /repair/i, /statewide/i]) assert.match(lead, detail);
          assert.match(title, /92 counties/i);
        }
        if (study.path === 'super-salon-checkout') {
          const lead = await page.locator('.study-header .lead').innerText();
          for (const detail of [/eleven bottles|11 bottles/i, /15%/, /one.cent|1¢/i]) assert.match(lead, detail);
        }
        if (study.path === 'scientific-ai-benchmark') {
          assert.equal(await page.locator('h1').innerText(), 'Testing AI agents on published effect sizes');
          assert.equal(await page.locator('.research-process li').count(), 3);
          const studyText = await page.locator('.case-study').innerText();
          assert.match(studyText, /Dr\. Ian Miller and I co-authored/);
          assert.match(studyText, /as a maintainer\. I review DevOps and infrastructure/);
          assert.match(studyText, /analysis team.*trial results/);
          const appendix = page.locator('#checking-the-grader');
          assert.equal(await appendix.getAttribute('open'), null, 'Grader mechanics are secondary');
          await page.goto(workUrl + 'scientific-ai-benchmark/#checking-the-grader');
          await page.waitForFunction(() => document.querySelector('#checking-the-grader').open);
          assert.ok(await appendix.getByRole('link', {name:'Merged verifier',exact:true}).isVisible());
          await appendix.locator('summary').press('Space');
          assert.equal(await appendix.getAttribute('open'), null);
          if (width === 1280) await checkShareImage(page, 'tbs-meta-analysis.jpg');
          const dir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'homepage-previews');
          fs.mkdirSync(dir, { recursive: true });
          const version = new URL(workUrl).hostname === '127.0.0.1' ? 'preview' : 'live';
          await page.screenshot({ path: path.join(dir, version + '-benchmark-case-' + width + '.jpg'), fullPage: true, quality: 80 });
        }
        if (study.path === 'node-ipc-investigation') {
          const copy = page.locator('.study-copy');
          assert.equal(title, 'node-ipc and the evidence in the domain records');
          const lead = await page.locator('.study-header .lead').innerText();
          assert.match(lead, /I led the CommonDevOps investigation/);
          assert.match(lead, /primary author of the post-incident report/);
          assert.match(await copy.innerText(), /with help from Dr\. Ian Miller and Javier Bonilla/i);
          assert.match(await copy.innerText(), /identit[^.]*?(unresolved|unknown|open)|could not (identify|establish)[^.]*?(operator|writer)/i);
          assert.ok(await copy.locator('a[href="https://commondevops.com/node-ipc-supply-chain-incident-report/"]').isVisible());
          const outcomes = copy.locator('#report-and-recordings + ul a');
          assert.deepEqual(await outcomes.evaluateAll(links => links.map(a => a.href)), [
            'https://doi.org/10.6084/m9.figshare.33865414.v1',
            'https://www.youtube.com/watch?v=TZ04u6cj1ls',
            'https://www.youtube.com/watch?v=eSvYhh7_Kyo'
          ]);
          assert.ok(await copy.locator('a[href="/articles/#node-ipc-report"]').isVisible());
          for (const [id, seconds, guest, timestamp] of [
            ['TZ04u6cj1ls', 414, /maintainer Brandon Miller/i, '6:54'], ['eSvYhh7_Kyo', 252, /researcher Roni Carta/i, '4:12']
          ]) {
            const clip = copy.locator('a[href="https://www.youtube.com/watch?v=' + id + '&t=' + seconds + 's"]');
            assert.ok(await clip.isVisible());
            const context = await clip.evaluate(el => el.closest('li, p').innerText);
            assert.match(context, guest);
            assert.ok(context.includes(timestamp), 'Identify the timestamp for each recorded perspective');
          }
          if (width === 1280) {
            await checkShareImage(page, 'aaron-schneider.jpg');
          } else {
            await captureWork(page, 'node-ipc-case');
            const heading = copy.getByRole('heading', { name: 'What a domain record can establish' });
            await heading.evaluate(el => el.scrollIntoView({ block: 'start' }));
            await captureWork(page, 'node-ipc-evidence');
          }
        }
        if (study.path === 'chess-puzzle-qa') {
          assert.equal(title, 'Evaluating AI-built chess puzzle videos');
          if (width === 1280) await checkShareImage(page, 'chess-puzzle-benchmark.jpg');
          assert.match(await page.locator('.case-study').innerText(), /qualitative benchmark/i);
          const copy = page.locator('.study-copy');
          const pinned = 'https://github.com/commondevops/llm-chess-experiment/blob/8d660666fc25a99a8846a2867089f8cfe6381f63/milestone1_local_recreation_instructions.md';
          assert.ok(await copy.locator('a[href="' + pinned + '"]').isVisible());
          for (const [seconds, timestamp] of [[394, '6:34'], [600, '10:00'], [681, '11:21']]) {
            const source = copy.locator('a[href="https://www.youtube.com/watch?v=IXzLwNlLAI4&t=' + seconds + 's"]');
            assert.ok((await source.innerText()).includes(timestamp), 'Expose the chess recording timestamp');
          }
          const proposal = copy.getByRole('heading', { name: 'How I would test the reveal' });
          assert.ok(await proposal.isVisible(), 'Introduce the frame checks as proposed tests');
          assert.match(await copy.innerText(), /proposed regression tests/i);
          const figure = copy.getByRole('figure', { name: 'Proposed frame checks' });
          assert.deepEqual(await figure.locator('dt').allTextContents(), ['Thinking interval', 'Solution reveal']);
          await figure.evaluate(el => el.scrollIntoView({ block: 'center' }));
          await captureWork(page, 'chess-frame-checks');
          await copy.locator('a[href="/work/super-salon-checkout/"]').press('Enter');
          assert.equal(page.url(), workUrl + 'super-salon-checkout/');
          await page.locator('.study-copy a[href="/work/chess-puzzle-qa/"]').press('Enter');
          assert.equal(page.url(), workUrl + 'chess-puzzle-qa/');
        }
        const images = page.locator('.study-evidence img');
        assert.equal(await images.count(), study.images);
        const imageLinks = page.locator('.study-evidence figure a');
        assert.equal(await imageLinks.count(), study.images);
        assert.ok(await imageLinks.evaluateAll(links => links.every(a => a.classList.contains('image-enlarge') &&
          (!a.target || a.target === '_self') && a.getAttribute('aria-label')?.trim())), 'Each case figure has one named enlargement link');
        for (const image of await page.locator('.study-evidence img:visible').all()) {
          await image.evaluate(img => img.scrollIntoView({block: 'center', behavior: 'instant'}));
          await image.evaluate(img => img.decode());
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow on ' + page.url());
        if (study.path === 'super-salon-checkout') {
          await ending.evaluate(el => el.scrollIntoView({ block: 'center' }));
          await projectReturn.focus();
          await page.keyboard.press('Shift+Tab');
          assert.ok(await discuss.evaluate(el => el === document.activeElement && el.matches(':focus-visible') &&
            getComputedStyle(el).outlineStyle !== 'none'), 'Show keyboard focus on the contact action');
          await captureWork(page, 'super-salon-contact');
          await page.keyboard.press('Tab');
          assert.ok(await projectReturn.evaluate(el => el === document.activeElement && el.matches(':focus-visible') &&
            getComputedStyle(el).outlineStyle !== 'none'), 'Tab should move from contact to the project summary');
          await discuss.press('Enter');
          assert.equal(page.url(), new URL('/#connect', workUrl).href);
          assert.equal(await page.locator(':target').getAttribute('id'), 'connect');
          const contacts = page.getByRole('contentinfo');
          assert.ok(await contacts.getByRole('heading', { name: 'Aaron Schneider', exact: true }).isVisible());
          assert.ok(await contacts.locator('a[href="https://www.linkedin.com/in/aarondrewschneider/"]').isVisible());
          assert.ok(await contacts.getByRole('link', { name: 'Team consulting · CommonDevOps website', exact: true }).isVisible());
          await page.goBack();
          assert.equal(page.url(), workUrl + study.path + '/');
        }
        await projectReturn.press('Enter');
        assert.equal(page.url(), workUrl + '#' + study.card);
        assert.ok(await page.locator(':target').evaluate(el => el === document.activeElement), 'Return focus to the originating project or feature');
      }
      console.log(width + 'px: verified ' + studies.length + ' case studies, contact paths and project returns.');
      if (width === 1280) await checkGallery(page, workUrl, width, false);
      await page.close();
    }
    const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });
    await checkGallery(mobile, workUrl, 375, true);
    await mobile.close();
  } finally {
    await browser.close();
  }
}

check().catch(error => { console.error(error); process.exitCode = 1; });
