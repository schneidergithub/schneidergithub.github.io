# Aaron Schneider's portfolio

Static Jekyll site for **www.aaronschneider.org**, published by GitHub Pages from the root of `main`.

See [the roadmap](docs/roadmap.md) for content decisions, review status, and next steps.

## Edit content

- Main pages: `index.md`, `experience.md`, `work.md`, and `articles.md`.
- Career entries: `_experience/`, used by the Experience page.
- Project cards: `_work/`. Set `featured: true` for homepage selections.
- Portfolio gallery: `_data/gallery.json`, with optimized images and thumbnails in `assets/portfolio/`.
- Publication links: `_data/publications.yml`, in editorial display order.
- Shared profile and certifications: `_data/profile.yml`.
- Layout and styles: `_layouts/`, `_includes/`, and `assets/site.css`.

Keep résumés, original documents, and unused media outside the public repository. Aaron does not want a public résumé or résumé download. LinkedIn is the only advertised contact route. The existing public PGP key is retained under `/pgp/` and as `assets/aaron-schneider-public-key.asc`.

## Preview and check

Install Ruby and Bundler, then run:

```sh
bundle install
bundle exec jekyll build --strict_front_matter
bundle exec jekyll serve --host 127.0.0.1 --port 4173
python3 scripts/check_site.py
```

## Publishing

Preview and review before merging. Keep `CNAME` unchanged. The current publishing source is `main` at `/`; changes to that branch trigger publication. The repository was archived at the start of this update and must be unarchived after preview review before opening the release pull request. Do not bypass branch protections.
