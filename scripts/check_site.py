"""Check the built static site's navigation, assets, metadata, and release boundaries."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, urljoin, unquote
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / '_site'
ESSAY = '/articles/fresh-sandbox-github/'
PAGES = ['/', '/experience/', '/work/', '/articles/', '/pgp/', '/404.html', ESSAY]
STUDIES = ['/work/super-salon-checkout/', '/work/indiana-case-archives/', '/work/bayer-aleve/',
           '/work/westinghouse-performance/', '/work/scientific-ai-benchmark/', '/work/node-ipc-investigation/',
           '/work/chess-puzzle-qa/']
CASE_CARDS = {
    '/work/westinghouse-performance/': 'westinghouse-performance',
    '/work/scientific-ai-benchmark/': 'tbs-meta-analysis',
}
errors = []

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = []
        self.links = []
        self.canonical = []
        self.metadata = {}
        self.h1 = 0
        self.active = []
        self.classes = Counter()
        self.text = []
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.classes.update(a.get('class', '').split())
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'meta':
            self.metadata[a.get('property') or a.get('name')] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if a.get('aria-current') == 'page': self.active.append(a.get('href'))
        if tag in ['a', 'link', 'img', 'script']:
            target = a.get('src' if tag in ['img', 'script'] else 'href')
            if target: self.links.append(target)
        if tag == 'img' and not a.get('alt', '').strip(): errors.append(f'{self.path}: missing image description')
        media_page = self.path in (SITE / 'index.html', SITE / 'articles/index.html')
        if tag == 'iframe':
            allowed = re.fullmatch(r'https://www\.youtube-nocookie\.com/embed/[A-Za-z0-9_-]{11}\?autoplay=1&playsinline=1', a.get('src', ''))
            if not media_page or not allowed or 'srcdoc' in a or not a.get('title'):
                errors.append(f'{self.path}: unexpected video embed')
        allowed_scripts = {'/assets/navigation.js'}
        if self.path.is_relative_to(SITE / 'work'):
            allowed_scripts.add('/assets/portfolio/gallery-return.js')
        if media_page:
            allowed_scripts.add('/assets/publications/video-player.js')
        if tag == 'form' or (tag == 'script' and a.get('src') not in allowed_scripts):
            errors.append(f'{self.path}: unexpected {tag}')
        if a.get('href', '').startswith(('mailto:', 'tel:')): errors.append(f'{self.path}: non-LinkedIn contact')

    def handle_data(self, data): self.text.append(data)

class ExperienceRoles(HTMLParser):
    """Collect each role's headings, images, and text from the built page."""
    def __init__(self, path):
        super().__init__()
        self.roles = []
        self.role = None
        self.in_heading = False
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article' and 'role' in attrs.get('class', '').split():
            self.role = {'heading': [], 'images': [], 'text': []}
            self.roles.append(self.role)
        if self.role is not None:
            if tag == 'h2':
                self.in_heading = True
            if tag == 'img':
                self.role['images'].append(attrs)

    def handle_endtag(self, tag):
        if tag == 'h2':
            self.in_heading = False
        if tag == 'article':
            self.role = None

    def handle_data(self, text):
        if self.role is not None:
            self.role['text'].append(text)
            if self.in_heading:
                self.role['heading'].append(text)

def check_experience(path):
    # Use Jekyll's Ruby runtime to read the role front matter as YAML.
    read_roles = """
        roles = ARGV.map { |file| YAML.safe_load(File.read(file).split(/^---\\s*$/, 3).fetch(1)) }
        puts JSON.generate(roles.sort_by { |role| role.fetch('order') })
    """
    sources = sorted((ROOT / '_experience').glob('*.md'))
    expected = json.loads(subprocess.check_output(['ruby', '-ryaml', '-rjson', '-e', read_roles, *sources]))
    rendered = ExperienceRoles(path).roles
    headings = [''.join(role['heading']).strip() for role in rendered]
    if headings != [source['organization'] for source in expected]:
        errors.append('/experience/: role organizations or order differ from the source records')
    for source, role in zip(expected, rendered):
        label = f"/experience/: {source['organization']}"
        visible = ' '.join(' '.join(role['text']).split())
        if source['period'] in visible:
            errors.append(f'{label}: employment period is visible')
        if len(role['images']) != 1:
            errors.append(f"{label}: expected one thumbnail, found {len(role['images'])}")
            continue
        image = role['images'][0]
        src = image.get('src', '')
        if src != source.get('thumbnail') or not src.startswith('/assets/') or not file_for(src).is_file():
            errors.append(f'{label}: missing or incorrect thumbnail {src!r}')
        if not image.get('alt', '').strip() or image['alt'] != source.get('thumbnail_alt'):
            errors.append(f'{label}: missing or incorrect thumbnail description')

def file_for(route):
    path = SITE / unquote(route).lstrip('/')
    return path / 'index.html' if route.endswith('/') else path

parsed = {}
for route in PAGES + STUDIES:
    path = file_for(route)
    if not path.exists():
        errors.append(f'Missing page: {route}'); continue
    page = parsed[route] = Page(path)
    if page.h1 != 1: errors.append(f'{route}: expected one h1')
    if len(set(page.ids)) != len(page.ids): errors.append(f'{route}: duplicate IDs')
    if page.canonical != ['https://www.aaronschneider.org' + route]: errors.append(f'{route}: canonical URL mismatch')
    if route in PAGES[:4] + STUDIES + [ESSAY]:
        card = CASE_CARDS.get(route, 'aaron-schneider')
        image = f'/assets/portfolio/share/{card}.jpg'
        expected_meta = {
            'og:image': 'https://www.aaronschneider.org' + image,
            'og:image:width': '1200', 'og:image:height': '630',
            'twitter:card': 'summary_large_image'
        }
        for key, value in expected_meta.items():
            if page.metadata.get(key) != value:
                errors.append(f'{route}: expected {key} to be {value}')
        if not page.metadata.get('og:image:alt', '').strip() or not file_for(image).is_file():
            errors.append(f'{route}: missing sharing image or description')
    expected = [route] if route in PAGES[:4] else []
    if page.active != expected: errors.append(f'{route}: current navigation mismatch')
    if 'main' not in page.ids or '#main' not in page.links: errors.append(f'{route}: missing skip-link target')
    visible = ' '.join(page.text)
    if re.search(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}', visible): errors.append(f'{route}: unexpected public email')
    if any(value in visible for value in ['412-273-5690', '412 273 5690', 'TODO', 'Lorem ipsum']): errors.append(f'{route}: private contact or placeholder')

for route, page in parsed.items():
    for link in page.links:
        resolved = urlsplit(urljoin('https://www.aaronschneider.org' + route, link))
        if resolved.netloc != 'www.aaronschneider.org': continue
        # The monthly reports are a separate Pages project mounted on the same domain.
        if link.startswith('https://www.aaronschneider.org/common-devops-reports/'): continue
        target = file_for(resolved.path)
        if not target.exists(): errors.append(f'{route}: missing target {link}')
        elif resolved.fragment and target.suffix == '.html':
            ids = Page(target).ids
            if unquote(resolved.fragment) not in ids: errors.append(f'{route}: missing anchor {link}')

publications = json.loads(subprocess.check_output([
    'ruby', '-ryaml', '-rjson', '-e', 'puts JSON.generate(YAML.load_file(ARGV.fetch(0)))', ROOT / '_data/publications.yml'
]))
publication_count = len(publications)
if '/articles/' in parsed:
    collection = parsed['/articles/']
    for item in publications:
        entry = item.get('id', '')
        if not entry or entry not in collection.ids or '#' + entry not in collection.links:
            errors.append(f"/articles/: missing entry link for {item['title']}")
        for source in (item, item.get('related', {}), *item.get('editions', [])):
            if source and source['url'] not in collection.links:
                errors.append(f"/articles/: missing source {source['url']}")
for route, name, count in [('/work/', 'project-card', 6), ('/articles/', 'publication', publication_count), ('/experience/', 'role', 11), ('/', 'feature', 3)]:
    if route in parsed and parsed[route].classes[name] != count: errors.append(f'{route}: expected {count} {name} entries')

if '/experience/' in parsed:
    check_experience(file_for('/experience/'))

sitemap = file_for('/sitemap.xml').read_text()
if ESSAY not in parsed['/articles/'].links or sitemap.count(f'<loc>https://www.aaronschneider.org{ESSAY}</loc>') != 1:
    errors.append(f'{ESSAY}: expected a link in Articles & Demos and a unique sitemap entry')
for route in STUDIES:
    if route not in parsed['/work/'].links or f'<loc>https://www.aaronschneider.org{route}</loc>' not in sitemap:
        errors.append(f'{route}: missing from Selected Work or the sitemap')

for private in ['docs', 'scripts', 'Gemfile', 'Gemfile.lock', 'README.md', 'SECURITY.md', 'requirements-pdf.txt']:
    if (SITE / private).exists(): errors.append(f'Build exposed source-only file: {private}')
if (ROOT / 'CNAME').read_text().strip() != 'www.aaronschneider.org': errors.append('Custom domain changed')
if (SITE / 'CNAME').read_bytes() != (ROOT / 'CNAME').read_bytes(): errors.append('Published CNAME mismatch')
key = (ROOT / 'assets/aaron-schneider-public-key.asc').read_text()
pgp_text = ''.join(parsed['/pgp/'].text)
if key.strip() not in pgp_text: errors.append('Displayed PGP key does not match download')
if (SITE / 'assets/aaron-schneider-public-key.asc').read_text() != key: errors.append('Published PGP key changed')
if any(p.suffix.lower() == '.pdf' or 'resume' in p.name.lower() for p in SITE.rglob('*')): errors.append('Unexpected résumé or PDF in public site')
if any('resume.pdf' in link.lower() for page in parsed.values() for link in page.links): errors.append('Unexpected résumé download link')
if any(p.suffix.lower() in ['.mov', '.mp4', '.wav'] for p in SITE.rglob('*')): errors.append('Unexpected video/audio archive in site')

if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'PASS: {len(parsed)} pages; navigation, anchors, assets, metadata, content counts, contact restrictions, and publishing exclusions.')
print('PGP SHA-256:', hashlib.sha256(key.encode()).hexdigest())
print('Published size:', sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file()), 'bytes')
