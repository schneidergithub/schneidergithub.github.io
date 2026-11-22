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

1. **Check the answer key.** In the October walkthrough, an offline authoring test compared the numbers in the JSON answer key with the expert spreadsheet. A separate regression test examined how the grader handled blank input. That gave us two places to look when a result was unexpected. [October 21 benchmark walkthrough, 7:51](https://www.youtube.com/watch?v=ICz5Q1s5QAg&t=471s).
2. **Trace a row to its rule.** During development we documented which results were required, optional, or excluded. The row audit paired each classification with the rule behind it. A reviewer could pick a statistic from a paper and challenge that decision even when everyone agreed on the arithmetic. [October 29 task review, 13:26](https://www.youtube.com/watch?v=zPNJW0DI5PA&t=806s).
3. **Read the task from the agent’s side.** We walked through the grader’s rules and checked where the participant instructions disclosed each one. Citations to the source papers let reviewers inspect the evidence for a classification. If the grader requires a choice a reader cannot infer from the instructions and papers, the task itself needs attention. [October 30 benchmark code review, 13:11](https://www.youtube.com/watch?v=fN4p2HbGkog&t=791s).

The merged grader reads two CSV tables derived from the key. Each required comparison needs its own submitted row. The second table defines additional admissible comparisons. A submitted row that matches neither table fails. The parser skips a completely blank line and flags a row with empty fields. [See the reference tables and row checks in the merged verifier](https://github.com/harbor-framework/terminal-bench-science/blob/0c9b52723f35d39505b57e349c403dc9bdc66e46/tasks/life-sciences/neuroscience/mdd-executive-function/tests/test_outputs.py#L2-L103). [Read the merged task and its review on GitHub](https://github.com/harbor-framework/terminal-bench-science/pull/1513).

## My contribution to the benchmark

Terminal-Bench-Science merged the task Dr. Miller and I developed. Beyond co-authoring the task, I review DevOps and infrastructure changes for the benchmark and work with the analysis team to process trial results.

In the presentation we walk through how the published studies became a task an agent could attempt. [Open the presentation details and player]({{ '/articles/' | relative_url }}#benchmark-presentation).
