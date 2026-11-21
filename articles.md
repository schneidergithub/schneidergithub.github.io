---
title: Articles & Demos
description: Selected CommonDevOps articles, research, interviews, and videos covering AI, software engineering, and cybersecurity.
permalink: /articles/
groups:
  - id: recordings
    label: Recordings
    type: Video
  - id: monthly-reviews
    label: Monthly reviews
    type: Article
  - id: investigations
    label: Investigations
    type: Research report
---
<header class="page-intro">
  <h1>Articles &amp; Demos</h1>
  <p class="lead">Research presentations, incident investigations, and monthly reporting on AI and software delivery.</p>
  <nav class="publication-jumps section-jumps" aria-label="Publication formats">
    {% for group in page.groups %}
      {% assign members = site.data.publications | where: 'type', group.type %}
      <a href="#{{ group.id }}">{{ group.label }} <span class="count">{{ members.size }}</span></a>
    {% endfor %}
  </nav>
</header>
{% for group in page.groups %}
{% assign members = site.data.publications | where: 'type', group.type %}
<section class="publication-group" aria-labelledby="{{ group.id }}">
<h2 id="{{ group.id }}" tabindex="-1">{{ group.label }}</h2>
<ul class="publication-list">
{% for item in members %}
  <li class="publication" id="{{ item.id | escape }}" tabindex="-1">
    <div class="meta">
      {% include publication-media.html publication=item link_cover=true play_label="Play" %}
      <span class="type">{{ item.type | escape }}</span>
      {% if item.period %}<span>{{ item.period | escape }} issue</span>{% endif %}
      {% if item.date %}<span>Published <time datetime="{{ item.date }}">{{ item.date | date: '%B %-d, %Y' }}</time></span>{% endif %}
    </div>
    <article>
      <h3><a href="{{ item.url | escape }}">{{ item.title | escape }} {% if item.type == 'Video' %}<span class="publication-source-label">YouTube&nbsp;<span aria-hidden="true">↗</span></span>{% else %}<span aria-hidden="true">↗</span>{% endif %}</a></h3>
      <p>{{ item.description | escape }}</p>
      <p class="attribution">{{ item.attribution | escape }}</p>
      <p class="publication-actions">
        {% if item.related %}<a class="publication-related" href="{{ item.related.url | escape }}">{{ item.related.label | escape }}&nbsp;<span aria-hidden="true">↗</span></a>{% endif %}
        {% if item.companion %}<a class="publication-context" href="#{{ item.companion.id | escape }}">{{ item.companion.label | escape }}</a>{% endif %}
        <a class="entry-permalink" href="#{{ item.id | escape }}">Link to entry<span class="visually-hidden"> — {{ item.title | escape }}</span></a>
      </p>
    </article>
  </li>
{% endfor %}
</ul>
</section>
{% endfor %}
<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
