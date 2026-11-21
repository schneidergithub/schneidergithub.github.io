---
layout: case-study
project: commondevops
permalink: /work/scientific-ai-benchmark/
title: "Testing AI agents on a published meta-analysis"
link_label: "Reconstructing scientific results in Terminal-Bench-Science"
context: "CommonDevOps · Scientific AI benchmarking"
description: "Dr. Ian Miller and I co-authored “MDD Executive Function” for Terminal-Bench-Science. The task asks an AI agent to reconstruct effect sizes from published studies of executive function in major depressive disorder."
share_image: /assets/portfolio/share/tbs-meta-analysis.jpg
share_alt: "Terminal-Bench-Science case study. MDD Executive Function, a meta-analysis task co-authored by Aaron Schneider and Dr. Ian Miller."
---

## What the agent has to reproduce

A meta-analysis brings results from multiple studies onto a common scale. This task starts with source articles from Snyder’s 2013 meta-analysis and asks the agent to reconstruct the study-level effects.

1. Select the comparisons that meet the task criteria.
2. Extract the group statistics reported for each eligible comparison.
3. Calculate the effect size using the Hedges correction for small samples.

The selection step matters because the agent can do the arithmetic correctly for a comparison that answers a different question.

## My contribution to the benchmark

Terminal-Bench-Science merged the task Dr. Miller and I developed. Beyond co-authoring the task, I review DevOps and infrastructure changes for the benchmark and work with the analysis team to process trial results. [Read the merged task and its review on GitHub](https://github.com/harbor-framework/terminal-bench-science/pull/1513).

In the presentation we walk through how the published studies became a task an agent could attempt. [Watch the research presentation]({{ '/articles/' | relative_url }}#benchmark-presentation).
