---
title: Experience
description: Aaron Schneider's career in software engineering, DevSecOps, cloud architecture, QA automation, and technical leadership.
permalink: /experience/
---
<header class="page-intro"><p class="eyebrow">Career & capabilities</p><h1>Experience</h1><p class="lead">From web and hardware integration to enterprise delivery and AI-assisted development. My work connects programming, automation, system reliability, and team leadership.</p><div class="actions"><a class="button secondary" href="https://www.linkedin.com/in/aarondrewschneider/">View LinkedIn <span aria-hidden="true">↗</span></a></div></header>
<div class="timeline">{% assign roles = site.experience | sort: 'order' %}{% for role in roles %}<article class="role"><p class="role-date">{{ role.period | escape }}</p><div><h2>{{ role.organization | escape }}</h2><h3>{{ role.title | escape }}</h3>{{ role.content }}</div></article>{% endfor %}</div>
<section class="education split" aria-labelledby="education-title"><div><h2 id="education-title">Education</h2><p>Northeastern University<br>Computer Science · 1999–2002</p></div><div><h2>Selected certifications</h2><ul>{% for certification in site.data.profile.certifications %}<li>{{ certification | escape }}</li>{% endfor %}</ul></div></section>
