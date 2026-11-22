---
title: Articles & Demos
description: Selected CommonDevOps articles, research, interviews, and videos covering AI, software engineering, and cybersecurity.
permalink: /articles/
groups:
  - id: recordings
    label: Recordings
    type: Video
  - id: engineering-essays
    label: Engineering essays
    type: Engineering essay
  - id: monthly-reviews
    label: Monthly archive
    type: Article
  - id: investigations
    label: Investigations
    type: Research report
---
<header class="page-intro publication-intro">
  <h1>Articles &amp; Demos</h1>
  <p class="lead">Talks and field reports on AI, cybersecurity, and software delivery.</p>
  <nav class="publication-jumps section-jumps" aria-label="Publication formats">
    {% for group in page.groups %}
      {% if group.id == 'monthly-reviews' %}{% assign members = site.data.publications | where_exp: 'item', 'item.issue_month' %}{% else %}{% assign members = site.data.publications | where: 'type', group.type %}{% endif %}
      <a href="#{{ group.id }}">{{ group.label }} <span class="count">{{ members.size }}</span></a>
    {% endfor %}
  </nav>
</header>
{% for group in page.groups %}
{% if group.id == 'monthly-reviews' %}{% include newsletter-archive.html %}{% continue %}{% endif %}
{% assign members = site.data.publications | where: 'type', group.type %}
<section class="publication-group" aria-labelledby="{{ group.id }}">
<h2 id="{{ group.id }}" tabindex="-1">{{ group.label }}</h2>
<ul class="publication-list">
{% for item in members %}
  {% assign featured = false %}
  {% if group.id == 'recordings' and forloop.first %}{% assign featured = true %}{% endif %}
  {% assign source_url = item.url %}
  {% assign first_character = source_url | slice: 0, 1 %}
  {% if first_character == '/' %}{% assign source_url = item.url | relative_url %}{% endif %}
  {% capture display_title %}<span class="publication-title">{{ item.title | escape | replace: 'meta-analysis', '<span class="keep-term">meta-analysis</span>' }}</span>{% endcapture %}
  <li class="publication{% if featured %} publication-featured{% endif %}" id="{{ item.id | escape }}" tabindex="-1">
    <div class="publication-heading">
      <h3>{% if item.type == 'Video' %}{{ display_title }}{% else %}<a href="{{ source_url | escape }}">{{ display_title }}{% if item.primary_edition %} <span class="edition-source">{{ item.primary_edition | escape }}</span>{% elsif first_character != '/' %} <span aria-hidden="true">↗</span>{% endif %}</a>{% endif %}</h3>
      <a class="entry-permalink" href="#{{ item.id | escape }}" aria-label="Link to {{ item.title | escape }}" title="Link to this entry"></a>
    </div>
    <div class="meta">
      {% include publication-media.html publication=item link_cover=true cover_url=source_url eager=featured %}
    </div>
    <div class="publication-copy">
      {% if item.period or item.date %}<p class="publication-date">{% if item.period %}{{ item.period | escape }} issue{% endif %}{% if item.period and item.date %} · {% endif %}{% if item.date %}Published <time datetime="{{ item.date }}">{{ item.date | date: '%B %-d, %Y' }}</time>{% endif %}</p>{% endif %}
      <p>{{ item.description | escape }}</p>
      {% if item.guide %}<p><a class="publication-guide" href="{{ item.guide.url | relative_url | escape }}">{{ item.guide.label | escape }}</a> {{ item.guide.context | escape }}.</p>{% endif %}
      <p class="attribution">{{ item.attribution | escape }}</p>
      {% if item.editions or item.related or item.case_url or item.companion %}
      <p class="publication-actions">
        {% for edition in item.editions %}<a class="publication-edition" href="{{ edition.url | escape }}">{{ edition.label | escape }}</a>{% endfor %}
        {% if item.related %}<a class="publication-related" href="{{ item.related.url | escape }}">{{ item.related.label | escape }}&nbsp;<span aria-hidden="true">↗</span></a>{% endif %}
        {% if item.case_url %}
          {% assign study = site.pages | where: 'url', item.case_url | first %}
          {% if study %}<a class="publication-case" href="{{ study.url | relative_url }}">{{ study.link_label | default: study.title | escape }}</a>{% endif %}
        {% endif %}
        {% if item.companion %}<a class="publication-context" href="#{{ item.companion.id | escape }}">{{ item.companion.label | escape }}</a>{% endif %}
      </p>
      {% endif %}
    </div>
  </li>
{% endfor %}
</ul>
</section>
{% endfor %}
<script src="{{ '/assets/publications/video-player.js' | relative_url }}" defer></script>
