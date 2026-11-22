const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');
const { isDeepStrictEqual } = require('node:util');

const roleIds = ['commondevops', 'nuix', 'yo-pagos', 'bcforward', 'sogeti-capgemini', 'propoint-global',
  'ciber', 'berkeley-communications', 'bucky-ball-web', 'hanscom-air-force-base', 'joslin-diabetes-center'];

const evidenceByRole = {
  commondevops: ['/work/chess-puzzle-qa/', '/work/node-ipc-investigation/', '/work/scientific-ai-benchmark/'],
  bcforward: ['/work/indiana-case-archives/', '/work/#eli-lilly'],
  'sogeti-capgemini': ['/work/westinghouse-performance/'],
  'propoint-global': ['/work/super-salon-checkout/'],
  ciber: ['/work/bayer-aleve/'],
  'berkeley-communications': ['/work/#gallery-berkeley'],
  'bucky-ball-web': ['/work/#gallery-bucky-ball']
};

function roleEntry(page, id) {
  return page.locator('article.role').filter({ has: page.locator('h2#' + id) });
}

async function checkTarget(page, id) {
  const target = page.locator(':target');
  assert.equal(await target.getAttribute('id'), id);
  assert.ok(await target.evaluate(el => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const visibleCue = (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) ||
      parseFloat(getComputedStyle(el, '::before').borderInlineStartWidth) > 0;
    return visibleCue && el === document.activeElement && box.top >= -1 && box.bottom <= innerHeight &&
      box.left >= -1 && box.right <= innerWidth + 1;
  }), 'Shared role bookmark must focus a visible target: ' + id);
}

async function checkEvidence(page, url) {
  const roles = page.locator('article.role');
  const actual = await roles.evaluateAll(items => Object.fromEntries(items.map(role => [
    role.querySelector('h2').id, [...role.querySelectorAll('.role-details a')].map(link => link.pathname + link.hash).sort()
  ]).filter(([, links]) => links.length)));
  const expected = Object.fromEntries(Object.entries(evidenceByRole).map(([id, links]) => [id, [...links].sort()]));
  assert.deepEqual(actual, expected, 'Offer the ten evidence destinations under their own employers');

  for (const [id, destinations] of Object.entries(evidenceByRole)) {
    const roleUrl = new URL('#' + id, url).href;
    const role = roleEntry(page, id);
    for (const [index, href] of destinations.entries()) {
      await page.goto(roleUrl);
      const link = role.locator('.role-details a[href="' + href + '"]');
      const destination = new URL(href, url);
      if (id === 'bcforward') {
        assert.equal(await role.locator('.role-links a').count(), 0);
        const client = (await link.locator('xpath=ancestor::li[1]').innerText()).replace(/\s+/g, ' ');
        assert.match(client, index === 0 ? /Indiana.*92 counties/i : /Eli Lilly.*security/i);
        await role.locator('h2').focus();
        for (let n = 0; n <= index; n++) await page.keyboard.press('Tab');
        assert.ok(await link.evaluate(el => document.activeElement === el && el.matches(':focus-visible') &&
          getComputedStyle(el).outlineStyle !== 'none'), 'Reach the client evidence by keyboard: ' + href);
      } else {
        assert.equal(await role.locator('.role-links a[href="' + href + '"]').count(), 1);
      }
      await Promise.all([page.waitForURL(destination.href), link.press('Enter')]);
      if (destination.hash.startsWith('#gallery-')) {
        const image = page.locator('.gallery-group:target > .thumbnail-card a');
        const original = id === 'berkeley-communications' ? 'berkcom-inventory.webp' : 'buckyball.webp';
        assert.equal(await image.getAttribute('href'), '/assets/portfolio/' + original);
        await image.locator('img').evaluate(img => img.decode());
      } else if (destination.hash) {
        assert.equal(await page.locator('.project-card:target h2').innerText(), 'Automating internal security checks');
      } else {
        assert.ok(await page.locator('.case-study h1').isVisible(), 'Open the case study at ' + href);
      }
      await page.goBack();
      assert.equal(page.url(), roleUrl);
      assert.equal(await role.locator('h2:target').getAttribute('id'), id);
    }
  }
}

async function checkEnlargedRoleCopy(page, url, capturePath) {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto(url);
  const first = roleEntry(page, 'commondevops').locator('.role-details li').first();
  const fontSize = el => parseFloat(getComputedStyle(el).fontSize);
  const normal = await first.evaluate(fontSize);
  const larger = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  assert.ok(await first.evaluate(fontSize) >= normal * 2 - 0.1, 'The actual accomplishment text must double');
  const overflow = await page.locator('.role-heading, .role-details').evaluateAll(blocks => blocks.flatMap(block =>
    [...block.querySelectorAll('h2, h3, li, p, a')].filter(el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return [...range.getClientRects()].some(box => box.width > 0 && (box.left < -1 || box.right > innerWidth + 1));
    }).map(el => el.textContent.trim().slice(0, 60))));
  assert.deepEqual(overflow, [], 'Enlarged role text should fit within the viewport');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal scrolling at 320px');

  const role = roleEntry(page, 'commondevops');
  await role.locator('h2').focus();
  await page.keyboard.press('Tab');
  const firstLink = role.locator('.role-links a').first();
  assert.ok(await firstLink.evaluate(el => {
    const style = getComputedStyle(el);
    const inset = parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth);
    const box = el.getBoundingClientRect();
    return el === document.activeElement && el.matches(':focus-visible') && style.outlineStyle !== 'none' &&
      box.left - inset >= -1 && box.right + inset <= innerWidth + 1;
  }), 'Enlarged evidence links need an unclipped keyboard focus ring');
  await page.screenshot({ path: capturePath, quality: 82 });
  await larger.evaluate(style => style.remove());
  await page.setViewportSize({ width: 375, height: 812 });
}

async function check() {
  const url = process.argv[2];
  const preview = ['127.0.0.1', 'localhost'].includes(new URL(url).hostname);
  const version = preview ? 'preview' : 'live';
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
      const current = roleEntry(page, 'commondevops');
      assert.ok(await current.getByText('Current', { exact: true }).isVisible());
      assert.equal(await page.getByRole('heading', { name: 'Engineering leadership', exact: true }).count(), 0);
      const first = current.locator('.role-details li').first();
      const firstText = await first.innerText();
      for (const detail of [/MDD Executive Function/i, /Dr\. Ian Miller/i, /co-authored/i, /approved|accepted/i]) assert.match(firstText, detail);
      const currentWork = await current.locator('.role-details').innerText();
      for (const detail of [/maintainer/i, /review DevOps and infrastructure/i, /analy[sz]e trial results/i, /led the node-ipc investigation/i, /primary author/i]) assert.match(currentWork, detail);
      assert.match(await roleEntry(page, 'nuix').locator('.role-details li').first().innerText(), /12 engineers.*tests?.*rollback/i);
      assert.match(await roleEntry(page, 'yo-pagos').locator('.role-details li').first().innerText(), /five developers.*DevSecOps.*fintech/i);
      assert.equal(await current.locator('img').getAttribute('src'), '/assets/experience/commondevops-mark.png');
      assert.equal(await current.getByRole('link', { name: 'Qualitative chess benchmark', exact: true }).getAttribute('href'), '/work/chess-puzzle-qa/');
      if (width === 375) {
        assert.equal(await page.evaluate(() => scrollY), 0);
        for (const item of [current.locator('h2'), current.locator('h3'), first]) {
          assert.ok(await item.evaluate(el => {
            const range = document.createRange();
            range.selectNodeContents(el);
            const rects = [...range.getClientRects()];
            return rects.length > 0 && rects.every(box => box.top >= 0 && box.left >= 0 &&
              box.bottom <= innerHeight + 1 && box.right <= innerWidth + 1);
          }), 'Show the current employer, title and full first accomplishment before scrolling');
        }
      }
      await page.screenshot({ path: path.join(reviewDir, version + '-experience-first-screen-' + width + '.jpg'), quality: 82 });
      await page.goto(new URL('/work/', url).href);
      const leadership = page.getByRole('link', { name: 'DevSecOps leadership at Nuix', exact: true });
      assert.equal(await leadership.getAttribute('href'), '/experience/#nuix');
      await leadership.press('Enter');
      await checkTarget(page, 'nuix');
      await page.screenshot({ path: path.join(reviewDir, version + '-experience-nuix-' + width + '.jpg'), quality: 82 });
      await checkEvidence(page, url);
      await page.goto(url);
      if (width === 1280) {
        const signature = await roles.evaluateAll(articles => articles.map(article => ({
          text: article.innerText.trim(),
          thumbnail: article.querySelector('img')?.getAttribute('src'),
          description: article.querySelector('img')?.alt
        })));
        if (preview) {
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
      // The preview artifact uploads before deployment. Store live captures in the final workflow artifact.
      const fullPath = preview ? path.join(previews, 'experience-' + width + '.png') :
        path.join(reviewDir, 'live-experience-' + width + '.png');
      await page.screenshot({ path: fullPath, fullPage: true });
      if (width === 375) {
        await checkEnlargedRoleCopy(page, url, path.join(reviewDir, version + '-experience-enlarged-320.jpg'));
      }
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
    for (const id of [...roleIds, 'engineering-leadership']) {
      await plain.goto(new URL('#' + id, url).href);
      await checkTarget(plain, id);
      if (id === 'engineering-leadership') {
        assert.equal(await plain.locator('.role-heading:target h2').getAttribute('id'), 'nuix');
      } else {
        assert.equal(await plain.locator('h2:target').getAttribute('id'), id);
      }
      await plain.keyboard.press('Tab');
      assert.ok(await plain.locator(':target').evaluate(el => {
        const next = document.activeElement;
        return next.matches('a[href]:focus-visible') && (el.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING);
      }), 'Keyboard navigation should continue forward from #' + id);
    }
    await plain.close();
  } finally {
    await browser.close();
  }
}
check().catch(error => { console.error(error); process.exitCode = 1; });
