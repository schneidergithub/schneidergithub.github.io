# Portfolio roadmap

## Portfolio goal and release history

Serve employers and consulting clients through a portfolio of career experience, project stories, and publications.

- Career reconciliation and separate image attribution: approved by Aaron on October 26, 2026.
- Four main pages, PGP utility, six project cards, and six publication links: implemented locally.
- Local build and validation: passed, including navigation, assets, contact restrictions, and unchanged PGP key.
- Preview review and publication: approved by Aaron on October 26, 2026.
- MVP release: published through PR #1; the YouTube subscription button followed in PR #2. Live domains, pages, images, and the unchanged PGP key were verified.
- The charcoal-and-blue design and manual edits through `4b3ad29` merged in [PR #3](https://github.com/schneidergithub/schneidergithub.github.io/pull/3), including removal of education and certifications from the Experience page. [PR #4](https://github.com/schneidergithub/schneidergithub.github.io/pull/4) added versioned stylesheet and favicon URLs.

## Experience thumbnails

Approved November 21, 2026. [Release PR #7](https://github.com/schneidergithub/schneidergithub.github.io/pull/7) implements one thumbnail per role. The source records retain their dates and use the existing `order` field for display.

1. **Prepare the images.** Reuse the five gallery thumbnails listed below. Choose a public CommonDevOps project screenshot and collect the five organization logos.
2. **Build the responsive layout.** Preview one screenshot and one logo in the former date column while sourcing the remaining assets, then connect all eleven roles.
3. **Verify and release.** Run the build and per-role checks, review desktop and phone previews, then verify the published page after merge.

### Story 1 · Recognize the project or organization

**As a hiring manager**, I want each role paired with a recognizable piece of work or organization logo so I can connect the experience to the product or employer.

| Role, in display order | Image to use | Asset status |
| --- | --- | --- |
| CommonDevOps | [NODE-IPC report title page](https://doi.org/10.6084/m9.figshare.33865414) | Cropped the title area of the published first edition. |
| Nuix | Nuix logo | Wordmark from the Nuix Log Reviewer repository. |
| Yo Pagos | Yo Pagos logo | Historical Yo.cr Pagos wordmark from the owner’s portfolio. |
| BCforward | BCforward logo | Historical employer mark from the owner’s portfolio. Indiana and Eli Lilly are its client engagements. |
| Sogeti / Capgemini | [Westinghouse brand visual](../assets/portfolio/thumbs/westinghouse.webp) | Reuse the gallery image and describe Westinghouse as the client. |
| ProPoint Global | [Super Salon point-of-sale screen](../assets/portfolio/thumbs/supersalon.webp) | Reuse the gallery thumbnail. |
| Ciber | [Aleve homepage](../assets/portfolio/thumbs/portfolio-aleve.webp) | Reuse the gallery thumbnail for the Bayer engagement. |
| Berkeley Communications | [ADrive website](../assets/portfolio/thumbs/adrive.webp) | Reuse the gallery thumbnail. |
| Bucky Ball Web | [Original company homepage](../assets/portfolio/thumbs/buckyball.webp) | Reuse the gallery thumbnail. |
| Hanscom Air Force Base | Hanscom Air Force Base logo | Team Hanscom shield isolated from the original portfolio banner. |
| Joslin Diabetes Center | Joslin Diabetes Center logo | Historical Joslin Diabetes wordmark from the owner’s portfolio. |

#### Acceptance criteria

- [x] Each of the eleven role records points to the assigned image in the table. Each path resolves to a local site asset.
- [x] The five existing gallery images use their current thumbnail files. The CommonDevOps screenshot and five organization logos have identifiable sources recorded in the implementation pull request.
- [x] Each record supplies concise alternative text. Project images identify the visible product or client, such as “Super Salon point-of-sale interface.” Logos identify the organization they represent.

#### Implementation steps

1. Match the five existing images against the [gallery inventory](../_data/gallery.json). Reuse its descriptions where they fit the smaller image.
2. Select the CommonDevOps view and obtain the five logos from the organizations or owner-supplied artwork. Verify the identities before preparing local web assets.
3. Add the six new images under `assets/experience/`. Add `thumbnail` and `thumbnail_alt` to each [role record](../_experience/), following the table above.

### Story 2 · Scan the roles on desktop and mobile

**As a recruiter**, I want to see the image, organization, title and accomplishments together so I can scan roles quickly on my laptop and read the details on my phone.

#### Acceptance criteria

- [x] All eleven roles render in their existing order with their organization, title and accomplishment text. No employment period appears in the rendered role markup.
- [x] On desktop each image occupies the former date column and aligns with its heading. Wide screenshots and logos fit inside a consistent frame without cropping or stretching.
- [x] At a 375 CSS-pixel viewport, the image sits beside the organization and title. The bullets use the full row below. The longest heading wraps without overlap or horizontal scrolling.
- [x] With images disabled, the organization, title and accomplishments remain readable in sequence. The thumbnails introduce no extra keyboard stops.

#### Implementation steps

1. In the [Experience template](../experience.md), replace the `role.period` output with a local image bound to the role's thumbnail fields. Use Jekyll's `relative_url` filter for the path and escape the alternative text. Keep the existing sort by `order`.
2. Give the image, heading group and body distinct grid areas. In the [stylesheet](../assets/site.css), place the image left of the text on wide screens and beside the heading at the phone breakpoint. Let the mobile body span both columns.
3. Set frame dimensions and use `object-fit: contain`. Check a wide logo, a detailed screenshot and the longest heading against the site's dark background.

### Story 3 · Catch missing images and date regressions

**As the site maintainer**, I want the build to flag a role with a missing thumbnail or an exposed employment period so future edits preserve the approved layout.

#### Acceptance criteria

- [x] A clean Jekyll build passes the repository's site checks with all eleven roles present and exactly one assigned, locally resolvable image per role.
- [x] The check fails if an individual role has zero or two thumbnails, a broken image path, missing alternative text, or its employment period in the rendered text. It reports the affected role or asset.
- [x] The implementation pull request includes desktop and phone previews. The release workflow checks the deployed role order, image assignments and all eleven image loads after merge.

#### Implementation steps

1. Extend the existing [site checker](../scripts/check_site.py) to inspect each `article.role` in the built Experience page. Reuse the existing checks for local asset targets and alternative text. Compare employment periods only within the role entries so unrelated dates elsewhere do not trigger a failure.
2. Run `bundle exec jekyll build` and `python3 scripts/check_site.py`. Use a temporary rendered copy to confirm that removing one role's image or restoring its date causes the expected failure.
3. Inspect the page at 1280 and 375 CSS pixels and attach representative previews to the pull request. After the GitHub Pages deployment, open the [published Experience page](https://www.aaronschneider.org/experience/) and verify the images load from the deployed paths.

## Later portfolio work

1. Expand selected project cards into case studies with supporting evidence.
2. Add approved screenshots, published videos, and original articles incrementally.
3. Consider a wider historical archive only if useful.

## Approved career record

Use the October 1, 2026 résumé's titles and dates for overlapping roles. Indiana and Eli Lilly are BCforward client engagements. Use Elasticsearch throughput for the Westinghouse result. Earlier roles absent from the résumé use the supplied LinkedIn PDF.

| Entry | Approved record |
| --- | --- |
| CommonDevOps | Full Stack Engineer; April 2025–present |
| Nuix | U.S. DevSecOps Manager; September 2024–March 2025 |
| Yo Pagos | DevSecOps Architect & Manager; August 2023–September 2024 |
| BCforward | Indiana and Eli Lilly engagements; February 2022–August 2023. The umbrella heading describes consulting work, not an additional job title. |
| Sogeti / Capgemini | QA Manager & SDET, Westinghouse Consultant; September 2021–February 2022 |
| ProPoint Global | Hardware, Software, and QA Engineer; June 2015–June 2021 |
| Ciber | Senior Software Engineer; August 2012–April 2014 |
| Berkeley Communications | Software Engineer & Tech Support; December 2005–February 2012 |
| Westinghouse result | Tripled Elasticsearch throughput through configuration improvements informed by performance testing |

Education is labeled Computer Science; no degree award is claimed. Selected certifications use explicit names from the LinkedIn PDF, avoiding inconsistent issuer labels and broader unverified certificate titles. Historical sources support the earlier co-op and Bucky Ball roles. Historical ROI claims are omitted.

## Asset and publication review

The project cards use separately attributed Bayer Pest Management and ProPoint / Super Salon Guest Pass images. At Aaron's request, Selected Work also includes all 26 distinct images from the supplied `portfolio2` folder, grouped by project and linked to larger views. The folder's two exact duplicates appear only once. Images are optimized for the web, and the Westinghouse brand visual is labeled as such. The mixed collage, source PDFs, video files, and other archive media are excluded. Aaron subsequently requested that his résumé not be posted publicly: the MVP has no résumé PDF, download links, or résumé generator. The Experience page remains a portfolio career summary. Originals remain outside the repository.

All four article/report URLs returned HTTP 200 on October 26, 2026 and their titles/publishers were inspected. The three LinkedIn publication dates were confirmed from the article pages. The report has inconsistent date references across sources, so its publication date is omitted. Both YouTube IDs returned title and CommonDevOps channel attribution through YouTube oEmbed. Video publication dates are omitted rather than inferred. Videos are linked, not embedded or uploaded.

## Original MVP release sequence

1. Finish local build, document checks, link checks, and desktop/mobile review.
2. Aaron reviews the complete preview for factual accuracy, organization, and basic usability.
3. After review, unarchive the existing repository, open a pull request, and publish through the existing `main` / root GitHub Pages source.
4. Verify apex and www domains, HTTPS, navigation, absence of résumé files/links, and PGP key. Preserve the domain configuration and branch protections.

Pre-MVP revision: `accccc0362059e3baf3d1aac9ae521ef45661b2c`. Rollback uses a revert of the MVP merge through a pull request, preserving history, followed by deployment and domain checks.

No CMS, backend, contact form, newsletter, search, or complete archive is included in the MVP.
