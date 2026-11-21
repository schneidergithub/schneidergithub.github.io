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
  {% capture thumbnail %}<img class="publication-preview" src="{{ item.preview.src | relative_url | escape }}" alt="{{ item.preview.alt | escape }}" width="{{ item.preview.width }}" height="{{ item.preview.height }}" loading="lazy" decoding="async">{% endcapture %}
  <li class="publication"{% if item.id %} id="{{ item.id | escape }}"{% endif %}>
    <div class="meta">
      {% if item.type == 'Video' %}
      {% assign video_id = item.url | remove: 'https://www.youtube.com/watch?v=' %}
      <details class="publication-video" name="publication-players">
        <summary>
          <span class="video-poster"><span aria-hidden="true">{{ thumbnail }}<span class="play-mark"></span></span><span class="visually-hidden">Play {{ item.title | escape }}</span></span>
          <span class="close-player">Close player<span class="visually-hidden"> for {{ item.title | escape }}</span></span>
        </summary>
        <template><iframe width="640" height="360" src="https://www.youtube-nocookie.com/embed/{{ video_id | escape }}?autoplay=1&amp;playsinline=1" title="{{ item.title | escape }}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></template>
        <noscript><a href="{{ item.url | escape }}">Watch on YouTube</a></noscript>
      </details>
      {% else %}
      {{ thumbnail }}
      {% endif %}
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
