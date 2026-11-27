---
title: Selected Work
description: Scientific AI benchmarks, salon software for 30,000 salons, enterprise search performance, and case-file archiving across Indiana’s 92 counties.
permalink: /work/
work_design: true
full_width: true
lead_case: /work/scientific-ai-benchmark/
---
{% assign all_studies = site.pages | where: 'layout', 'case-study' %}
{% assign benchmark = all_studies | where: 'url', page.lead_case | first %}
<header class="work-mast wrap">
  <h1 id="selected-work" tabindex="-1">Selected work</h1>
</header>

<section class="benchmark-feature wrap" aria-labelledby="case-studies-title">
  <div>
    <p class="work-kicker">Terminal-Bench-Science</p>
    <h2 id="case-studies-title" tabindex="-1">{{ benchmark.title | escape }}</h2>
  </div>
  <div>
    <p class="benchmark-byline">I co-authored “MDD Executive Function.” To reproduce the published effect sizes, an AI agent must first choose which study results can be compared.</p>
    <div class="benchmark-actions work-links">
      <a href="{{ benchmark.url | relative_url }}">Explore the research task</a>
      <a href="{{ benchmark.contribution_url | escape }}">Merged task on GitHub</a>
    </div>
  </div>
</section>

{% assign projects = site.work | sort: 'index_order' %}
<div class="work-projects">
  <section class="featured-projects wrap" id="project-summaries" tabindex="-1" aria-label="Featured projects">
    {% for project in projects %}{% if project.index_feature %}{% include project-card.html heading="h2" %}{% endif %}{% endfor %}
  </section>
  <section class="work-research-band" aria-label="Research projects">
    <div class="work-research-list wrap" id="commondevops" tabindex="-1">
      {% for project in projects %}
        {% if project.research_publication %}
          {% assign publication = site.data.publications | where: 'id', project.research_publication | first %}
          <section class="research-project" id="{{ project.slug }}" tabindex="-1" aria-labelledby="{{ project.slug }}-title">
            <p class="work-kicker">{{ project.context | escape }}</p>
            <h2 id="{{ project.slug }}-title">{{ project.title | escape }}</h2>
            <div class="project-detail">{{ project.content }}</div>
            <div class="work-links">
              <a href="{{ publication.case_url | relative_url }}">Read the case study<span class="visually-hidden"> about {{ project.title | escape }}</span></a>
            </div>
            <a class="work-evidence-link{% if project.slug == 'chess-benchmarks' %} chess-preview{% endif %}" href="{{ project.source_url | relative_url }}" aria-label="{{ project.source_label | escape }}">
              <span class="work-media-frame"><img src="{{ publication.preview.src | relative_url }}" alt="{{ publication.preview.alt | escape }}" width="{{ publication.preview.width }}" height="{{ publication.preview.height }}" loading="lazy" decoding="async"></span>
              <span>{{ project.source_label | escape }}</span>
            </a>
          </section>
        {% endif %}
      {% endfor %}
    </div>
  </section>
  <section class="wrap" aria-labelledby="more-projects-title">
    <h2 class="work-section-label" id="more-projects-title">More projects</h2>
    <div class="work-index">
      {% for project in projects %}{% unless project.index_feature or project.research_publication %}{% include project-card.html %}{% endunless %}{% endfor %}
    </div>
  </section>
</div>

<script src="{{ '/assets/portfolio/gallery-return.js' | relative_url }}?v=3" defer></script>
{% include image-viewer.html makers_plate=true %}
