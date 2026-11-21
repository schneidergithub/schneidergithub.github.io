# Portfolio roadmap

## Portfolio goal and release history

Serve employers and consulting clients through a portfolio of career experience, project stories, and publications.

- Career reconciliation and separate image attribution: approved by Aaron on October 26, 2026.
- Four main pages, PGP utility, six project cards, and six publication links: implemented locally.
- Local build and validation: passed, including navigation, assets, contact restrictions, and unchanged PGP key.
- Preview review and publication: approved by Aaron on October 26, 2026.
- MVP release: published through PR #1; the YouTube subscription button followed in PR #2. Live domains, pages, images, and the unchanged PGP key were verified.
- The charcoal-and-blue design and manual edits through `4b3ad29` merged in [PR #3](https://github.com/schneidergithub/schneidergithub.github.io/pull/3), including removal of education and certifications from the Experience page. [PR #4](https://github.com/schneidergithub/schneidergithub.github.io/pull/4) added versioned stylesheet and favicon URLs.

## Current MVP release

**Complete and live on November 21, 2026.** All approved MVP acceptance criteria have been met. [Production portfolio](https://www.aaronschneider.org/)

| Area | Delivered | Release |
| --- | --- | --- |
| Experience | All 11 roles display an organization or project thumbnail in place of employment dates. | [PR #7](https://github.com/schneidergithub/schneidergithub.github.io/pull/7) |
| Selected Work | Six project cards, three case studies, and 26 gallery images across five groups. Each group highlights Aaron’s contribution. | [PR #8](https://github.com/schneidergithub/schneidergithub.github.io/pull/8) and [PR #12](https://github.com/schneidergithub/schneidergithub.github.io/pull/12) |
| Articles & Demos | All eight publications have local covers. The three videos open in place and offer direct YouTube links. | [PR #9](https://github.com/schneidergithub/schneidergithub.github.io/pull/9) and [PR #10](https://github.com/schneidergithub/schneidergithub.github.io/pull/10) |
| Homepage | Five covers, three inline players, the research co-author credit, and three project results with supporting links. Visitors can contact Aaron or the CommonDevOps team directly. | [PR #11](https://github.com/schneidergithub/schneidergithub.github.io/pull/11), [PR #13](https://github.com/schneidergithub/schneidergithub.github.io/pull/13), and [PR #14](https://github.com/schneidergithub/schneidergithub.github.io/pull/14) |

The release passed the nine-page build check and deployed through GitHub Pages. Production checks covered widths of 320, 375, 768, and 1280 pixels, including keyboard operation of the video players at phone and desktop widths. [Deployment](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44946994980) · [Production checks](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44946995033)

## Sprint · Find and share publications

**Goal.** A reader can go directly to a recording, monthly review or investigation, choose where to read or watch, and share that exact entry. Product and QA found that five of eight entries lacked a stable fragment and all formats appeared in one list.

| Story | Points | Owner and acceptance |
| --- | ---: | --- |
| Browse by format | 3 | Editorial and frontend group the three recordings, four monthly articles and one research report. Native jump links show the counts and land on visible section headings. Each publication and local cover appears once. |
| Open or share an entry | 3 | Frontend gives all eight rows permanent anchors and a visible entry link. Preserve the existing benchmark, October and node-ipc fragments. Make inline play and the external YouTube destination identifiable. With JavaScript off a reader can browse every group and reach each original recording. |
| Follow the incident from two perspectives | 2 | Editorial links the node-ipc investigation and maintainer interview in both directions, identifying which is Aaron’s investigation and which is the interview. Keep the original report, DOI, interview and other companion sources reachable. |

**Sprint demo.** Enter from the homepage benchmark link and from a directly shared publication fragment. Jump between groups, play and close a video, follow a related entry, and open the same row with JavaScript off. QA checks the preview and custom domain at phone and desktop widths.

## Released sprint · From engineering result to contact

**Review and retrospective.** Product and QA accepted all six stories. At 375px, both hero actions, the Westinghouse evidence link and the research play control fit on the first screen. Four case-study paths, both contact routes and the published sharing artwork passed verification. Frontend will continue checking the full first-screen layout after adding links. QA will exercise the next no-JavaScript story from the collection itself. [Release](https://github.com/schneidergithub/schneidergithub.github.io/pull/21) · [Pages](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44958313576) · [Production checks](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44958313958)

**Sprint goal.** A hiring manager or consulting buyer can discover a concrete engineering result from the homepage, Selected Work, or Experience, read what Aaron changed, and share the case or reach the right contact.

**Planning decision, November 21, 2026.** Product, marketing, design, frontend and QA selected six delivery stories totaling 15 points. The forecast is one working week with editorial, design and frontend overlapping, about six to eight person-days including QA and release. The previous sprint delivered five points. This forecast assumes the team uses the portfolio's existing project and career records for the new case.

| Priority | Visitor story and owner | Points | Implementation and acceptance |
| --- | --- | ---: | --- |
| 1 | **Read the Westinghouse case.** As an engineering manager, I can explain Aaron's contribution and the measured outcome. Editorial + tech lead | 3 | Publish the fourth case study at `/work/westinghouse-performance/` using the existing case-study layout. Explain the Sogeti / Capgemini engagement, load testing, configuration changes and threefold Elasticsearch throughput. Attribute the $20 million figure to the website and the 13 projects to Aaron's broader QA remit. Use the documented relative result. The page has a canonical URL, appears in the sitemap and links back to the original project card. [Project record](../_work/04-westinghouse.md) · [Role record](../_experience/05-capgemini.md) |
| 2 | **Reach the result from the first screen.** As a homepage visitor, I can open the supporting case in one click. Product + frontend | 2 | Place one descriptive text link immediately below the hero actions, “How I tripled Elasticsearch throughput at Westinghouse.” The hero link, featured result, Westinghouse project card and gallery detail link all lead to the case. Existing inbound links to `/work/#westinghouse` still land on the card. At 375 × 900 both original actions share a row and the research play control remains visible. [Homepage](../index.md) · [Gallery](../_data/gallery.json) |
| 3 | **Find evidence from Work and Experience.** As a recruiter, I can go directly from an employer or project outcome to the relevant case. Content + frontend | 3 | Add four outcome-labeled case links near the top of Selected Work using the existing case-study records. On Experience, link Sogeti / Capgemini to Westinghouse, BCforward to Indiana archives, ProPoint to Super Salon checkout, and Ciber to Bayer's Aleve. Verify each destination and the existing six project cards, 26 gallery images, and 11 role thumbnails. [Selected Work](../work.md) · [Experience](../experience.md) |
| 4 | **Choose a contact after reading.** As a prospective employer or client, I can act at the end of a case study. Product + frontend | 2 | Add a common ending after the final narrative or figure on all four studies. “Discuss this work” leads to `/#connect`, where individual engagements reach Aaron and team engagements reach CommonDevOps through their existing LinkedIn links. A separate return link lands on the matching Selected Work card. Check the ending by keyboard on a study with figures and one without. [Case-study layout](../_layouts/case-study.html) |
| 5 | **Share a recognizable portfolio link.** As a reader forwarding a link, I can identify the portfolio or the Westinghouse result from its preview. Marketing design + frontend | 3 | Ship a local 1200 × 630 portfolio card and a Westinghouse card of the same size naming the 3× result. Configure the shared layout with an absolute Open Graph image URL, dimensions, descriptive image text and large-image card metadata. The four primary pages and three earlier studies use the default. Westinghouse uses its own art. Verify the delivered HTML and image responses on the custom domain and inspect both images at 300px wide. [Shared layout](../_layouts/default.html) |
| 6 | **Distinguish content from controls.** As a visitor, I can locate project results and recognize actions while scanning the homepage. UX + frontend | 2 | Give the research panel a thin slate border and soft static shadow. Set the Selected Work results on a subtly lighter charcoal surface with the existing divider. Apply a short color or border transition to actionable controls when motion is allowed. Preserve the champagne signature, blue links and immediate gold keyboard focus. At reduced motion, controls change state immediately. Check closed and open video cards, keyboard focus and the phone layout. [Stylesheet](../assets/site.css) |

### Delivery sequence and release

1. **Start with the evidence.** Editorial and the tech lead establish the Westinghouse page and permanent URL. In parallel, design prepares the two share cards and homepage treatments, and frontend prepares the shared case ending. Use the existing brand banner only as historical context if a figure is needed.
2. **Connect the entry points.** Once the case route exists, wire the homepage, Work, Experience and gallery links. On the first layout commit, run the 320px check with 200% text. Review the research poster with its real play control at the 150px collection size and at homepage size alongside the new share artwork.
3. **Exercise the whole journey.** Extend the existing static and browser checks for four case-study routes, ten validated pages, the new deep links, contact destinations and share images. Include the new asset paths in the PR and main-branch workflow filters. Run the seven-width browser suite, check reduced motion, and capture phone, tablet and desktop views at 375px, 768px and 1280px. [Static checks](../scripts/check_site.py) · [Case-study checks](../scripts/check_case_studies.cjs) · [Portfolio workflow](../.github/workflows/experience.yml)
4. **Demonstrate and release.** From the closed homepage, a reviewer identifies the employer and metric, opens the case in one click, explains Aaron's role, and reaches the individual and team contact options. Repeat the evidence path from Selected Work and Experience, inspect the Westinghouse share card, and open the research player on a phone. After the implementation PR merges, record the Pages deployment and passing custom-domain checks here.

## Released sprint · Introduce the research before playback

**Released and reviewed November 21, 2026.** The team accepted both stories (5 of 5 planned points). A first-time visitor can identify what Terminal-Bench-Science investigates before pressing play, then watch the presentation or follow the work to the merged task. The baseline was the published champagne signature and two hero actions. [Baseline](https://github.com/schneidergithub/schneidergithub.github.io/pull/16) · [Release PR](https://github.com/schneidergithub/schneidergithub.github.io/pull/18) · [Pages deployment](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44956892983)

**Forecast.** Five relative points across two stories. Allow two to three focused person-days including artwork, implementation, review and release verification. The estimate assumes the team uses the poster fallback below if a clear source frame is unavailable.

### Story 1 · Understand the featured research (3 points)

As a hiring manager, I want to know what Aaron and Dr. Ian Miller investigated before I decide to watch their presentation.

- **Design and editorial.** Use “Terminal-Bench-Science” as the label and place “Can an AI agent reproduce a scientific result?” ahead of the play control. Credit both co-authors and retain Aaron’s infrastructure review and trial analysis roles. Spend up to 90 minutes looking for a genuine presentation frame at least 960 × 540 with a recognizable subject. If the recording cannot supply a sharp crop, create a local 16:9 title card from the presentation’s verified title. Leave the lower left clear for the play control.
- **Implementation.** Change the feature order in [the homepage](../index.md). Adjust the 641–850px tablet grid in [the stylesheet](../assets/site.css) to match that reading order. Update the benchmark’s shared [publication record](../_data/publications.yml) with the new local image, its actual dimensions and a description of its contents.
- **Acceptance.** The label and question precede the play control visually and in document order on phone, tablet and desktop. The poster is recognizable at homepage size and at the collection’s 150px width. The presentation opens inline by keyboard with visible focus, closes cleanly and offers the direct YouTube link with JavaScript disabled. The existing presentation link still leads to its collection entry and merged task.

### Story 2 · Scan the hero and choose an action on a phone (2 points)

As a visitor using a phone, I want to read each specialization as a phrase and reach either portfolio action without losing sight of the featured research.

- **Implementation.** Keep “AI Research” together and balance the lines of the research question. At 375px, pair “Explore selected work” with an underlined “View experience” link in the same row. Allow wrapping as space or enlarged text requires.
- **Acceptance.** At 375 × 900 the two actions fit on one row at default text size and the initial screen shows the research play control. Each action has a tap target at least 44px high, a visible keyboard focus state and its existing destination. At 320px and with 200% text, controls can reflow without overlap, clipping or horizontal scrolling. At desktop widths the champagne signature stays on one line.

### Delivery plan

1. **Design and frontend** select the cover and render it at both sizes. Frontend can develop the mobile controls while design sources the frame.
2. **Frontend and QA** integrate both stories and extend the [homepage browser checks](../scripts/check_publications.cjs) for reading order, cover dimensions and action layout. Run the existing build and seven-width browser suite. Inspect the 768px tablet layout and compare the 375px and 1280px captures with the baseline.
3. **Product and QA** open the preview with the player closed. Ask a reviewer to name the benchmark and describe its question before playback. Then use the keyboard to play and close it and follow the link to the task. After merge, verify the Pages deployment and the portfolio checks against the custom domain before marking the sprint complete.

### Sprint review

- **Research feature accepted.** A virtual recruiter reviewing the closed player at 375px and 1280px could name the benchmark, identify the meta-analysis question, and find Play. At 768px the question spans the tablet grid above the poster and credits. The homepage and collection use the same 1280 × 720 cover. The collection leads to the [merged task](https://github.com/harbor-framework/terminal-bench-science/pull/1513). [Production captures](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44956892598/artifacts/14728006786)
- **Phone layout accepted.** At 375 × 900 both portfolio actions fit on one row, each at least 44px high. The research panel begins about 55px higher than in the baseline, and Play is visible on the first screen. Production browser checks passed at seven widths from 320px to 1440px, including keyboard operation and embed loading on both media pages, the homepage fallback with JavaScript disabled, and hero action bounds at 200% text on narrow screens. [Before-and-after captures](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44956448329/artifacts/14728220396) · [Custom-domain checks](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44956892598)

### Sprint retrospective

| What the team learned | Owner and next-sprint action | Evidence to bring to review |
| --- | --- | --- |
| The first preview caught a clipped action at 320px with 200% text. Adjusting the grid and button wrapping fixed it. | Frontend and QA run that case on the first layout change. | Record the result alongside the first preview. [Initial failure](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44956310690) · [Passing fix](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44956448329) |
| The same cover has different play controls in the collection and on the homepage. | Design and QA inspect both renditions with their actual controls before approving shared artwork. | Show the 150px collection thumbnail and the homepage cover with title and faces clear of the controls. |
| The earlier phone layout already showed Play. Asking someone what they would be playing exposed the reading-order issue. | Product keeps an unaided first-screen prompt in the next homepage review. | Record which outcome a reviewer identifies and which link they choose on phone and desktop. |

The engineering results sprint delivered the Westinghouse link and homepage visual updates while retaining the 375px research play control.

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

## Selected Work case studies

Three project cards now open detailed case studies. Each explains Aaron’s contribution and an observed result. The ProPoint and Aleve stories also link to full-size historical screenshots.

| Case study | Evidence used |
| --- | --- |
| [ProPoint checkout](../work/super-salon-checkout.md) | Project notes describe a discounted purchase that produced a one-cent difference after synchronization. The product archive supplies desktop and SaaS screenshots. |
| [Indiana case archives](../work/indiana-case-archives.md) | The pilot account documents the filename issue and correction. Aaron’s rollout account scopes the file counts and monthly storage savings per county across 92 counties. |
| [Bayer’s Aleve website](../work/bayer-aleve.md) | Aaron’s role history establishes lead development through Ciber. The archived homepage and story page document the delivered site. |

## Selected Work gallery highlights

| Reader goal | MVP acceptance criteria | Implementation |
| --- | --- | --- |
| Understand Aaron’s contribution before opening an image. | Each of the five project groups opens with a short first-person highlight. The Westinghouse highlight identifies the release testing and the $20 million website. Bucky Ball Web identifies Aaron’s role as co-owner and the more than 100 business sites he built and hosted. | Update the group descriptions in the existing gallery inventory. Use Aaron’s account for those two figures and the published project and role records for ProPoint, Bayer, and Berkeley. Keep image captions and alternative text descriptive. |
| Follow a highlight to the engineering details. | The checkout and Aleve highlights open their case studies. The Westinghouse link leads to the QA project card and its Elasticsearch throughput result. | Add a related link to those three gallery entries and render it just below the highlight. |
| Browse the gallery on a phone or desktop. | At 375 and 1280 pixels, all five gallery jumps lead to the matching highlights, the three detail links resolve, and all 26 image pairs remain accessible. | Extend the existing Selected Work browser check and run it against the preview and deployed site. |

## Articles & Demos release

Bring the collection to eight entries and feature three ways to examine the work on the homepage. The [benchmark presentation](https://www.youtube.com/watch?v=e26_SSPpOP0) explains a scientific task, the [October review](https://www.aaronschneider.org/common-devops-reports/reports/2026-10/) covers the month in AI and cybersecurity, and the [NODE-IPC report](https://doi.org/10.6084/m9.figshare.33865414) documents an investigation.

| User story | Acceptance criteria | Implementation |
| --- | --- | --- |
| As a hiring manager, I want to see how Aaron tests AI agents on scientific work. | The homepage and CommonDevOps project lead to the presentation. Its entry identifies the co-authors and links to the video and merged task. | Update the homepage focus and project summary. Add a permanent presentation anchor, verify the video against [Aaron’s public profile](https://github.com/schneidergithub), and use [PR #1513](https://github.com/harbor-framework/terminal-bench-science/pull/1513) for task status. |
| As a reader, I want the original article or research report and a downloadable or citable edition. | The October entry links to the HTML and PDF. The NODE-IPC entry names Aaron’s contribution and links to the first-edition DOI. Both have locally hosted cover previews with alternative text. | Crop the masthead from the [published October PDF](https://www.aaronschneider.org/common-devops-reports/reports/2026-10/common-devops-october-2026.pdf), reuse the existing NODE-IPC cover, and add optional preview and companion-link fields to the publication records. |
| As a maintainer, I want to catch broken links and covers before and after release. | The collection renders every publication record. At 375 and 1280 pixels the feature opens the intended entry, both images load, and the list fits. The separately hosted October links return the expected headline and a PDF. | Extend the existing site check and portfolio workflow. Run the browser checks against the build and the deployed site. |

## Homepage media and project results sprint

**Sprint goal.** An engineering manager can watch the benchmark presentation, inspect a project result, and find the right contact from the homepage.

The marketing and technical recruiting review found that the homepage repeated the benchmark project and sent visitors through summaries to reach case studies. The UI/UX review found a separate, text-only publication list below the contact actions. On a 375-pixel phone, the last navigation link wrapped onto a row by itself and the four-line headline pushed the research below the buttons. The visual design review retained blue for links and gold for keyboard focus and selected a stronger border for the play controls. The engineering and QA review identified the separate homepage template as the reason the collection’s media checks missed this problem.

| Priority | Visitor story | Implementation and acceptance |
| --- | --- | --- |
| 1 | As a visitor, I can recognize and play a video on the homepage. | Put the benchmark poster and player in the research panel. Show the October issue, NODE-IPC report, maintainer interview, and security livestream with their original covers above contact. Reuse the collection’s player. Open and close each video by keyboard, verify the direct YouTube links, and confirm all five images load. |
| 2 | As an engineering manager, I can identify a result and inspect the supporting work. | Feature the Indiana rollout across 92 counties, Westinghouse’s threefold Elasticsearch throughput, and the one-cent Super Salon checkout discrepancy. Link directly to the two case studies and the Westinghouse QA project. |
| 3 | As a visitor on a phone or using a keyboard, I can distinguish the actions and follow the page in order. | Give actionable media distinct controls, preserve cover proportions, and use the established blue links and gold focus treatment. Present project and publication evidence before contact. Check focus visibility and reflow through the phone, tablet, and desktop layouts. |

**Release review.** Build the site and exercise the homepage and Articles & Demos through their public entry points. After deployment, repeat the recruiter and consulting visitor journeys on the custom domain. Recheck the image loads, inline players, evidence links, contact destinations, focus treatment, and narrow-screen layout. Record the production run and any follow-up findings with the release.

**Second review.** The [first production check](https://github.com/schneidergithub/schneidergithub.github.io/actions/runs/44946630400) verified five homepage images at four widths and keyboard operation for all three players on both media pages. In the live 375-pixel screenshot the benchmark poster and play control were visible on the first screen. The design review identified an isolated navigation link on phones, an isolated external-link arrow on tablets, and uneven card edges on desktop. The follow-up uses two balanced navigation rows on narrow phones, keeps the arrow with its video title, and aligns the closed cards and result figures.

The engineering results sprint delivered the portfolio sharing image and dedicated Westinghouse case cover.

## Later portfolio work

Consider a small historical archive if a project has an owner-cleared artifact and enough context to explain Aaron’s contribution. Continue adding individual publications to the existing collection as they appear.

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

All four article/report URLs returned HTTP 200 on October 26, 2026 and their titles/publishers were inspected. The three LinkedIn publication dates were confirmed from the article pages. The report has inconsistent date references across sources, so its publication date is omitted. Both YouTube IDs returned title and CommonDevOps channel attribution through YouTube oEmbed. Video publication dates are omitted rather than inferred. The original MVP linked videos to YouTube. Articles & Demos now uses a local thumbnail for each publication. Selecting a video thumbnail opens the YouTube player in place, and closing it stops playback. The video titles still link directly to YouTube.

## Original MVP release sequence

1. Finish local build, document checks, link checks, and desktop/mobile review.
2. Aaron reviews the complete preview for factual accuracy, organization, and basic usability.
3. After review, unarchive the existing repository, open a pull request, and publish through the existing `main` / root GitHub Pages source.
4. Verify apex and www domains, HTTPS, navigation, absence of résumé files/links, and PGP key. Preserve the domain configuration and branch protections.

Pre-MVP revision: `accccc0362059e3baf3d1aac9ae521ef45661b2c`. Rollback uses a revert of the MVP merge through a pull request, preserving history, followed by deployment and domain checks.

No CMS, backend, contact form, newsletter, search, or complete archive is included in the MVP.
