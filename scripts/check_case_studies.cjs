const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium, webkit } = require('playwright-core');
const gallery = require('../_data/gallery.json');

const studies = [
  { card: 'propoint', path: 'from-booking-to-checkout', label: 'From Booking to Checkout', images: 4 },
  { card: 'propoint', path: 'super-salon-checkout', label: 'Super Salon checkout', images: 2 },
  { card: 'indiana', path: 'indiana-case-archives', label: 'Indiana case archives', images: 0 },
  { card: 'bayer', path: 'bayer-aleve', label: 'Bayer’s Aleve website', images: 2 },
  { card: 'westinghouse', path: 'westinghouse-performance', label: 'Westinghouse search performance', images: 0 },
  { card: 'commondevops', path: 'scientific-ai-benchmark', label: 'Scientific benchmark QA', images: 0 },
  { card: 'commondevops', path: 'node-ipc-investigation', label: 'node-ipc investigation', images: 0 },
  { card: 'commondevops', path: 'chess-puzzle-qa', label: 'Qualitative chess benchmark', images: 1 }
];
const projectNames = {
  propoint: 'ProPoint Global', indiana: 'Indiana State Department', bayer: 'Bayer',
  westinghouse: 'Westinghouse', commondevops: 'CommonDevOps'
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
  const jumps = page.getByRole('navigation', { name: 'Selected work sections' }).getByRole('link');
  const sections = [
    ['#case-studies-title', 'Case studies'], ['#project-summaries', 'Project summaries'], ['#portfolio-gallery', 'Gallery']
  ];
  assert.deepEqual(await jumps.evaluateAll(links => links.map(a => a.hash)), sections.map(([fragment]) => fragment));
  const featured = page.locator('.directory-feature');
  const aleve = featured.getByRole('link', { name: 'Bayer’s Aleve website', exact: true });
  assert.equal(await aleve.getAttribute('href'), '/work/bayer-aleve/');
  assert.equal(await featured.locator('p').innerText(), 'At Ciber, I led development of Aleve.com.');
  const cover = aleve.locator('img');
  assert.equal(await cover.getAttribute('src'), '/assets/portfolio/portfolio-aleve.webp');
  const crop = await cover.evaluate(async img => {
    await img.decode();
    return [img.naturalWidth, img.naturalHeight, getComputedStyle(img).objectPosition];
  });
  assert.deepEqual(crop, [400, 350, '50% 0%'], 'Keep the original Aleve wordmark and garden at the top of the crop');
  if (page.viewportSize().width === 375) {
    const inFirstScreen = await featured.evaluate(el => {
      const bounds = el.getBoundingClientRect();
      return scrollY === 0 && bounds.top >= 0 && bounds.bottom <= innerHeight;
    });
    assert.ok(inFirstScreen, 'Show the illustrated case and Aaron’s contribution together on the first phone screen');
  }
  await captureWork(page, 'directory');
  await aleve.press('Enter');
  assert.equal(page.url(), workUrl + 'bayer-aleve/');
  await page.goBack();
  for (const [index, [fragment, name]] of sections.entries()) {
    const jump = jumps.nth(index);
    assert.ok((await jump.innerText()).trim().startsWith(name), 'Work link should identify ' + name);
    await jump.press('Enter');
    assert.equal(page.url(), workUrl + fragment);
    const target = page.locator(':target');
    assert.equal(await target.evaluate(el => el.tagName), 'H2', 'Focus the section heading after a jump');
    assert.equal((await target.innerText()).trim(), name);
    if (fragment === '#project-summaries') await captureWork(page, 'project-summaries');
  }
  if (page.viewportSize().width === 375) {
    assert.equal(await page.locator('.gallery-group .thumbnail-card a:visible').count(), 5, 'Start with one image per group on phones');
    await captureWork(page, 'gallery');
  }
  await page.goto(workUrl + '#case-studies-title');
  const entryLinks = page.locator('.study-directory a');
  assert.deepEqual(await entryLinks.evaluateAll(links => links.map(a => a.pathname).sort()), studies.map(study => '/work/' + study.path + '/').sort());
  await page.locator('.study-directory a[href="/work/westinghouse-performance/"]').press('Enter');
  assert.equal(page.url(), workUrl + 'westinghouse-performance/');
  await page.locator('.study-header').getByRole('link', { name: 'All case studies', exact: true }).press('Enter');
  assert.equal(page.url(), workUrl + '#case-studies-title');
  assert.ok(await page.locator('h2:target').evaluate(el => el === document.activeElement), 'All case studies should focus the directory heading');
  const cards = page.locator('.work-projects .project-card');
  assert.equal(await cards.count(), 6);
  assert.equal(await cards.locator('.outcome, .tags, figcaption').count(), 0, 'Project summaries should omit duplicated outcomes, tag rows and decorative captions');
  for (const [id, engagement] of [
    ['commondevops', /CommonDevOps/i], ['indiana', /Indiana.*BCforward/i],
    ['eli-lilly', /Eli Lilly.*BCforward/i], ['westinghouse', /Westinghouse.*Sogeti.*Capgemini/i],
    ['propoint', /ProPoint.*Super Salon/i], ['bayer', /Bayer.*Ciber/i]
  ]) {
    const card = page.locator('.project-card#' + id);
    assert.match(await card.locator('.context').innerText(), engagement);
    assert.equal(await card.locator('.project-detail p').count(), 1, 'Keep one contribution paragraph in ' + id);
  }
  const eliLilly = await page.locator('.project-card#eli-lilly .project-detail').innerText();
  for (const evidence of [/Python/i, /validat/i, /security/i]) assert.match(eliLilly, evidence);
  assert.ok(await page.locator('.project-card#commondevops a[href="/articles/#benchmark-presentation"]').isVisible());
}

async function checkGallery(page, workUrl, width, directEntry) {
  await page.goto(workUrl + '#portfolio-gallery');
  const images = page.locator('.gallery-group .thumbnail-card a');
  const originals = gallery.flatMap(group => group.items.map(item => item.image));
  assert.equal(new Set(originals).size, 26);
  assert.deepEqual(await images.evaluateAll(links => links.map(a => a.pathname).sort()), [...originals].sort());
  assert.ok(await images.evaluateAll(links => links.every(a => a.classList.contains('image-enlarge') &&
    (!a.target || a.target === '_self') && a.getAttribute('aria-label')?.trim())), 'Each original needs one named, same-tab enlargement control');
  assert.equal(await page.locator('.gallery-group > details').count(), 3);
  if (width === 375) {
    assert.equal(await page.locator('.gallery-group .thumbnail-card a:visible').count(), 5);
  }
  for (const group of gallery) {
    const fragment = '#gallery-' + group.id;
    if (directEntry) {
      await page.goto(workUrl + fragment);
    } else {
      await page.locator('.gallery-jumps a[href="' + fragment + '"]').press('Enter');
    }
    assert.equal(page.url(), workUrl + fragment);
    const section = page.locator('.gallery-group:target');
    assert.equal(await section.locator('h3').innerText(), group.title);
    assert.equal(await section.locator('.gallery-heading p').first().innerText(), group.description);
    const cover = section.locator(':scope > .thumbnail-card');
    assert.equal(await cover.locator('a').getAttribute('href'), group.items[0].image);
    const captions = await cover.locator('figcaption').allTextContents();
    assert.deepEqual(captions, group.items[0].caption ? [group.items[0].caption] : []);
    if (group.id === 'westinghouse') {
      assert.deepEqual(captions, [], 'Keep the Westinghouse cover free of descriptive captions');
      assert.match(group.description, /load-tested.*tripled Elasticsearch throughput/);
    }
    if (['bayer', 'propoint', 'westinghouse'].includes(group.id)) {
      await cover.locator('img').scrollIntoViewIfNeeded();
      await cover.locator('img').evaluate(img => img.decode());
      await section.locator('h3').evaluate(el => el.scrollIntoView({ block: 'start' }));
      await captureWork(page, group.id + '-cover');
    }
    const details = section.locator(':scope > details');
    const summary = details.locator(':scope > summary');
    if (group.items.length > 1) {
      const label = await summary.innerText();
      if (group.id === 'bayer') assert.match(label, /8 examples.*4 detail views/i);
      else assert.ok(label.includes(String(group.items.length)));
      assert.equal(await details.getAttribute('open'), null);
      await summary.press('Enter');
      assert.ok(await details.evaluate(el => el.open), 'Keyboard should open the image group');
    } else {
      assert.equal(await details.count(), 0, 'A single image opens directly');
    }
    const photos = section.locator('.thumbnail-card a');
    assert.deepEqual(await photos.evaluateAll(links => links.map(a => a.pathname).sort()), group.items.map(item => item.image).sort());
    const visible = section.locator('.thumbnail-card a:visible');
    assert.equal(await visible.count(), group.id === 'bayer' ? 8 : group.items.length);
    if (group.id === 'bayer') {
      await summary.scrollIntoViewIfNeeded();
      await captureWork(page, 'bayer-expanded');
      const nested = details.locator('details');
      assert.equal(await nested.count(), 2, 'Keep the four detail images with the two relevant mobile examples');
      for (const item of group.items.filter(item => item.id)) {
        const child = nested.filter({ has: page.locator('summary').filter({ hasText: item.title }) });
        assert.equal(await child.count(), 1, 'Name the detail group after its composite example');
        await child.locator(':scope > summary').press('Enter');
        const children = group.items.filter(detail => detail.detail_of === item.id).map(detail => detail.image).sort();
        assert.equal(children.length, 2);
        assert.deepEqual(await child.locator('.thumbnail-card a:visible').evaluateAll(links => links.map(link => link.pathname).sort()), children);
      }
    }
    assert.equal(await section.locator('.thumbnail-card a:visible').count(), group.items.length);
    for (const photo of await photos.all()) {
      const image = photo.locator('img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
    }
    if (group.items.length > 1) {
      await summary.press('Space');
      assert.equal(await details.getAttribute('open'), null);
      assert.equal(await section.locator('.thumbnail-card a:visible').count(), 1);
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
  if (directEntry) {
    await page.goto(workUrl + '#westinghouse');
    assert.ok(await page.locator(':target').getByRole('heading').first().isVisible(), 'A shared legacy project fragment must resolve without JavaScript');
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Work page overflows');
  console.log(width + 'px: verified the gallery highlights, image groups, and related project links.');
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
  try {
    await page.waitForFunction(async href => {
      const activeTop = () => {
        const current = document.activeElement;
        if (current?.href !== href) return null;
        const bounds = current.getBoundingClientRect();
        return bounds.width && bounds.height && bounds.top < innerHeight && bounds.bottom > 0 ? bounds.top : null;
      };
      const firstTop = activeTop();
      if (firstTop === null) return false;
      // A transient focus position can precede the browser's native Back scroll.
      for (let frame = 0; frame < 3; frame++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const top = activeTop();
        if (top === null || Math.abs(top - firstTop) > 1) return false;
      }
      return true;
    }, imageUrl, { timeout: 7000 });
  } catch (error) {
    const after = await control.evaluate(el => ({
      id: el.id, activeId: document.activeElement?.id, activeHref: document.activeElement?.href,
      bounds: el.getBoundingClientRect().toJSON(), scrollY, viewport: innerHeight, fragment: location.hash,
      open: [...document.querySelectorAll('details[open]')].map(group => group.id), returnState: history.state?.imageReturn,
      navigation: performance.getEntriesByType('navigation')[0]?.type
    }));
    throw new Error('Back failed in ' + page.context().browser().browserType().name() + ': ' +
      JSON.stringify({ sourceUrl, imageUrl, before, after }), { cause: error });
  }
  assert.ok(await control.evaluate(el => el === document.activeElement), 'Return keyboard focus to the image that opened the original');
}

async function checkRoleGalleries(browser, origin) {
  const url = new URL('/experience/', origin).href;
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(url);
  assert.equal(await page.locator('.role-gallery:not([open])').count(), 3);
  assert.equal(await page.locator('a.role-single').count(), 2);
  for (const group of gallery) {
    const role = page.locator('.role').filter({ has: page.locator('h2#' + group.role_id) });
    const links = role.locator('a.image-enlarge');
    const destinations = await links.evaluateAll(items => items.map(link => link.pathname));
    assert.deepEqual(destinations.sort(), group.items.map(item => item.image).sort(), group.role_id);
  }

  const propoint = page.locator('#images-propoint');
  const toggle = propoint.getByText('View 4 ProPoint images', { exact: true }).locator('..');
  await toggle.press('Enter');
  assert.equal(await propoint.locator('.thumbnail-card a:visible').count(), 4);
  assert.deepEqual(await propoint.locator('figcaption').allTextContents(),
    ['Find a salon', 'Book a service', 'Appointment calendar', 'Desktop checkout']);
  await toggle.press('Space');
  await toggle.locator('img').click();
  assert.equal(await propoint.locator('.thumbnail-card a:visible').count(), 4, 'The cover opens the same sheet');

  const bayer = page.locator('#images-bayer');
  await bayer.locator(':scope > summary').press('Enter');
  assert.equal(await bayer.locator('.thumbnail-card a:visible').count(), 8);
  const app = bayer.locator('.gallery-detail-set').first();
  await app.locator('summary').press('Enter');
  await openImageAndReturn(page, app.locator('a').last());
  assert.ok(await app.evaluate(el => el.open && el.closest('.role-gallery').open));
  await openImageAndReturn(page, page.locator('#image-bucky-ball'));
  await page.setViewportSize({ width: 320, height: 812 });
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Expanded Experience sheets reflow with enlarged text');
  await page.close();

  const plain = await browser.newPage({ javaScriptEnabled: false });
  await plain.goto(url + '#berkeley-communications');
  await plain.locator('#images-berkeley > summary').press('Enter');
  assert.equal(await plain.locator('#images-berkeley .thumbnail-card a:visible').count(), 8);
  await plain.close();
}

async function checkImageReturns(browser, workUrl) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(workUrl + '#gallery-bayer');
  const group = page.locator('#gallery-bayer');
  const details = group.locator(':scope > details');
  const summary = details.locator(':scope > summary');
  const restAngle = await summary.evaluate(el => getComputedStyle(el, '::before').transform);
  await summary.press('Enter');
  assert.ok(await summary.evaluate(el => el.getBoundingClientRect().height >= 44 && el.matches(':focus-visible') &&
    getComputedStyle(el).outlineStyle !== 'none'), 'Opening a gallery should preserve a visible keyboard focus');
  await page.waitForFunction(before => getComputedStyle(document.querySelector('#gallery-bayer > details > summary'), '::before').transform !== before, restAngle, { timeout: 3000 });
  await openImageAndReturn(page, group.locator('a[href="/assets/portfolio/portfolio-aleve2.webp"]'));
  assert.ok(await details.evaluate(el => el.open), 'Keep the Bayer group expanded after Back');
  const nested = details.locator('details').first();
  await nested.locator(':scope > summary').press('Enter');
  await openImageAndReturn(page, nested.locator('.thumbnail-card a').first());
  assert.ok(await nested.evaluate(el => el.open), 'Keep the mobile detail group expanded after Back');
  await page.goto(workUrl + '#gallery-westinghouse');
  await openImageAndReturn(page, page.locator('#gallery-westinghouse .thumbnail-card a'));
  await page.goto(new URL('bayer-aleve/', workUrl).href);
  await openImageAndReturn(page, page.locator('.study-figures a').nth(1));
  await page.goto(workUrl + '#gallery-bayer');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.ok(await summary.evaluate(el => getComputedStyle(el, '::before').transitionDuration.split(',').every(t => parseFloat(t) === 0)),
    'The disclosure indicator must change immediately with reduced motion');
  await page.setViewportSize({ width: 320, height: 812 });
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  assert.ok(await page.locator('.study-directory a, .directory-feature p').evaluateAll(elements => elements.every(el => {
    const bounds = el.getBoundingClientRect();
    return bounds.width > 0 && bounds.left >= 0 && bounds.right <= innerWidth;
  })), 'The directory links and contribution should fit a 320px screen at doubled text size');
  await summary.press('Enter');
  const reflow = await page.evaluate(() => {
    const pageWidth = document.documentElement.scrollWidth;
    const offenders = [];
    if (pageWidth > innerWidth) {
      for (const el of document.body.querySelectorAll('*')) {
        const box = el.getBoundingClientRect();
        if (!box.width || (box.left >= -1 && box.right <= innerWidth + 1)) continue;
        offenders.push({ tag: el.tagName, id: el.id, classes: el.className, left: Math.round(box.left),
          right: Math.round(box.right), width: Math.round(box.width), text: (el.textContent || '').trim().slice(0, 65) });
      }
      offenders.sort((a, b) => b.right - a.right);
    }
    return { viewport: innerWidth, pageWidth, offenders: offenders.slice(0, 14) };
  });
  if (reflow.pageWidth > reflow.viewport) {
    await captureWork(page, 'gallery-reflow-' + browser.browserType().name());
    assert.fail('Expanded gallery overflows with 200% text in ' + browser.browserType().name() + ': ' + JSON.stringify(reflow));
  }
  await page.close();
  console.log('Verified same-tab image return, nested disclosure state, keyboard focus and reduced-motion gallery behavior.');
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
      const allProjects = page.getByRole('link', { name: 'Browse project summaries', exact: true });
      assert.equal(await allProjects.getAttribute('href'), '/work/#project-summaries');
      await allProjects.press('Enter');
      assert.equal(page.url(), workUrl + '#project-summaries');
      assert.equal(await page.locator('h2:target').innerText(), 'Project summaries');
      await page.goBack();
      await page.getByRole('link', { name: 'Explore selected work' }).press('Enter');
      assert.equal(page.url(), workUrl);
      await checkDirectory(page, workUrl);
      if (width === 1280) await checkShareImage(page, 'aaron-schneider.jpg');
      for (const study of studies) {
        const casePath = '/work/' + study.path + '/';
        const directoryLabel = await page.locator('.study-directory a[href="' + casePath + '"]').innerText();
        assert.equal(directoryLabel, study.label);
        const link = page.locator('#' + study.card).getByRole('link', { name: study.label, exact: true });
        assert.equal(await link.getAttribute('href'), casePath);
        assert.equal((await link.innerText()).trim(), directoryLabel);
        await link.click({ timeout: 5000 });
        assert.equal(page.url(), workUrl + study.path + '/');
        const title = await page.locator('main h1').innerText();
        assert.ok(title);
        const ending = page.locator('.study-ending');
        const directory = page.locator('.study-header').getByRole('link', { name: 'All case studies', exact: true });
        assert.equal(await directory.getAttribute('href'), '/work/#case-studies-title');
        const actions = ending.getByRole('link');
        const footerLinks = page.getByRole('contentinfo').getByRole('link');
        assert.deepEqual(await footerLinks.evaluateAll(items => items.map(a => a.href)), [
          'https://www.linkedin.com/in/aarondrewschneider/', 'https://www.youtube.com/@commondevops'
        ]);
        assert.equal(await actions.count(), 2);
        const discuss = ending.getByRole('link', { name: 'Discuss a project', exact: true });
        assert.equal(await discuss.getAttribute('href'), '/#connect');
        const projectReturn = ending.getByRole('link', { name: projectNames[study.card] + ' project summary', exact: true });
        assert.equal(await projectReturn.getAttribute('href'), '/work/#' + study.card);
        if (study.card === 'bayer') {
          if (width === 1280) await checkShareImage(page, 'bayer-aleve.jpg');
          assert.match(await page.locator('.study-header .lead').innerText(), /lead software developer for Aleve\.com/i);
          assert.equal(await page.locator('.study-header + .study-evidence').count(), 1, 'Show project images directly after the role');
          assert.equal(await page.locator('.study-figures figcaption').count(), 0);
          await captureWork(page, 'bayer-showcase');
        }
        if (study.card === 'westinghouse') {
          const lead = await page.locator('.study-header .lead').innerText();
          for (const detail of [/\$20 million website/i, /load/i, /Elasticsearch configuration/i]) assert.match(lead, detail);
          assert.match(title, /Elasticsearch throughput/i);
          const narrative = (await page.locator('.study-header, .study-copy').allInnerTexts()).join(' ');
          assert.equal((narrative.match(/tripl(?:ing|ed)|threefold|three times|3\s*[×x]/gi) || []).length, 1, 'Give the measured result once in the Westinghouse narrative');
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
          assert.equal(await page.locator('h1').innerText(), 'Can AI reproduce a meta-analysis?');
          if (width === 375) {
            const fits = await page.locator('h1').evaluate(el => {
              const node = el.firstChild;
              const phrase = 'meta-analysis';
              const start = node.textContent.indexOf(phrase);
              const range = document.createRange();
              range.setStart(node, start);
              range.setEnd(node, start + phrase.length);
              return range.getClientRects().length === 1;
            });
            assert.ok(fits, 'Keep meta-analysis together on the phone');
          }
          const studyText = await page.locator('.case-study').innerText();
          assert.match(studyText, /Dr\. Ian Miller and I co-authored/);
          assert.match(studyText, /as a maintainer\. I review DevOps and infrastructure/);
          assert.match(studyText, /analysis team.*trial results/);
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
          assert.equal(title, 'The chess puzzle that gave away the answer');
          if (width === 1280) await checkShareImage(page, 'chess-puzzle-benchmark.jpg');
          assert.match(await page.locator('.case-study').innerText(), /qualitative benchmark/i);
          const copy = page.locator('.study-copy');
          const pinned = 'https://github.com/commondevops/llm-chess-experiment/blob/8d660666fc25a99a8846a2867089f8cfe6381f63/milestone1_local_recreation_instructions.md';
          assert.ok(await copy.locator('a[href="' + pinned + '"]').isVisible());
          for (const [seconds, timestamp] of [[394, '6:34'], [600, '10:00'], [681, '11:21']]) {
            const source = copy.locator('a[href="https://www.youtube.com/watch?v=IXzLwNlLAI4&t=' + seconds + 's"]');
            assert.ok((await source.innerText()).includes(timestamp), 'Expose the chess recording timestamp');
          }
          const essayPassage = '/articles/fresh-sandbox-github/#publishing-the-video';
          await copy.locator('a[href="' + essayPassage + '"]').press('Enter');
          assert.equal(page.url(), new URL(essayPassage, workUrl).href);
          assert.ok(await page.locator(':target').evaluate(el => el === document.activeElement), 'Land at the essay passage');
          await page.locator('.essay-copy a[href="/work/chess-puzzle-qa/#what-a-playable-video-can-miss"]').press('Enter');
          assert.ok(await copy.locator('h2:target').evaluate(el => el === document.activeElement), 'Return to the benchmark observations');
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
        for (const image of await images.all()) {
          await image.scrollIntoViewIfNeeded();
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
        assert.ok(await page.locator('.project-card:target h2').isVisible(), 'Project summary should return to its own card');
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
