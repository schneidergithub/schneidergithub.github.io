---
title: Experience
description: Aaron Schneider's career in software engineering, DevSecOps, cloud architecture, QA automation, and technical leadership.
permalink: /experience/
---
<header class="page-intro experience-intro">
  <h1>Experience</h1>
  <a class="profile-link" href="https://www.linkedin.com/in/aarondrewschneider/">LinkedIn profile</a>
</header>
{% assign roles = site.experience | sort: 'order' %}
<div class="timeline">
{% for role in roles %}
{% assign gallery = site.data.gallery | where: 'role_id', role.role_id | first %}
<article class="role">
  <img class="role-thumbnail"{% if gallery.items.size == 1 %} id="image-{{ gallery.id }}"{% endif %} src="{{ role.thumbnail | relative_url | escape }}" alt="{{ role.thumbnail_alt | escape }}" width="190" height="120" decoding="async"{% unless forloop.first %} loading="lazy"{% endunless %}>
  <header class="role-heading"{% if role.role_id == 'nuix' %} id="engineering-leadership" tabindex="-1"{% endif %}>
    {% if role.current %}<p class="role-current">Current</p>{% endif %}
    <h2 id="{{ role.role_id | escape }}" tabindex="-1">{{ role.organization | escape }}</h2>
    <h3>{{ role.title | escape }}</h3>
  </header>
  <div class="role-details">
    {{ role.content }}
    {% if role.recording %}
      <div class="role-recording focus-media">
        <h4>{{ role.recording.title | escape }}</h4>
        {% include publication-media.html publication=role.recording poster_fallback=true %}
      </div>
    {% endif %}
    {% assign studies = nil %}
    {% if role.case_project %}
      {% assign studies = site.pages | where: 'layout', 'case-study' | where: 'project', role.case_project | sort: 'title' %}
    {% endif %}
    {% if studies.size > 0 or role.related_work %}
      <ul class="role-links" role="list" aria-label="Related work at {{ role.organization | escape }}">
        {% for study in studies %}
        <li><a class="role-study" href="{{ study.url | relative_url }}">{{ study.link_label | default: study.title | escape }}</a></li>
        {% endfor %}
        {% for link in role.related_work %}
        <li><a class="role-study" href="{{ link.url | relative_url }}">{{ link.label | escape }}</a></li>
        {% endfor %}
      </ul>
    {% endif %}
  </div>
  {% if gallery.items.size > 1 %}
    <section class="role-gallery" id="images-{{ gallery.id }}" aria-label="{{ gallery.title | escape }} images" data-image-group="{{ gallery.id }}" data-image-title="{{ gallery.title | escape }}">
      <div class="role-thumbnails" id="thumbnails-{{ gallery.id }}">
        {% for item in gallery.items %}
        <a class="image-enlarge" href="{{ item.image | relative_url }}" id="original-{{ item.image | split: '/' | last | slugify }}" data-image-order="{{ forloop.index }}" data-image-caption="{{ item.caption | default: item.title | escape }}" aria-label="Enlarge {{ item.title | escape }}">
          <img src="{{ item.thumbnail | relative_url }}?v={{ item.thumbnail_version }}" alt="{{ item.alt | escape }}" width="{{ item.width }}" height="{{ item.height }}" loading="lazy" decoding="async">
        </a>
        {% endfor %}
      </div>
      <div class="role-gallery-controls gallery-plate" hidden>
        <button type="button" aria-controls="thumbnails-{{ gallery.id }}" aria-label="Scroll {{ gallery.short_name | escape }} thumbnails left"><span aria-hidden="true">←</span></button>
        <button type="button" aria-controls="thumbnails-{{ gallery.id }}" aria-label="Scroll {{ gallery.short_name | escape }} thumbnails right"><span aria-hidden="true">→</span></button>
      </div>
    </section>
  {% endif %}
</article>
{% endfor %}
</div>
{% include image-viewer.html makers_plate=true %}
<script src="{{ '/assets/portfolio/experience-gallery.js' | relative_url }}" defer></script>
<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
