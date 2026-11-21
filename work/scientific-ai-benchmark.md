---
layout: case-study
project: commondevops
permalink: /work/scientific-ai-benchmark/
title: "Can AI reproduce a meta-analysis?"
link_label: "Reconstructing scientific results in Terminal-Bench-Science"
context: "CommonDevOps · Scientific AI benchmarking"
description: "Dr. Ian Miller and I co-authored “MDD Executive Function” for Terminal-Bench-Science. The task asks an AI agent to reconstruct effect sizes from published studies of executive function in major depressive disorder."
share_image: /assets/portfolio/share/tbs-meta-analysis.jpg
share_alt: "Terminal-Bench-Science case study. MDD Executive Function, a meta-analysis task co-authored by Aaron Schneider and Dr. Ian Miller."
---

[See how we checked the benchmark grader](#checking-the-grader).

## What the agent has to reproduce

A meta-analysis brings results from multiple studies onto a common scale. This task starts with source articles from Snyder’s 2013 meta-analysis and asks the agent to reconstruct the study-level effects.

1. Select the comparisons that meet the task criteria.
2. Extract the group statistics reported for each eligible comparison.
3. Calculate the effect size using the Hedges correction for small samples.

The selection step matters because the agent can do the arithmetic correctly for a comparison that answers a different question.

<h2 id="checking-the-grader" tabindex="-1">Who checks the benchmark grader?</h2>

If a grader rejects a result, the error could be in the agent’s answer, in the answer key, or in what the instructions asked for. In three recorded work sessions, Dr. Ian Miller and I traced how the task handles each possibility.

1. **Check the answer key.** The grader reads a JSON file. An offline authoring test compares its numbers with the expert spreadsheet. A separate regression test checks how the grader handles a blank line. Those tests let us examine the reference data and the grading code before evaluating an agent. [October 21 benchmark walkthrough, 7:51](https://www.youtube.com/watch?v=ICz5Q1s5QAg&t=471s).
2. **Trace a row to its rule.** The key marks results as required, optional, or forbidden. In the row audit, a reviewer can pick a statistic from a paper and read the rule beside its classification. That makes a disputed row concrete enough to review, even when everyone agrees on the arithmetic. [October 29 task review, 13:26](https://www.youtube.com/watch?v=zPNJW0DI5PA&t=806s).
3. **Read the task from the agent’s side.** We walked through the grader’s rules and checked where the participant instructions disclosed each one. Citations to the source papers let reviewers inspect the evidence for a classification. If the grader requires a choice a reader cannot infer from the instructions and papers, the task itself needs attention. [October 30 benchmark code review, 13:11](https://www.youtube.com/watch?v=fN4p2HbGkog&t=791s).

[Read the merged task and its review on GitHub](https://github.com/harbor-framework/terminal-bench-science/pull/1513).

## My contribution to the benchmark

Terminal-Bench-Science merged the task Dr. Miller and I developed. Beyond co-authoring the task, I review DevOps and infrastructure changes for the benchmark and work with the analysis team to process trial results.

In the presentation we walk through how the published studies became a task an agent could attempt. [Watch the research presentation]({{ '/articles/' | relative_url }}#benchmark-presentation).
