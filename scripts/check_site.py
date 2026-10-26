"""Check the built static site's navigation, assets, metadata, and release boundaries."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, urljoin, unquote
import hashlib
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / '_site'
PAGES = ['/', '/experience/', '/work/', '/articles/', '/pgp/', '/404.html']
errors = []

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = []
        self.links = []
        self.canonical = []
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
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if a.get('aria-current') == 'page': self.active.append(a.get('href'))
        if tag in ['a', 'link', 'img']:
            target = a.get('src' if tag == 'img' else 'href')
            if target: self.links.append(target)
        if tag == 'img' and not a.get('alt', '').strip(): errors.append(f'{self.path}: missing image description')
        if tag in ['iframe', 'script', 'form']: errors.append(f'{self.path}: unexpected {tag}')
        if a.get('href', '').startswith(('mailto:', 'tel:')): errors.append(f'{self.path}: non-LinkedIn contact')

    def handle_data(self, data): self.text.append(data)

def file_for(route):
    path = SITE / unquote(route).lstrip('/')
    return path / 'index.html' if route.endswith('/') else path

parsed = {}
for route in PAGES:
    path = file_for(route)
    if not path.exists():
        errors.append(f'Missing page: {route}'); continue
    page = parsed[route] = Page(path)
    if page.h1 != 1: errors.append(f'{route}: expected one h1')
    if len(set(page.ids)) != len(page.ids): errors.append(f'{route}: duplicate IDs')
    if page.canonical != ['https://www.aaronschneider.org' + route]: errors.append(f'{route}: canonical URL mismatch')
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
        target = file_for(resolved.path)
        if not target.exists(): errors.append(f'{route}: missing target {link}')
        elif resolved.fragment and target.suffix == '.html':
            ids = Page(target).ids
            if unquote(resolved.fragment) not in ids: errors.append(f'{route}: missing anchor {link}')

for route, name, count in [('/work/', 'project-card', 6), ('/articles/', 'publication', 6), ('/experience/', 'role', 11), ('/', 'feature', 3)]:
    if route in parsed and parsed[route].classes[name] != count: errors.append(f'{route}: expected {count} {name} entries')

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
print(f'PASS: {len(PAGES)} pages; navigation, anchors, assets, metadata, content counts, contact restrictions, and publishing exclusions.')
print('PGP SHA-256:', hashlib.sha256(key.encode()).hexdigest())
print('Published size:', sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file()), 'bytes')
