---
title: Articles & Demos
description: Selected CommonDevOps articles, research, interviews, and videos covering AI, software engineering, and cybersecurity.
permalink: /articles/
---
<header class="page-intro">
  <h1>Articles &amp; Demos</h1>
  <p class="lead">Research presentations, incident investigations, and monthly reporting on AI and software delivery.</p>
</header>
<ul class="publication-list">
{% for item in site.data.publications %}
  <li class="publication"{% if item.id %} id="{{ item.id | escape }}"{% endif %}>
    <div class="meta">
      {% include publication-media.html publication=item link_cover=true %}
      <span class="type">{{ item.type | escape }}</span>
      {% if item.date %}<time datetime="{{ item.date }}">{{ item.date | date: '%B %-d, %Y' }}</time>{% elsif item.period %}<span>{{ item.period | escape }}</span>{% endif %}
    </div>
    <article>
      <h2><a href="{{ item.url | escape }}">{{ item.title | escape }} <span aria-hidden="true">↗</span></a></h2>
      <p>{{ item.description | escape }}</p>
      <p class="attribution">{{ item.attribution | escape }}</p>
      {% if item.related %}<a class="publication-related" href="{{ item.related.url | escape }}">{{ item.related.label | escape }} <span aria-hidden="true">↗</span></a>{% endif %}
    </article>
  </li>
{% endfor %}
</ul>
<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
