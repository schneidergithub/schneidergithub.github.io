# Selected Work implementation plan

**Status:** Approved for implementation; Sprint 1 in progress.  
**Prepared:** November 22, 2026.  
**Baseline:** Production release #80, commit `fc5c318d28fabb5371f0e45ed4c522cd96f23f6a`.  
**Evidence:** A simulated walkthrough of the live page at 1280×720 and 375×812, followed by inspection of the current templates and checks. No real participant study or conversion measurement has been performed.

## Goal

Make it easy to identify Aaron’s current work, understand his contribution, and inspect the supporting material without losing the project context. Visual coherence and readable evidence are the first delivery priorities.

Deliver three independently reviewable sprints in sequence. Each sprint includes implementation, relevant checks, a desktop and phone visual review, and a release review. Sprint lengths are planning units, not calendar commitments.

## Decisions carried forward

- Terminal-Bench-Science remains the lead. Preserve Aaron’s exact approved introduction, including the MDD Executive Function task and Dr. Ian Miller’s co-author credit.
- Node-IPC and Chess benchmarks remain separate sections. Preserve the Node-IPC summary exactly: “I was the primary author of the official post-incident report.” Keep both supplied YouTube links and the versioned report DOI.
- ProPoint leads with building the software, around 30,000 salons, and hundreds of millions of dollars in annual transactions. The checkout discrepancy remains supporting material.
- Westinghouse covers leadership across 13 projects, the 20-person offshore team, QTP/UFT automation, LoadRunner/JMeter/BlazeMeter performance testing, handover, playbooks and documentation. Retain the measured 3× Elasticsearch result.
- Do not restore the removed project or gallery navigation rows, the “Project summaries” heading, or the standalone company-history-banner link. Do not introduce a Nuix spotlight.
- Preserve the editorial masthead, compact subpage footer, and LinkedIn/YouTube brand colors. Homepage scope is limited to the incoming Selected Work link and any directly affected shared presentation.
- Retain all 26 original gallery assets, existing case URLs, source attribution, and meaningful fragment destinations. Do not invent results, dates, research findings, or graphics that resemble actual measurements.

## Proposed page structure

Use one continuous project sequence. Each project has one introduction, one clear primary action where a detail page exists, and its relevant evidence beside or immediately below it.

1. Selected Work title and Terminal-Bench-Science feature.
2. ProPoint Global / Super Salon, with its four-image collection.
3. Westinghouse, with a factual engagement overview and optional historical image.
4. Node-IPC investigation, with the report and two interviews.
5. Chess benchmarks, with a readable preview and presentation link.
6. More projects: Indiana, Bayer, Eli Lilly, Berkeley Communications, and Bucky Ball Web. Bayer, Berkeley, and Bucky Ball contain their own images.
7. Discuss a project and the existing compact footer.

Remove the repeated Gallery section. Use full-width project rows with internal copy/evidence columns on desktop, stacking on phones. ProPoint and Westinghouse no longer share an equal-height outer row. Supporting projects use a compact variation of the same typography and action patterns.

## Sprint 1 — Unify the layout and put evidence with its project

**Reader outcome:** Identify the featured work from every main entry, scan a consistent project sequence, and find images without encountering a second portfolio farther down the page.

| Story | Implementation | Acceptance |
| --- | --- | --- |
| S1.1 Correct the homepage entry | Change “Browse project summaries” to “Explore selected work” and point it to `/work/`. Keep the old fragment available for existing bookmarks. | The homepage entry opens the top of Selected Work with Terminal-Bench-Science as the first project. |
| S1.2 Consolidate projects and galleries | Extract a reusable project-image collection from the current gallery loop. Render each collection once within its project. Add compact Berkeley and Bucky Ball records without promoting them to homepage features. Keep `_data/gallery.json` as the image inventory. | One introduction per project on `/work/`; all 26 originals are reachable; Bayer retains eight examples with four detail views grouped beneath their two app overviews. No duplicate IDs or repeated Gallery introduction. |
| S1.3 Establish the visual hierarchy | Use a shared type scale, text measure, separator spacing, and action placement. Keep the hero title largest. Use independent desktop project rows and stack evidence below copy on phones. | ProPoint, Westinghouse, Node-IPC and Chess have consistent project-title treatment. No blank column extending alongside the remainder of another project. No clipped headings or horizontal page scrolling at the review widths. |
| S1.4 Improve the first previews | Give ProPoint a legible primary screenshot on phones, with remaining images expandable. Give Westinghouse a responsive HTML/CSS overview of “13 projects,” “20-person team,” automation, performance testing, documentation, and “3× search throughput.” Retain the historical banner only as optional archival material. | At 375px the booking interface and checkout screen are distinguishable without enlarging. Westinghouse’s first visual explains the engagement; it does not imply the banner is QA evidence. All displayed numbers match the approved content. |
| S1.5 Make project actions predictable | Link project titles consistently when a case exists. Use one explicit primary case action with project-specific accessible text. Separate related essays, reports, videos and image controls. Label the Node-IPC destinations “Case study” and “Published report”; retain descriptive interview titles with a recognizable YouTube treatment. | A reviewer can distinguish opening a case, reading a report, watching a video, and enlarging an image before activating the control. Projects without a detail page do not gain dead links or fake buttons. |
| S1.6 Repair focus and motion polish | Remove the cross-page title morph responsible for the observed brief overlap. Retain subtle local effects only where they leave text readable. Move fragment focus to a relevant heading or compact target instead of outlining the entire project collection. | No overlapping title during navigation in the reviewed browsers. Keyboard focus stays visible and localized. Reduced-motion mode has no title travel or animated disclosure transition. |

**Visual review:** Compare the hero, ProPoint, Westinghouse, research rows, and supporting entries at 375px and 1280px. Inspect spacing at actual display size, not only in a reduced full-page screenshot. Record collapsed page height against the approximately 5,850px phone baseline as a diagnostic; do not shorten the page by hiding essential contribution statements or shrinking text.

**Primary files:** `work.md`, `index.md`, `_includes/project-card.html`, `_includes/gallery-grid.html`, `_includes/gallery-image.html`, `_work/`, `_data/gallery.json`, `assets/portfolio/selected-work.css`. Introduce a scoped project-gallery include if needed. Change `assets/site.css` only where shared rules require it.

## Sprint 2 — Browse readable images without leaving the project

**Reader outcome:** Open an image, inspect related images, and return to the exact starting point with mouse, touch, or keyboard.

| Story | Implementation | Acceptance |
| --- | --- | --- |
| S2.1 Add an accessible viewer | Enhance original-image anchors with a native modal dialog. Provide a project title, useful caption, image counter, Previous/Next, Close, and “Open original.” Group navigation by project, using the inventory order and including Bayer’s detail views. | Opening an image preserves the underlying page. Previous/Next stay in the current project, announce the new image and count, and disable at the endpoints. Images fit the viewport without distortion. |
| S2.2 Complete input and return behavior | Support Escape to close, Left/Right navigation, trapped modal focus and inactive background content. Use at least 44px control targets. Preserve scroll and disclosure state and restore focus to the activating image link. Keep Close fixed and available on a phone. | Keyboard users can complete the entire flow. Closing returns to the same image trigger and page position. The first/last image, image-load failure, repeated opening, and resizing do not strand focus or hide Close. |
| S2.3 Preserve browser behavior and fallbacks | Keep real image URLs in the anchors. Intercept only unmodified primary activation when the viewer is available. Keep modified clicks and “Open original” native. With JavaScript disabled or unsupported dialog behavior, use the current original-image/Back flow. Do not add an image entry to browser history for every Next action. | No-script browsing reaches every original. Modified clicks still open the original as expected. Existing Back restoration works for the fallback. Browser Back while the dialog is open performs normal page navigation without a stale overlay on return. |
| S2.4 Improve weak previews and interaction cues | Frame the existing chess image around the relevant board using a non-destructive presentation treatment; preserve the original frame for inspection and its attribution in text. Make the Node-IPC report preview a clearly labeled report link and the chess preview a presentation link with a play cue. Keep magnification cues exclusive to image-viewer triggers. | Report and chess previews have purposeful actions. Readers can distinguish a play control, a report link, and image enlargement. Cropping does not remove information necessary to support a claim. |

Use a small dependency-free module. Build viewer membership from explicit project/image metadata rather than every image on the page. Initialize only on pages that opt in. Apply the viewer to Selected Work and its relevant case-study image collections; keep Experience behavior unchanged unless a shared include requires a compatible adjustment. Do not preload all full-resolution images.

Retain or refactor `assets/portfolio/gallery-return.js` for the native fallback. Avoid competing click handlers: the return-state handler must skip an activation already handled by the viewer. Review `_layouts/case-study.html` and script loading/allowlisting in `scripts/check_site.py` when adding the module.

## Sprint 3 — Refocus the content and verify the complete journey

**Reader outcome:** Understand the scope of each project and Aaron’s contribution before choosing how deeply to inspect its supporting material.

| Story | Implementation | Acceptance |
| --- | --- | --- |
| S3.1 Rebalance the TBS case | Preserve the approved landing-page introduction. Structure the case around the scientific task, co-authorship and ongoing contribution, what agents reconstruct, and the available task/recording evidence. Move grader mechanics into a secondary technical disclosure or appendix. | The opening case content explains the research task and Aaron’s contribution. Grader details remain available through the existing `#checking-the-grader` link, which opens or visibly reaches the relevant content. Do not imply that merged work proves model performance or that Version 1 has already released. |
| S3.2 Present the chess benchmark’s purpose | Lead with a qualitative benchmark of AI-assisted software development: the video deliverable, review dimensions supported by the existing material, and Aaron’s role. Present board orientation and the early answer reveal as examples. Keep proposed regression tests explicitly identified as proposals. | A reader understands what was evaluated before reading the anecdote. The case, landing summary, preview caption, title and share metadata agree. Preserve existing timestamps, source links, and inbound links to the observation. No unsupported ranking or numerical comparison. |
| S3.3 Align the supporting narratives | Check ProPoint’s software ownership and scale across its entry, image captions and case. Check Westinghouse’s full QA scope across its entry, visual and case. Keep Node-IPC’s exact approved summary and both videos. Remove redundant prose left by gallery consolidation. | Each main project answers what the work was, what Aaron did, and what evidence is available. The one-cent story and search-performance result support their broader projects. No duplicate or conflicting descriptions remain in the changed surfaces. |
| S3.4 Complete the reader walkthrough | Repeat the recruiter, engineering-manager and phone-user tasks below on the release candidate. Review the full page and affected case destinations, then verify the deployed increment using the existing release workflow. | All functional acceptance criteria pass; the visual review is recorded separately from automated checks. Remaining uncertainty about reader comprehension is recorded as a real-user-study question, not reported as a measured success. |

**Primary content files:** `work/scientific-ai-benchmark.md`, `work/chess-puzzle-qa.md`, `work/westinghouse-performance.md`, `work/from-booking-to-checkout.md`, relevant `_work/` records, `_data/gallery.json`, and associated preview metadata. Update publication labels only where a changed case title would otherwise create a mismatch.

## Compatibility and validation

### Preserve existing destinations

| Existing destination | Treatment |
| --- | --- |
| `/work/`, `#selected-work`, `#case-studies-title` | Preserve the directory and featured research entry points. |
| `#project-summaries` | Preserve as a compact legacy target at the first supporting project; new homepage navigation uses `/work/`. |
| `#propoint`, `#westinghouse`, `#node-ipc`, `#chess-benchmarks`, `#indiana`, `#bayer`, `#eli-lilly` | Preserve project destinations and case-return behavior. |
| `#commondevops` | Keep the legacy destination at the research-project group. |
| All five `#gallery-*` destinations | Move each ID with its corresponding project collection; an incoming link reveals the collection when required. Keep usable no-script targets. |
| `#portfolio-gallery`, `#gallery-title` | Keep compact compatibility targets at the first integrated image collection. Do not recreate a duplicate Gallery section or navigation bar. |
| Existing image/disclosure IDs | Preserve where practical; update internal references and restoration behavior together when a change is necessary. |
| `#checking-the-grader` and chess observation fragments | Preserve the relevant detail destination, including disclosure opening when applicable. |
| Eight case-study URLs and 26 original image URLs | Keep working without redirects to unrelated content or asset replacement. |

### Update checks with the behavior they cover

- Update `scripts/check_case_studies.cjs` alongside each sprint. Its current assertions enforce the old homepage fragment, standalone gallery structure, five visible gallery covers, and same-tab original-image navigation. Replace those expectations with project placement, complete image reachability, the viewer flow, and fallback behavior.
- Reuse the existing build, link/metadata checks, Chromium checks, and WebKit coverage. Add targeted assertions for modal keyboard behavior, correct grouping, first/last images, Close restoration, legacy anchors, and no-script access. Do not add tests that simply repeat copy strings unless the wording is an explicit user requirement.
- Review default desktop and phone sizes, narrow 320px reflow with 200% text, keyboard navigation, reduced motion, and one failed image load. Check that image dimensions reserve space and that the viewer does not request the full archive on page load.
- Smoke-check affected Experience galleries and case-study images because they share the inventory and includes. Run the existing publication checks only when publication markup or metadata changes.

### Reader tasks for the final review

1. Enter from the homepage and identify Aaron’s latest project and co-author.
2. Find the software used by around 30,000 salons, open its screenshots, move between images, and return to the project.
3. Explain the scope of the Westinghouse engagement beyond the 3× performance result.
4. Open the Node-IPC case, distinguish it from the published report, and locate each interview.
5. Explain what the chess benchmark evaluates and reach its presentation.
6. Reach a relocated image collection through an old bookmark and complete the same task without JavaScript.
7. From a case, return to the relevant project and reach the existing contact choices.

Use these tasks for a future small study with actual readers as well. Record completion, hesitation, wrong destinations, and comprehension in their own words; do not invent success rates from the simulated review.

## Issue coverage and delivery order

| Review finding | Planned resolution |
| --- | --- |
| Homepage entry bypasses TBS | S1.1 |
| Repeated Gallery and excessive traversal | S1.2, S3.3 |
| Raw-image navigation lacks viewer controls | S2.1–S2.3 |
| Inconsistent visual hierarchy | S1.3 |
| Weak or unreadable evidence images | S1.4, S2.4 |
| Unbalanced desktop columns | S1.3 |
| Inconsistent links and unclear destinations | S1.5, S2.4 |
| Narrow anecdotes outweigh project scope | S3.1–S3.3 |
| Brief title overlap during navigation | S1.6 |
| Oversized focus outline around project collection | S1.6 |

Release Sprint 1 before building the viewer against the new markup. Release Sprint 2 before the final combined journey review. Content drafting for Sprint 3 can begin after the Sprint 1 structure is settled. Keep each sprint in a separate pull request with its own preview, targeted validation and production verification; do not accumulate all three into a single unreviewable change.

The MVP is complete when every finding above has a verified resolution, the approved content and all original assets remain available, desktop and phone visual reviews pass, and the deployed journeys match the reviewed implementation. A real participant study remains separate follow-up validation.
