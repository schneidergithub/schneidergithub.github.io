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
  <h1 id="selected-work" tabindex="-1">Selected work</h1>
</header>

<section class="benchmark-feature" aria-labelledby="case-studies-title">
  <div>
    <p class="work-kicker">Terminal-Bench-Science</p>
    <h2 id="case-studies-title" tabindex="-1">{{ benchmark.title | escape }}</h2>
    <p class="benchmark-byline">Terminal-Bench-Science is the latest benchmark project used to test frontier AI agents on real scientific work. Version 1 and associated research paper will include “MDD Executive Function,” the task Dr. Ian Miller and I co-authored.</p>
    <div class="benchmark-actions">
      <a class="work-primary" href="{{ benchmark.url | relative_url }}">Explore the research task</a>
      <a href="{{ benchmark.contribution_url | escape }}">View the merged task</a>
    </div>
  </div>
  <figure class="research-process" aria-labelledby="research-process-title">
    <figcaption id="research-process-title">From papers to effect sizes</figcaption>
    <ol>
      <li><strong>Published studies</strong><span>Find comparisons that answer the research question.</span></li>
      <li><strong>Study results</strong><span>Extract the numbers reported for each group.</span></li>
      <li><strong>Comparable effects</strong><span>Calculate an effect size for each comparison.</span></li>
    </ol>
  </figure>
</section>

{% assign projects = site.work | sort: 'index_order' %}
<div class="work-projects">
  <section class="work-index" id="project-summaries" aria-label="Featured projects" tabindex="-1">
    {% for project in projects %}{% if project.index_feature %}{% include project-card.html heading="h2" %}{% endif %}{% endfor %}
  </section>
  <div class="work-research-list" id="commondevops" tabindex="-1">
    {% for project in projects %}
      {% if project.research_publication %}
        {% assign publication = site.data.publications | where: 'id', project.research_publication | first %}
        <section class="research-project" id="{{ project.slug }}" tabindex="-1" aria-labelledby="{{ project.slug }}-title">
          <div>
            <p class="work-kicker">{{ project.context | escape }}</p>
            <h2 id="{{ project.slug }}-title">{{ project.title | escape }}</h2>
            {{ project.content }}
            <div class="work-links">
              <a href="{{ publication.case_url | relative_url }}">{{ project.case_label | escape }}</a>
              <a href="{{ project.source_url | relative_url }}">{{ project.source_label | escape }}</a>
              {% for video in project.videos %}
                {% assign recording = site.data.publications | where: 'id', video.id | first %}
                <a href="{{ recording.url | escape }}">{{ video.label | escape }}</a>
              {% endfor %}
            </div>
          </div>
          <img src="{{ publication.preview.src | relative_url }}" alt="{{ publication.preview.alt | escape }}" width="{{ publication.preview.width }}" height="{{ publication.preview.height }}" loading="lazy" decoding="async">
        </section>
      {% endif %}
    {% endfor %}
  </div>
  <section aria-labelledby="more-projects-title">
    <h2 class="work-section-label" id="more-projects-title">More projects</h2>
    <div class="work-index">
      {% for project in projects %}{% unless project.index_feature or project.research_publication %}{% include project-card.html %}{% endunless %}{% endfor %}
    </div>
  </section>
  <a class="work-contact" href="{{ '/#connect' | relative_url }}">Discuss a project</a>
</div>

<section class="section portfolio-gallery" aria-labelledby="portfolio-gallery">
  <h2 id="portfolio-gallery" tabindex="-1"><span id="gallery-title">Gallery</span></h2>
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
