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
    <h2 id="selected-title">Selected work</h2>
    <a href="{{ '/work/' | relative_url }}#project-summaries">Browse project summaries</a>
  </div>
  <div class="feature-grid">
    {% assign projects = site.work | where: 'featured', true | sort: 'order' %}
    {% for project in projects %}
    {% assign highlight = project.home_highlight %}
    {% assign studies = site.pages | where: 'layout', 'case-study' | where: 'project', project.slug %}
    <article class="feature">
      <p class="eyebrow">{{ highlight.organization | escape }}</p>
      <h3 class="feature-result{% unless highlight.value %} result-statement{% endunless %}">
        <a class="result-link" href="{% if studies.size == 1 %}{{ studies.first.url | relative_url }}{% else %}{{ '/work/' | relative_url }}#{{ project.slug | escape }}{% endif %}">
          {% if highlight.value %}<span class="result-value">{{ highlight.value | escape }}</span> <span class="result-label">{{ highlight.label | escape }}</span>{% else %}{{ highlight.label | escape }}{% endif %}
        </a>
      </h3>
      <p>{{ highlight.description | escape }}</p>
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
      <div class="media-art">{% include publication-media.html publication=item %}</div>
      <div class="media-copy">
        <h3>{{ item.title | escape }}</h3>
      </div>
      {% else %}
      <a class="media-story" href="{{ item.url | escape }}" aria-labelledby="home-{{ item.id | escape }}">
        <div class="media-art">{% include publication-media.html publication=item %}</div>
        <div class="media-copy">
          <p class="media-type">{% if item.issue_month %}{{ item.issue_month | append: '-01' | date: '%B %Y' }} · LinkedIn newsletter{% else %}{{ item.type | escape }}{% endif %}</p>
          <h3 id="home-{{ item.id | escape }}">{{ item.title | escape }}</h3>
        </div>
      </a>
      {% endif %}
      <p class="media-description">{{ item.home_summary | default: item.description | escape }}</p>
      {% if item.issue_month %}<a class="newsletter-archive-link" href="{{ '/articles/' | relative_url }}#monthly-reviews">Newsletter archive</a>{% endif %}
    </article>
    {% endfor %}
  </div>
</section>

<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
