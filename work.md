---
title: Selected Work
description: Project summaries and a visual portfolio of Aaron Schneider's work in enterprise automation, AI, point-of-sale products, and web and mobile engineering.
permalink: /work/
---
<header class="page-intro work-intro">
  <h1>Selected work</h1>
  <p class="lead">I test software releases, automate delivery, and help benchmark AI agents on scientific work.</p>
  <nav class="section-jumps work-jumps" aria-label="Selected work sections">
    <a href="#case-studies-title">Case studies</a>
    <a href="#project-summaries">Project summaries</a>
    <a href="#portfolio-gallery">Gallery</a>
  </nav>
</header>

<nav class="study-directory" aria-labelledby="case-studies-title">
  <h2 id="case-studies-title" tabindex="-1">Case studies</h2>
  <ul>
    {% assign studies = site.pages | where: 'layout', 'case-study' | sort_natural: 'link_label' %}
    {% for study in studies %}<li><a href="{{ study.url | relative_url }}">{{ study.link_label | default: study.title | escape }}</a></li>{% endfor %}
  </ul>
</nav>

<p class="work-leadership"><a href="{{ '/experience/' | relative_url }}#engineering-leadership">Engineering leadership</a></p>

<section class="work-projects" aria-labelledby="project-summaries">
  <h2 id="project-summaries" tabindex="-1">Project summaries</h2>
  <div class="project-grid">
    {% assign projects = site.work | sort: 'order' %}
    {% for project in projects %}{% include project-card.html %}{% endfor %}
  </div>
</section>

<section class="section portfolio-gallery" aria-labelledby="portfolio-gallery">
  <h2 id="portfolio-gallery" tabindex="-1"><span id="gallery-title">Gallery</span></h2>
  <nav class="gallery-jumps" aria-label="Portfolio image groups">
    {% for group in site.data.gallery %}<a href="#gallery-{{ group.id }}">{{ group.title | escape }} <span class="count">{{ group.items.size }}</span></a>{% endfor %}
  </nav>
  {% for group in site.data.gallery %}
  <section class="gallery-group" id="gallery-{{ group.id }}" aria-labelledby="gallery-{{ group.id }}-title">
    <div class="gallery-heading">
      <h3 id="gallery-{{ group.id }}-title">{{ group.title | escape }}</h3>
      <p>{{ group.description | escape }}</p>
      {% if group.related %}<p class="case-link"><a href="{{ group.related.url | relative_url | escape }}">{{ group.related.label | escape }}</a></p>{% endif %}
    </div>
    {% assign cover = group.items | first %}
    {% include gallery-image.html item=cover %}
    {% if group.items.size > 1 %}
    <details class="gallery-disclosure">
      <summary><span class="gallery-expand">View all {{ group.items.size }} images</span><span class="gallery-collapse">Show fewer images</span><span class="visually-hidden"> from {{ group.title | escape }}</span></summary>
      <div class="thumbnail-grid">
        {% for item in group.items offset:1 %}{% include gallery-image.html item=item %}{% endfor %}
      </div>
    </details>
    {% endif %}
  </section>
  {% endfor %}
</section>
