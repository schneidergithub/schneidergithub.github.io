---
title: Experience
description: Aaron Schneider's career in software engineering, DevSecOps, cloud architecture, QA automation, and technical leadership.
permalink: /experience/
---
<header class="page-intro"><p class="eyebrow">Career</p><h1>Experience</h1><p class="lead">My work connects programming, automation, system reliability, and team leadership.</p><div class="actions"><a class="button secondary" href="https://www.linkedin.com/in/aarondrewschneider/">View LinkedIn <span aria-hidden="true">↗</span></a></div></header>
<div class="timeline">
{% assign roles = site.experience | sort: 'order' %}
{% for role in roles %}
<article class="role">
  <img class="role-thumbnail" src="{{ role.thumbnail | relative_url | escape }}" alt="{{ role.thumbnail_alt | escape }}" width="190" height="120" decoding="async"{% unless forloop.first %} loading="lazy"{% endunless %}>
  <header class="role-heading">
    <h2>{{ role.organization | escape }}</h2>
    <h3>{{ role.title | escape }}</h3>
  </header>
  <div class="role-details">
    {{ role.content }}
    {% if role.case_project %}
      {% assign studies = site.pages | where: 'layout', 'case-study' | where: 'project', role.case_project | sort: 'title' %}
      {% for study in studies %}
      <div><a class="role-study" href="{{ study.url | relative_url }}">{{ study.link_label | default: study.title | escape }}</a></div>
      {% endfor %}
    {% endif %}
  </div>
</article>
{% endfor %}
</div>
