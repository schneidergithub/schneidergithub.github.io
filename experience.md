---
title: Experience
description: Aaron Schneider's career in software engineering, DevSecOps, cloud architecture, QA automation, and technical leadership.
permalink: /experience/
---
<header class="page-intro"><p class="eyebrow">Career</p><h1>Experience</h1><p class="lead">My work connects programming, automation, system reliability, and team leadership.</p><div class="actions"><a class="button secondary" href="https://www.linkedin.com/in/aarondrewschneider/">View LinkedIn <span aria-hidden="true">↗</span></a></div></header>
<div class="timeline">{% assign roles = site.experience | sort: 'order' %}{% for role in roles %}<article class="role"><p class="role-date">{{ role.period | escape }}</p><div><h2>{{ role.organization | escape }}</h2><h3>{{ role.title | escape }}</h3>{{ role.content }}</div></article>{% endfor %}</div>
