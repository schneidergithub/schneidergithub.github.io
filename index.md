---
title: Software engineering, DevSecOps & AI Research
description: Aaron Schneider builds software, automates delivery, and improves system reliability. Explore 25+ years of engineering work and current AI research.
permalink: /
contact_footer: true
---
<section class="hero">
  <div>
    <h1>Building software. <span class="hero-signature">A systematic approach.</span></h1>
    <div class="actions"><a class="button" href="{{ '/work/' | relative_url }}">Explore selected work</a><a class="button secondary" href="{{ '/experience/' | relative_url }}">View experience</a></div>
  </div>
  <aside class="focus-panel" aria-labelledby="focus-title">
    <h2 id="focus-title">Terminal-Bench-Science</h2>
    {% assign benchmark = site.data.publications | where: 'id', 'benchmark-presentation' | first %}
    <div class="focus-media">{% include publication-media.html publication=benchmark eager=true spotlight=true %}</div>
    <p>The benchmark evaluates AI agents on scientific workflows. Dr. Ian Miller and I co-authored the approved “MDD Executive Function” task. I’m now a project maintainer and reviewer. A paper on our ongoing work is coming soon.</p>
  </aside>
</section>

<section class="section selected-results" aria-labelledby="selected-title">
  <div class="section-heading">
    <h2 id="selected-title">Selected <em>work</em></h2>
    <a href="{{ '/work/' | relative_url }}#project-summaries">Browse project summaries</a>
  </div>
  <div class="feature-grid">
    {% assign projects = site.work | where: 'featured', true | sort: 'order' %}
    {% for project in projects %}
    {% assign highlight = project.home_highlight %}
    {% assign studies = site.pages | where: 'layout', 'case-study' | where: 'project', project.slug %}
    {% assign gallery = site.data.gallery | where: 'id', project.slug | first %}
    {% assign cover_image = highlight.cover_image %}
    {% if studies.size == 1 %}{% assign cover_image = cover_image | default: studies.first.figures.first.image %}{% endif %}
    {% assign cover = gallery.items.first %}
    {% if cover_image %}{% assign cover = gallery.items | where: 'image', cover_image | first | default: cover %}{% endif %}
    {% assign heading = highlight.value | append: ' ' | append: highlight.label | strip %}
    {% if highlight.value and studies.size == 1 %}{% assign heading = studies.first.title %}{% endif %}
    <article class="feature">
      {% if cover.thumbnail %}
        <div class="feature-cover"><img src="{{ cover.thumbnail | relative_url }}?v={{ cover.thumbnail_version | escape }}" alt="{{ cover.alt | escape }}" width="{{ cover.width }}" height="{{ cover.height }}" loading="lazy" decoding="async"></div>
      {% else %}
        <div class="feature-cover feature-cover-archive" aria-hidden="true"><span class="archive-folder"></span></div>
      {% endif %}
      <p class="eyebrow">{{ highlight.organization | escape }}</p>
      <h3 class="feature-result">
        <a href="{% if studies.size == 1 %}{{ studies.first.url | relative_url }}{% else %}{{ '/work/' | relative_url }}#{{ project.slug | escape }}{% endif %}">
          {{ heading | escape }}
        </a>
      </h3>
      <p class="feature-summary">{{ highlight.description | escape }}</p>
    </article>
    {% endfor %}
  </div>
</section>

<section class="section" id="home-media" aria-labelledby="writing-title">
  <h2 class="collection-heading" id="writing-title"><a href="{{ '/articles/' | relative_url }}">Articles &amp; <span>Demos</span></a></h2>
  <div class="media-grid">
    {% assign latest_issue = site.data.publications | where_exp: 'item', 'item.issue_month' | sort: 'issue_month' | reverse | slice: 0, 1 %}
    {% assign selections = site.data.publications | where: 'home_featured', true %}
    {% assign featured_media = latest_issue | concat: selections %}
    {% for item in featured_media %}
    <article class="media-card">
      {% if item.type == 'Video' %}
      <div class="media-art">{% include publication-media.html publication=item defer_source=true %}</div>
      <div class="media-copy">
        <h3>{{ item.title | escape }}</h3>
      </div>
      {% else %}
      {% assign story_url = item.url %}
      {% assign first_character = story_url | slice: 0, 1 %}
      {% if first_character == '/' %}{% assign story_url = item.url | relative_url %}{% endif %}
      <a class="media-story" href="{{ story_url | escape }}" aria-labelledby="home-{{ item.id | escape }}">
        <div class="media-art{% if item.id == 'fresh-sandbox-github' %} essay-board{% endif %}">{% include publication-media.html publication=item %}</div>
        <div class="media-copy">
          <p class="media-type">{% if item.issue_month %}{{ item.issue_month | append: '-01' | date: '%B %Y' }} · LinkedIn newsletter{% else %}{{ item.type | escape }}{% endif %}</p>
          <h3 id="home-{{ item.id | escape }}">{{ item.title | escape }}</h3>
        </div>
      </a>
      {% endif %}
      <p class="media-description">{{ item.home_summary | default: item.description | escape }}</p>
      {% if item.type == 'Video' %}{% include recording-source.html publication=item %}{% endif %}
      {% if item.issue_month %}<a class="newsletter-archive-link" href="{{ '/articles/' | relative_url }}#monthly-reviews">Newsletter archive</a>{% endif %}
    </article>
    {% endfor %}
  </div>
</section>

<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
