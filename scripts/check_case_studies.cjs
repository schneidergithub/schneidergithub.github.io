const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');
const gallery = require('../_data/gallery.json');

const studies = [
  { card: 'propoint', path: 'super-salon-checkout', label: 'Super Salon checkout', images: 2 },
  { card: 'indiana', path: 'indiana-case-archives', label: 'Indiana case archives', images: 0 },
  { card: 'bayer', path: 'bayer-aleve', label: 'Bayer’s Aleve website', images: 2 },
  { card: 'westinghouse', path: 'westinghouse-performance', label: 'Westinghouse search performance', images: 0 },
  { card: 'commondevops', path: 'scientific-ai-benchmark', label: 'Scientific benchmark QA', images: 0 },
  { card: 'commondevops', path: 'node-ipc-investigation', label: 'node-ipc investigation', images: 0 },
  { card: 'commondevops', path: 'chess-puzzle-qa', label: 'Chess puzzle QA', images: 0 }
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
  await captureWork(page, 'directory');
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
  assert.equal(await page.locator('.gallery-group details').count(), 3);
  if (width === 375) {
    assert.equal(await page.locator('.gallery-group .thumbnail-card a:visible').count(), 5);
  }
  for (const group of gallery) {
    const fragment = '#gallery-' + group.id;
    if (directEntry) {
      await page.goto(workUrl + fragment);
    } else {
      await page.locator('.gallery-jumps').getByRole('link', { name: group.title + ' ' + group.items.length, exact: true }).press('Enter');
    }
    assert.equal(page.url(), workUrl + fragment);
    const section = page.locator('.gallery-group:target');
    assert.equal(await section.locator('h3').innerText(), group.title);
    assert.equal(await section.locator('.gallery-heading p').first().innerText(), group.description);
    const cover = section.locator(':scope > .thumbnail-card');
    assert.equal(await cover.locator('a').getAttribute('href'), group.items[0].image);
    const captions = await cover.locator('figcaption').allTextContents();
    assert.deepEqual(captions, group.items[0].caption ? [group.items[0].caption] : []);
    if (group.id === 'bayer') {
      assert.deepEqual(captions, [], 'Let the Aleve gallery preview stand on its own');
      assert.ok((await cover.locator('a').innerText()).includes(group.items[0].title));
    }
    const details = section.locator('details');
    const summary = details.locator('summary');
    if (group.items.length > 1) {
      const toggleLabel = await summary.innerText();
      assert.ok(toggleLabel.includes(String(group.items.length)), 'Identify the gallery size on the disclosure');
      assert.equal(await details.getAttribute('open'), null);
      await summary.press('Enter');
      assert.ok(await details.evaluate(el => el.open), 'Keyboard should open the image group');
    } else {
      assert.equal(await details.count(), 0, 'A single image opens directly');
    }
    const photos = section.locator('.thumbnail-card a');
    assert.deepEqual(await photos.evaluateAll(links => links.map(a => a.pathname).sort()), group.items.map(item => item.image).sort());
    assert.equal(await section.locator('.thumbnail-card a:visible').count(), group.items.length);
    for (const photo of await photos.all()) {
      const image = photo.locator('img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
    }
    if (directEntry && group.id === 'bayer') {
      await summary.scrollIntoViewIfNeeded();
      await captureWork(page, 'bayer-expanded');
      const original = details.locator('.thumbnail-card a').first();
      const url = new URL(await original.getAttribute('href'), workUrl).href;
      const [imageTab] = await Promise.all([page.waitForEvent('popup'), original.press('Enter')]);
      await imageTab.waitForURL(url);
      await imageTab.close();
      assert.equal(page.url(), workUrl + fragment);
      assert.ok(await details.evaluate(el => el.open));
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

async function check() {
  const workUrl = new URL('/work/', process.argv[2]).href;
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of [375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: width === 375 ? 812 : 900 } });
      await page.goto(new URL('/', workUrl).href);
      const allProjects = page.getByRole('link', { name: 'View all projects', exact: true });
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
        assert.equal(await page.locator('.site-footer a[href*="linkedin.com"]').count(), 0, 'Keep each contact choice in the case ending');
        assert.equal(await page.locator('.site-footer a[href="/pgp/"]').count(), 1);
        assert.equal(await actions.count(), 3);
        assert.equal(await ending.getByRole('link', { name: 'Aaron on LinkedIn', exact: true }).getAttribute('href'), 'https://www.linkedin.com/in/aarondrewschneider/');
        assert.equal(await ending.getByRole('link', { name: 'CommonDevOps on LinkedIn', exact: true }).getAttribute('href'), 'https://www.linkedin.com/company/commondevops/');
        const projectReturn = ending.getByRole('link', { name: projectNames[study.card] + ' project summary', exact: true });
        assert.equal(await projectReturn.getAttribute('href'), '/work/#' + study.card);
        if (study.card === 'bayer') {
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
        if (study.card === 'propoint') {
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
          assert.match(studyText, /review DevOps and infrastructure/);
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
          assert.match(await copy.innerText(), /identit[^.]*?(unresolved|unknown|open)|could not (identify|establish)[^.]*?(operator|writer)/i);
          assert.ok(await copy.locator('a[href="https://commondevops.com/node-ipc-supply-chain-incident-report/"]').isVisible());
          assert.ok(await copy.locator('a[href="https://doi.org/10.6084/m9.figshare.33865414.v1"]').isVisible());
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
        for (const image of await images.all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(img => img.decode());
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow on ' + page.url());
        if (study.card === 'propoint' && width === 375) {
          await ending.evaluate(el => el.scrollIntoView({ block: 'center' }));
          const personal = ending.getByRole('link', { name: /Aaron.*LinkedIn/i });
          const team = ending.getByRole('link', { name: /CommonDevOps.*LinkedIn/i });
          await team.focus();
          await page.keyboard.press('Shift+Tab');
          for (const link of [personal, team, projectReturn]) {
            assert.ok(await link.evaluate(el => {
              const style = getComputedStyle(el);
              return document.activeElement === el && el.matches(':focus-visible') &&
                style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
            }), 'Tab should visibly focus the individual, team and return links in that order');
            if (link === personal) await captureWork(page, 'super-salon-contact');
            if (link !== projectReturn) await page.keyboard.press('Tab');
          }
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
