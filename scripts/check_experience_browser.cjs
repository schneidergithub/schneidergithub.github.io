const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');
const { isDeepStrictEqual } = require('node:util');

const roleIds = ['commondevops', 'nuix', 'yo-pagos', 'bcforward', 'sogeti-capgemini', 'propoint-global',
  'ciber', 'berkeley-communications', 'bucky-ball-web', 'hanscom-air-force-base', 'joslin-diabetes-center'];

async function checkTarget(page, id) {
  const target = page.locator('h2:target');
  assert.equal(await target.getAttribute('id'), id);
  assert.ok(await target.evaluate(el => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const visibleCue = (style.outlineStyle === 'solid' && parseFloat(style.outlineWidth) > 0) ||
      parseFloat(getComputedStyle(el, '::before').borderInlineStartWidth) > 0;
    return visibleCue && el === document.activeElement && box.top >= -1 && box.bottom <= innerHeight &&
      box.left >= -1 && box.right <= innerWidth + 1;
  }), 'Shared role and leadership links should focus a visible heading: ' + id);
}

async function checkLeadership(page, url, reviewDir) {
  await page.goto(new URL('/work/', url).href);
  const link = page.getByRole('link', { name: 'Engineering leadership', exact: true });
  assert.equal(await link.getAttribute('href'), '/experience/#engineering-leadership');
  await link.press('Enter');
  await checkTarget(page, 'engineering-leadership');
  const panel = page.locator('section[aria-labelledby="engineering-leadership"]');
  const summaries = panel.locator('h3');
  assert.deepEqual(await summaries.allTextContents(), ['Nuix role', 'Yo Pagos role']);
  const descriptions = await panel.locator('.leadership-roles p').allTextContents();
  assert.match(descriptions[0], /12 engineers.*time zones.*testing and rollback/i);
  assert.match(descriptions[1], /(?:five|5) developers.*DevSecOps.*fintech/i);
  const width = page.viewportSize().width;
  const version = new URL(url).hostname === '127.0.0.1' ? 'preview' : 'live';
  await page.screenshot({ path: path.join(reviewDir, version + '-leadership-' + width + '.jpg'), quality: 82 });
  for (const [name, id] of [['Nuix', 'nuix'], ['Yo Pagos', 'yo-pagos']]) {
    const roleLink = panel.getByRole('link', { name: name + ' role', exact: true });
    assert.equal(await roleLink.getAttribute('href'), '#' + id);
    await roleLink.press('Enter');
    await checkTarget(page, id);
    assert.equal(await page.locator(':target').innerText(), name);
  }
  if (width === 375) {
    const text = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await panel.getByRole('link', { name: 'Nuix role', exact: true }).press('Enter');
    await checkTarget(page, 'nuix');
    const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')]
      .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
      .map(el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ' ' + el.className));
    assert.deepEqual(overflow, [], 'Experience must reflow at 200% text');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Keep all enlarged role text inside the viewport');
    await text.evaluate(style => style.remove());
  }
}

async function checkRoleGalleries(page, url) {
  for (const [roleId, groupId, label, imageFile, contribution] of [
    ['berkeley-communications', 'berkeley', 'Warehouse inventory screen', 'berkcom-inventory.webp', /parts, stock, and warranties/i],
    ['bucky-ball-web', 'bucky-ball', 'Archived Bucky Ball Web homepage', 'buckyball.webp', /built and hosted more than 100 websites/i]
  ]) {
    const roleUrl = new URL('#' + roleId, url).href;
    await page.goto(roleUrl);
    const role = page.locator('article.role').filter({ has: page.locator('h2#' + roleId) });
    assert.match(await role.locator('.role-details').innerText(), contribution);
    const link = role.getByRole('link', { name: label, exact: true });
    const galleryUrl = new URL('/work/#gallery-' + groupId, url).href;
    await link.press('Enter');
    assert.equal(page.url(), galleryUrl);
    const gallery = page.locator('.gallery-group:target');
    const cover = gallery.locator(':scope > .thumbnail-card a');
    assert.equal(await cover.getAttribute('href'), '/assets/portfolio/' + imageFile);
    await cover.locator('img').evaluate(img => img.decode());
    assert.ok(await cover.isVisible());
    await page.goBack();
    assert.equal(page.url(), roleUrl);
    assert.equal(await role.locator('h2:target').getAttribute('id'), roleId);
  }
}

async function check() {
  const url = process.argv[2];
  const temp = process.env.RUNNER_TEMP || os.tmpdir();
  const previews = path.join(temp, 'experience-previews');
  const reviewDir = path.join(temp, 'homepage-previews');
  const signaturePath = path.join(temp, 'experience-roles.json');
  fs.mkdirSync(previews, { recursive: true });
  fs.mkdirSync(reviewDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of [1280, 375]) {
      const page = await browser.newPage({ viewport: { width, height: width === 375 ? 812 : 960 } });
      const response = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      assert.ok(response.ok(), 'Experience page returned HTTP ' + response.status());
      const roles = page.locator('article.role');
      assert.equal(await roles.count(), 11);
      assert.deepEqual(await roles.locator('h2').evaluateAll(headings => headings.map(h => h.id)), roleIds);
      const commonDevOps = roles.filter({ has: page.locator('h2#commondevops') }).locator('.role-details li');
      assert.match((await commonDevOps.allTextContents()).join(' '), /co-authored[\s\S]*trial results/i);
      await checkLeadership(page, url, reviewDir);
      const nuix = roles.filter({ has: page.getByRole('heading', { name: 'Nuix', exact: true }) });
      assert.match(await nuix.locator('.role-details li').first().innerText(), /led.*12 engineers.*multiple time zones/i);
      if (width === 375) {
        await nuix.evaluate(el => el.scrollIntoView({ block: 'start' }));
        await nuix.locator('img').evaluate(image => image.decode());
        const version = new URL(url).hostname === '127.0.0.1' ? 'preview' : 'live';
        await page.screenshot({ path: path.join(reviewDir, version + '-nuix-375x812.jpg'), quality: 82 });
      }
      const evidence = await roles.evaluateAll(items => Object.fromEntries(items.map(role => [
        role.querySelector('h2').textContent.trim(),
        [...role.querySelectorAll('a.role-study')].map(link => link.pathname + link.hash).sort()
      ]).filter(([, links]) => links.length)));
      assert.deepEqual(evidence, {
        CommonDevOps: ['/work/chess-puzzle-qa/', '/work/node-ipc-investigation/', '/work/scientific-ai-benchmark/'],
        'Sogeti / Capgemini': ['/work/westinghouse-performance/'],
        BCforward: ['/work/indiana-case-archives/'],
        'ProPoint Global': ['/work/super-salon-checkout/'],
        Ciber: ['/work/bayer-aleve/'],
        'Berkeley Communications': ['/work/#gallery-berkeley'],
        'Bucky Ball Web': ['/work/#gallery-bucky-ball']
      }, 'Experience must link each engagement to its own case studies or gallery');
      await checkRoleGalleries(page, url);
      if (width === 1280) {
        const signature = await roles.evaluateAll(articles => articles.map(article => ({
          text: article.innerText.trim(),
          thumbnail: article.querySelector('img')?.getAttribute('src'),
          description: article.querySelector('img')?.alt
        })));
        if (new URL(url).hostname === '127.0.0.1') {
          fs.writeFileSync(signaturePath, JSON.stringify(signature));
        } else {
          assert.ok(isDeepStrictEqual(signature, JSON.parse(fs.readFileSync(signaturePath))),
            'Published role text, order or image assignments differ from the validated build');
        }
      }
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
            headingFits: article.querySelector('.role-heading').scrollWidth <= article.querySelector('.role-heading').clientWidth,
            imageTakesFocus: article.contains(img.closest('a[href], button, [tabindex]:not([tabindex="-1"])')),
            fit: getComputedStyle(img).objectFit
          };
        });
        assert.equal(layout.fit, 'contain', layout.name);
        assert.ok(layout.headingFits, 'Heading overflow: ' + layout.name);
        assert.ok(!layout.imageTakesFocus, 'Thumbnail creates a keyboard stop: ' + layout.name);
        assert.ok(layout.imageRight <= layout.headingLeft, layout.name);
        assert.ok(layout.headingBottom <= layout.bodyTop, layout.name);
        const expectedLeft = width === 375 ? layout.imageLeft : layout.headingLeft;
        assert.ok(Math.abs(layout.bodyLeft - expectedLeft) < 1, layout.name);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflow');
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(previews, 'experience-' + width + '.png'), fullPage: true });
      await page.route('**/assets/**', route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
      await page.reload({ waitUntil: 'load' });
      for (const role of await roles.all()) {
        for (const selector of ['h2', 'h3', '.role-details']) {
          assert.ok(await role.locator(selector).isVisible(), 'Role text hidden when images are unavailable');
        }
      }
      console.log(width + 'px: 11 images decoded, role layouts and page width verified');
      await page.close();
    }
    const plain = await browser.newPage({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });
    for (const id of ['nuix', 'yo-pagos']) {
      await plain.goto(new URL('#' + id, url).href);
      await checkTarget(plain, id);
    }
    await plain.close();
  } finally {
    await browser.close();
  }
}
check().catch(error => { console.error(error); process.exitCode = 1; });
