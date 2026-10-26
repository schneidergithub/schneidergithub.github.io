---
title: Articles & Demos
description: Selected CommonDevOps articles, research, interviews, and videos covering AI, software engineering, and cybersecurity.
permalink: /articles/
---
<header class="page-intro"><p class="eyebrow">Writing, research & conversation</p><h1>Articles & demos</h1><p class="lead">Selected publications and conversations from my work with CommonDevOps. Follow each link to read or watch the original, with its full context and credits.</p><p class="notice">LinkedIn may ask you to sign in. Articles reflect the information available when they were published.</p></header>
<ul class="publication-list">{% for item in site.data.publications %}<li class="publication"><div class="meta"><span class="type">{{ item.type }}</span>{% if item.date %}<time datetime="{{ item.date }}">{{ item.date | date: '%B %-d, %Y' }}</time>{% elsif item.period %}<span>{{ item.period | escape }}</span>{% endif %}</div><article><h2><a href="{{ item.url | escape }}">{{ item.title | escape }} <span aria-hidden="true">↗</span></a></h2><p>{{ item.description | escape }}</p><p class="attribution">{{ item.attribution | escape }}</p></article></li>{% endfor %}</ul>
