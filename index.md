---
title: Software engineering, DevSecOps & AI Research
description: Aaron Schneider builds software, automates delivery, and improves system reliability. Explore 25+ years of engineering work and current AI research.
permalink: /
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
  <div class="section-heading">
    <h2 id="writing-title">Articles &amp; Demos</h2>
    <a href="{{ '/articles/' | relative_url }}">Browse articles &amp; recordings</a>
  </div>
  <div class="media-grid">
    {% assign featured_media = site.data.publications | where: 'home_featured', true %}
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
          <p class="media-type">{{ item.type | escape }}{% if item.period %} · {{ item.period | escape }}{% endif %}</p>
          <h3 id="home-{{ item.id | escape }}">{{ item.title | escape }}</h3>
        </div>
      </a>
      {% endif %}
      <p class="media-description">{{ item.home_summary | escape }}</p>
    </article>
    {% endfor %}
  </div>
  <a class="channel-link" href="https://www.youtube.com/@commondevops?sub_confirmation=1">Subscribe on YouTube</a>
</section>

<section class="section contact-card" id="connect" aria-labelledby="connect-title">
  <h2 id="connect-title">Work with me</h2>
  <dl class="contact-routes">
    <div class="contact-route">
      <dt>Engineering roles &amp; individual consulting</dt>
      <dd><a href="https://www.linkedin.com/in/aarondrewschneider/">Aaron Schneider on LinkedIn</a></dd>
    </div>
    <div class="contact-route">
      <dt>Team consulting</dt>
      <dd><a href="https://www.linkedin.com/company/commondevops/">CommonDevOps on LinkedIn</a></dd>
    </div>
  </dl>
</section>
<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
