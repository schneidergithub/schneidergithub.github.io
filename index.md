---
title: Software engineering, DevSecOps & AI Research
description: Aaron Schneider builds software, automates delivery, and improves system reliability. Explore 25+ years of engineering work and current AI research.
permalink: /
---
<section class="hero">
  <div>
    <p class="eyebrow">Software Engineer · DevSecOps · AI&nbsp;Research</p>
    <h1>Building software. <span class="hero-signature">A systematic approach.</span></h1>
    <div class="actions"><a class="button" href="{{ '/work/' | relative_url }}">Explore selected work</a><a class="button secondary" href="{{ '/experience/' | relative_url }}">View experience</a></div>
    <a class="hero-case-link" href="{{ '/work/westinghouse-performance/' | relative_url }}">Westinghouse · 3× Elasticsearch throughput</a>
  </div>
  <aside class="focus-panel" aria-labelledby="focus-title">
    <p class="eyebrow">Terminal-Bench-Science</p>
    <h2 id="focus-title">Can an AI agent reproduce a scientific result?</h2>
    {% assign benchmark = site.data.publications | where: 'id', 'benchmark-presentation' | first %}
    <div class="focus-media">{% include publication-media.html publication=benchmark play_label="Play presentation" eager=true %}</div>
    <p>Dr. Ian Miller and I co-authored “MDD Executive Function,” a task that asks AI agents to reconstruct a meta-analysis from published studies of depression. I also review DevOps and infrastructure changes and analyze trial results.</p>
    <a href="{{ '/articles/' | relative_url }}#benchmark-presentation">Explore the presentation and task <span aria-hidden="true">→</span></a>
  </aside>
</section>

<section class="section" id="home-media" aria-labelledby="writing-title">
  <div class="section-heading">
    <h2 id="writing-title">Articles &amp; Demos</h2>
    <a href="{{ '/articles/' | relative_url }}">View all {{ site.data.publications.size }} publications</a>
  </div>
  <div class="media-grid">
    {% assign featured_media = site.data.publications | where: 'home_featured', true %}
    {% for item in featured_media %}
    <article class="media-card">
      {% if item.type == 'Video' %}
      <div class="media-art">{% include publication-media.html publication=item play_label="Play video" %}</div>
      <div class="media-copy">
        <p class="media-type">{{ item.type | escape }} · YouTube</p>
        <h3><a href="{{ item.url | escape }}">{{ item.title | escape }}&nbsp;<span aria-hidden="true">↗</span><span class="visually-hidden"> on YouTube</span></a></h3>
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
</section>

<section class="section selected-results" aria-labelledby="selected-title">
  <div class="section-heading">
    <h2 id="selected-title">Selected work</h2>
    <a href="{{ '/work/' | relative_url }}">View all projects</a>
  </div>
  <div class="feature-grid">
    {% assign projects = site.work | where: 'featured', true | sort: 'order' %}
    {% for project in projects %}
    {% assign highlight = project.home_highlight %}
    {% assign study = site.pages | where: 'layout', 'case-study' | where: 'project', project.slug | first %}
    <article class="feature">
      <p class="eyebrow">{{ highlight.organization | escape }}</p>
      {% if highlight.value %}
      <h3 class="feature-result"><span class="result-value">{{ highlight.value | escape }}</span> <span class="result-label">{{ highlight.label | escape }}</span></h3>
      {% else %}
      <h3 class="feature-result result-statement">{{ highlight.label | escape }}</h3>
      {% endif %}
      <p>{{ highlight.description | escape }}</p>
      <a href="{% if study %}{{ study.url | relative_url }}{% else %}{{ '/work/' | relative_url }}#{{ project.slug | escape }}{% endif %}">{{ highlight.link_label | escape }}</a>
    </article>
    {% endfor %}
  </div>
</section>

<section class="section" id="connect" aria-labelledby="connect-title">
  <h2 id="connect-title">Work with me</h2>
  <p>For engineering roles or individual consulting, contact me directly. For team engagements, reach out to CommonDevOps.</p>
  <div class="actions">
    <a class="button" href="https://www.linkedin.com/in/aarondrewschneider/">Contact Aaron on LinkedIn</a>
    <a class="button secondary" href="https://www.linkedin.com/company/commondevops/">Contact the CommonDevOps team</a>
  </div>
  <a class="channel-link" href="https://www.youtube.com/@commondevops?sub_confirmation=1">Follow CommonDevOps on YouTube</a>
</section>
<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
