const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');
const { isDeepStrictEqual } = require('node:util');

async function check() {
  const url = process.argv[2];
  const temp = process.env.RUNNER_TEMP || os.tmpdir();
  const previews = path.join(temp, 'experience-previews');
  const signaturePath = path.join(temp, 'experience-roles.json');
  fs.mkdirSync(previews, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of [1280, 375]) {
      const page = await browser.newPage({ viewport: { width, height: 960 } });
      const response = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      assert.ok(response.ok(), 'Experience page returned HTTP ' + response.status());
      const roles = page.locator('article.role');
      assert.equal(await roles.count(), 11);
      const evidence = await page.locator('.role a.role-study').evaluateAll(links =>
        Object.fromEntries(links.map(link => [link.closest('.role').querySelector('h2').textContent.trim(), link.pathname])));
      assert.deepEqual(evidence, {
        'Sogeti / Capgemini': '/work/westinghouse-performance/',
        BCforward: '/work/indiana-case-archives/',
        'ProPoint Global': '/work/super-salon-checkout/',
        Ciber: '/work/bayer-aleve/'
      }, 'Experience must link each engagement to its own case');
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
  } finally {
    await browser.close();
  }
}
check().catch(error => { console.error(error); process.exitCode = 1; });
