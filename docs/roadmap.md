# Portfolio MVP roadmap

## Goal and status

Publish a professional portfolio serving employers and consulting clients equally, then refine its visual design and expand the project stories.

- Career reconciliation and separate image attribution: approved by Aaron on October 26, 2026.
- Four main pages, PGP utility, six project cards, and six publication links: implemented locally.
- Local build and validation: passed, including navigation, assets, contact restrictions, and unchanged PGP key.
- Preview review and publication: approved by Aaron on October 26, 2026.
- MVP release: published through PR #1; the YouTube subscription button followed in PR #2. Live domains, pages, images, and the unchanged PGP key were verified.
- Design polish: charcoal/blue styling and system-font refinements implemented locally from `6335594`, preserving the latest manual content. Awaiting design review before publication.

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

## Release sequence

1. Finish local build, document checks, link checks, and desktop/mobile review.
2. Aaron reviews the complete preview for factual accuracy, organization, and basic usability.
3. After review, unarchive the existing repository, open a pull request, and publish through the existing `main` / root GitHub Pages source.
4. Verify apex and www domains, HTTPS, navigation, absence of résumé files/links, and PGP key. Preserve the domain configuration and branch protections.

Pre-MVP revision: `accccc0362059e3baf3d1aac9ae521ef45661b2c`. Rollback uses a revert of the MVP merge through a pull request, preserving history, followed by deployment and domain checks.

## Later iterations

1. Review the local charcoal/blue design polish, then publish the approved version through a pull request.
2. Expand selected project cards into case studies with supporting evidence.
3. Add approved screenshots, published videos, and original articles incrementally.
4. Consider a wider historical archive only if useful.

No CMS, backend, contact form, newsletter, search, or complete archive is included in the MVP.
