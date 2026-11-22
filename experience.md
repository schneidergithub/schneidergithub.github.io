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
<article class="role">
  <img class="role-thumbnail" src="{{ role.thumbnail | relative_url | escape }}" alt="{{ role.thumbnail_alt | escape }}" width="190" height="120" decoding="async"{% unless forloop.first %} loading="lazy"{% endunless %}>
  <header class="role-heading"{% if role.role_id == 'nuix' %} id="engineering-leadership" tabindex="-1"{% endif %}>
    {% if role.current %}<p class="role-current">Current</p>{% endif %}
    <h2 id="{{ role.role_id | escape }}" tabindex="-1">{{ role.organization | escape }}</h2>
    <h3>{{ role.title | escape }}</h3>
  </header>
  <div class="role-details">
    {{ role.content }}
    {% assign studies = nil %}
    {% if role.case_project %}
      {% assign studies = site.pages | where: 'layout', 'case-study' | where: 'project', role.case_project | sort: 'title' %}
    {% endif %}
    {% if studies.size > 0 or role.gallery_link %}
      <ul class="role-links" role="list" aria-label="Related work at {{ role.organization | escape }}">
        {% for study in studies %}
        <li><a class="role-study" href="{{ study.url | relative_url }}">{{ study.link_label | default: study.title | escape }}</a></li>
        {% endfor %}
        {% if role.gallery_link %}
        <li><a class="role-study" href="{{ '/work/' | relative_url }}#gallery-{{ role.gallery_link.group | escape }}">{{ role.gallery_link.label | escape }}</a></li>
        {% endif %}
      </ul>
    {% endif %}
  </div>
</article>
{% endfor %}
</div>
