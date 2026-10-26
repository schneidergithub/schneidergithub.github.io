---
title: Selected Work
description: Project summaries and a visual portfolio of Aaron Schneider's work in enterprise automation, AI, point-of-sale products, and web and mobile engineering.
permalink: /work/
---
<header class="page-intro"><p class="eyebrow">Projects & contributions</p><h1>Selected work</h1><p class="lead">A selection of work across software delivery, security, testing, and product engineering. Explore the project summaries or browse the visual portfolio below.</p><nav class="section-jumps" aria-label="Selected work sections"><a href="#project-summaries">Project summaries</a><a href="#portfolio-gallery">Portfolio gallery <span class="count">26 images</span></a></nav></header>
<section aria-label="Project summaries" id="project-summaries"><div class="project-grid">{% assign projects = site.work | sort: 'order' %}{% for project in projects %}{% include project-card.html %}{% endfor %}</div></section>

<section class="section portfolio-gallery" id="portfolio-gallery" aria-labelledby="gallery-title">
  <p class="eyebrow">A visual portfolio</p>
  <h2 id="gallery-title">Websites, products & interfaces</h2>
  <p class="lead">Screenshots and visuals from projects across my career. Select any thumbnail to open the larger image in a new tab.</p>
  <nav class="gallery-jumps" aria-label="Portfolio image groups">{% for group in site.data.gallery %}<a href="#gallery-{{ group.id }}">{{ group.title | escape }} <span class="count">{{ group.items.size }}</span></a>{% endfor %}</nav>
  {% for group in site.data.gallery %}
  <section class="gallery-group" id="gallery-{{ group.id }}" aria-labelledby="gallery-{{ group.id }}-title">
    <div class="gallery-heading"><h3 id="gallery-{{ group.id }}-title">{{ group.title | escape }}</h3><p>{{ group.description | escape }}</p></div>
    <div class="thumbnail-grid">{% for item in group.items %}
      <figure class="thumbnail-card">
        <a href="{{ item.image | relative_url }}" target="_blank" rel="noopener" aria-label="Open {{ item.title | escape }} image in a new tab"><span class="thumbnail-frame"><img src="{{ item.thumbnail | relative_url }}?v={{ item.thumbnail_version }}" alt="{{ item.alt | escape }}" width="{{ item.width }}" height="{{ item.height }}" loading="lazy" decoding="async"></span><span class="thumbnail-label">{{ item.title | escape }} <span aria-hidden="true">↗</span></span></a>
      </figure>
    {% endfor %}</div>
  </section>
  {% endfor %}
</section>
