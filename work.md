---
title: Selected Work
description: Aaron Schneider’s work on Terminal-Bench-Science, salon booking and checkout software, and enterprise search performance.
permalink: /work/
work_design: true
lead_case: /work/scientific-ai-benchmark/
---
{% assign all_studies = site.pages | where: 'layout', 'case-study' %}
{% assign benchmark = all_studies | where: 'url', page.lead_case | first %}
<header class="work-mast">
  <h1>Selected work</h1>
  <nav aria-label="Selected work sections">
    <a href="#project-summaries">Projects</a>
    <a href="#portfolio-gallery">Gallery</a>
  </nav>
</header>

<section class="benchmark-feature" aria-labelledby="case-studies-title">
  <div>
    <p class="work-kicker">Terminal-Bench-Science</p>
    <h2 id="case-studies-title" tabindex="-1">{{ benchmark.title | escape }}</h2>
    <p class="benchmark-byline">Dr. Ian Miller and I co-authored a task that asks AI agents to reconstruct results from published studies. Today I help maintain the benchmark, review infrastructure changes and analyze trial results.</p>
    <div class="benchmark-actions">
      <a class="work-primary" href="{{ benchmark.url | relative_url }}">Read the case study</a>
      <a href="{{ benchmark.url | relative_url }}#checking-the-grader">How we checked the grader</a>
    </div>
  </div>
  <aside class="grader-panel" aria-labelledby="grader-panel-title">
    <p class="work-kicker">MDD Executive Function</p>
    <h3 id="grader-panel-title">Inside the grader</h3>
    <dl>
      <dt><code>required.csv</code></dt>
      <dd>One row per required comparison.</dd>
      <dt><code>optional.csv</code></dt>
      <dd>Additional comparisons the grader accepts.</dd>
    </dl>
  </aside>
</section>

<section class="work-projects" aria-labelledby="project-summaries">
  <h2 id="project-summaries" tabindex="-1">Project summaries</h2>
  <div class="work-index">
    {% assign projects = site.work | sort: 'index_order' %}
    {% for project in projects %}
      {% include project-card.html %}
    {% endfor %}
  </div>
  <a class="work-contact" href="{{ '/#connect' | relative_url }}">Discuss a project</a>
</section>

<section class="section portfolio-gallery" aria-labelledby="portfolio-gallery">
  <h2 id="portfolio-gallery" tabindex="-1"><span id="gallery-title">Gallery</span></h2>
  <nav class="gallery-jumps" aria-label="Portfolio image groups">
    {% for group in site.data.gallery %}
      {% assign examples = group.items | where_exp: 'image', 'image.detail_of == nil' %}
      {% assign detail_count = group.items.size | minus: examples.size %}
      <a href="#gallery-{{ group.id }}">{{ group.title | escape }} <span class="count">{% if detail_count > 0 %}{{ examples.size }} examples · {{ detail_count }} detail views{% else %}{{ examples.size }}{% endif %}</span></a>
    {% endfor %}
  </nav>
  {% for group in site.data.gallery %}
  <section class="gallery-group" id="gallery-{{ group.id }}" aria-labelledby="gallery-{{ group.id }}-title">
    <div class="gallery-heading">
      <h3 id="gallery-{{ group.id }}-title">{{ group.title | escape }}</h3>
      <p>{{ group.description | escape }}</p>
      <p class="case-link">
        {% if group.related %}<a href="{{ group.related.url | relative_url | escape }}">{{ group.related.label | escape }}</a>
        {% else %}<a href="{{ '/experience/' | relative_url }}#{{ group.role_id | escape }}">My role at {{ group.title | escape }}</a>{% endif %}
      </p>
    </div>
    {% assign examples = group.items | where_exp: 'image', 'image.detail_of == nil' %}
    {% assign detail_count = group.items.size | minus: examples.size %}
    {% assign cover = examples | first %}
    {% include gallery-image.html item=cover cover=true %}
    {% if examples.size > 1 %}
    <details class="gallery-disclosure" id="images-{{ group.id }}">
      <summary><span class="gallery-expand">{% if detail_count > 0 %}Browse all {{ examples.size }} examples and {{ detail_count }} detail views{% else %}View all {{ examples.size }} images{% endif %}</span><span class="gallery-collapse">Show fewer images</span><span class="visually-hidden"> from {{ group.title | escape }}</span></summary>
      {% include gallery-grid.html group=group items=examples offset=1 %}
    </details>
    {% endif %}
  </section>
  {% endfor %}
</section>
<script src="{{ '/assets/portfolio/gallery-return.js' | relative_url }}" defer></script>
