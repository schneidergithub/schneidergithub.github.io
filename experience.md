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
{% capture thumbnail %}<img class="role-thumbnail" src="{{ role.thumbnail | relative_url | escape }}" alt="{{ role.thumbnail_alt | escape }}" width="190" height="120" decoding="async"{% unless forloop.first %} loading="lazy"{% endunless %}>{% endcapture %}
<article class="role">
  {% if gallery.items.size == 1 %}
    {% assign item = gallery.items.first %}
    <a class="role-single image-enlarge" id="image-{{ gallery.id }}" href="{{ item.image | relative_url }}" aria-label="{{ item.open_label | default: item.title | escape }}{% unless item.open_label %} — open full-size image{% endunless %}">{{ thumbnail }}</a>
  {% elsif gallery == nil %}
    {{ thumbnail }}
  {% endif %}
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
        {% include publication-media.html publication=role.recording %}
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
    {% assign examples = gallery.items | where_exp: 'item', 'item.detail_of == nil' %}
    <details class="role-gallery gallery-disclosure" id="images-{{ gallery.id }}">
      <summary>
        <span aria-hidden="true">{{ thumbnail }}</span>
        <span class="gallery-expand">View {{ gallery.items.size }} {{ gallery.short_name | escape }} images</span>
        <span class="gallery-collapse">Hide {{ gallery.short_name | escape }} images</span>
      </summary>
      {% include gallery-grid.html group=gallery items=examples offset=0 %}
    </details>
  {% endif %}
</article>
{% endfor %}
</div>
<script src="{{ '/assets/portfolio/gallery-return.js' | relative_url }}" defer></script>
<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
