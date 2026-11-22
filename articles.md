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
<header class="page-intro publication-intro">
  <h1>Articles &amp; Demos</h1>
  <p class="lead">Talks and field reports on AI, cybersecurity, and software delivery.</p>
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
  {% assign featured = false %}
  {% if group.id == 'recordings' and forloop.first %}{% assign featured = true %}{% endif %}
  <li class="publication{% if featured %} publication-featured{% endif %}" id="{{ item.id | escape }}" tabindex="-1">
    <h3>{% if item.type == 'Video' %}{{ item.title | escape }}{% else %}<a href="{{ item.url | escape }}">{{ item.title | escape }} <span aria-hidden="true">↗</span></a>{% endif %}</h3>
    <div class="meta">
      {% include publication-media.html publication=item link_cover=true eager=featured %}
    </div>
    <div class="publication-copy">
      {% if item.period or item.date %}<p class="publication-date">{% if item.period %}{{ item.period | escape }} issue{% endif %}{% if item.period and item.date %} · {% endif %}{% if item.date %}Published <time datetime="{{ item.date }}">{{ item.date | date: '%B %-d, %Y' }}</time>{% endif %}</p>{% endif %}
      <p>{{ item.description | escape }}{% if item.guide %} <a href="{{ item.guide.url | relative_url | escape }}">{{ item.guide.label | escape }}</a>.{% endif %}</p>
      <p class="attribution">{{ item.attribution | escape }}</p>
      <p class="publication-actions">
        {% if item.related %}<a class="publication-related" href="{{ item.related.url | escape }}">{{ item.related.label | escape }}&nbsp;<span aria-hidden="true">↗</span></a>{% endif %}
        {% if item.case_url %}
          {% assign study = site.pages | where: 'url', item.case_url | first %}
          {% if study %}<a class="publication-case" href="{{ study.url | relative_url }}">Read the case study<span class="visually-hidden"> — {{ study.title | escape }}</span></a>{% endif %}
        {% endif %}
        {% if item.companion %}<a class="publication-context" href="#{{ item.companion.id | escape }}">{{ item.companion.label | escape }}</a>{% endif %}
        <a class="entry-permalink" href="#{{ item.id | escape }}">Permalink<span class="visually-hidden"> — {{ item.title | escape }}</span></a>
      </p>
    </div>
  </li>
{% endfor %}
</ul>
</section>
{% endfor %}
<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
