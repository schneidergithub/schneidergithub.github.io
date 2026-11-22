---
title: Experience
description: Aaron Schneider's career in software engineering, DevSecOps, cloud architecture, QA automation, and technical leadership.
permalink: /experience/
---
<header class="page-intro experience-intro"><p class="eyebrow">Career</p><h1>Experience</h1><p class="lead">My work connects programming, automation, system reliability, and team leadership.</p><div class="actions"><a class="button secondary" href="https://www.linkedin.com/in/aarondrewschneider/">View LinkedIn <span aria-hidden="true">↗</span></a></div></header>
{% assign roles = site.experience | sort: 'order' %}
<section class="leadership" aria-labelledby="engineering-leadership">
  <h2 id="engineering-leadership" tabindex="-1">Engineering leadership</h2>
  <div class="leadership-roles">
    {% for role in roles %}
    {% if role.leadership_summary %}
    <div>
      <h3><a href="#{{ role.role_id | escape }}">{{ role.organization | escape }} role details</a></h3>
      <p>{{ role.leadership_summary | escape }}</p>
    </div>
    {% endif %}
    {% endfor %}
  </div>
</section>
<div class="timeline">
{% for role in roles %}
<article class="role">
  <img class="role-thumbnail" src="{{ role.thumbnail | relative_url | escape }}" alt="{{ role.thumbnail_alt | escape }}" width="190" height="120" decoding="async"{% unless forloop.first %} loading="lazy"{% endunless %}>
  <header class="role-heading">
    <h2 id="{{ role.role_id | escape }}" tabindex="-1">{{ role.organization | escape }}</h2>
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
