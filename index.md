---
title: Software engineering, DevSecOps & AI Research
description: Aaron Schneider builds software, automates delivery, and improves system reliability. Explore 25+ years of engineering work and current AI research.
permalink: /
---
<section class="hero">
  <div>
    <p class="eyebrow">Software Engineer · DevSecOps · AI Research</p>
    <h1>Building software.<br>A systematic approach.</h1>
    <p class="lead">Hi, I'm Aaron Schneider. <br> I have over 25+ years of experience across full-stack development, DevSecOps, and engineering management.</p>
    <div class="actions"><a class="button" href="{{ '/work/' | relative_url }}">Explore selected work</a><a class="button secondary" href="{{ '/experience/' | relative_url }}">View experience</a></div>
  </div>
  <aside class="focus-panel" aria-labelledby="focus-title">
    <p class="eyebrow">Current focus</p>
    <h2 id="focus-title">AI Research.</h2>
    <p>At CommonDevOps, we are submitting a <a href="https://github.com/harbor-framework/terminal-bench-science/pull/1513">benchmark task</a> to terminal-bench-science.  <a href="https://www.tbench.ai/news/terminal-bench-science-0-1">Terminal Bench Science</a> is a project from Stanford University and used for testing the latest AI models. </p>
    <a href="{{ '/work/#commondevops' | relative_url }}">See the work <span aria-hidden="true">→</span></a>
  </aside>
</section>

<section class="section" aria-labelledby="selected-title">
  <div class="section-heading"><h2 id="selected-title">Selected work</h2><a href="{{ '/work/' | relative_url }}">View all projects <span aria-hidden="true">→</span></a></div>
  <div class="feature-grid">
    {% assign projects = site.work | sort: 'order' %}{% for project in projects %}{% if project.featured %}
    <article class="feature"><p class="eyebrow">{{ project.category }}</p><h3>{{ project.title }}</h3><p>{{ project.summary }}</p><a href="{{ '/work/' | relative_url }}#{{ project.slug }}">Read project summary <span class="visually-hidden">for {{ project.title }}</span><span aria-hidden="true"> →</span></a></article>
    {% endif %}{% endfor %}
  </div>
</section>

<section class="section" id="connect" aria-labelledby="connect-title">
  <p class="eyebrow">Let's connect</p><h2 id="connect-title">Leadership for your team.<br>Systematic engineering for your next project.</h2>
  <div class="split">
    <div class="audience"><h3>For employers</h3><p>Explore my experience in software engineering, DevSecOps, automation, and technical leadership.</p><div class="actions"><a class="button secondary" href="{{ '/experience/' | relative_url }}">View experience</a><a class="button secondary" href="https://www.linkedin.com/in/aarondrewschneider/">Connect on LinkedIn <span aria-hidden="true">↗</span></a></div></div>
    <div class="audience"><h3>For consulting clients</h3><p>Contact me directly about individual consulting, or connect with CommonDevOps about a team engagement.</p><div class="actions"><a class="button secondary" href="https://www.linkedin.com/in/aarondrewschneider/">Individual consulting <span aria-hidden="true">↗</span></a><a class="button secondary" href="https://www.linkedin.com/company/commondevops/">CommonDevOps team <span aria-hidden="true">↗</span></a></div></div>
  </div>
  <div class="actions"><a class="button secondary" href="https://www.youtube.com/@commondevops?sub_confirmation=1">CommonDevOps on YouTube <span aria-hidden="true">↗</span></a></div>
</section>

<section class="section" aria-labelledby="writing-title">
  <div class="section-heading"><h2 id="writing-title">Articles & Demos</h2><a href="{{ '/articles/' | relative_url }}">View the collection <span aria-hidden="true">→</span></a></div>
  <ul class="reading-list">{% for item in site.data.publications limit:3 %}<li><a href="{{ item.url | escape }}">{{ item.title | escape }} <span aria-hidden="true">↗</span></a><span>{{ item.type }} · {{ item.publisher | escape }}</span></li>{% endfor %}</ul>
</section>
