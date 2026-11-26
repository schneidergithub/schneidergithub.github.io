---
layout: case-study
work_design: true
project: commondevops
work_return_id: case-studies-title
work_return_label: Terminal-Bench-Science feature
contribution_url: https://github.com/harbor-framework/terminal-bench-science/pull/1513
permalink: /work/scientific-ai-benchmark/
title: "Testing AI agents on published effect sizes"
link_label: "Scientific AI benchmark"
context: "CommonDevOps · Scientific AI benchmarking"
description: "Dr. Ian Miller and I co-authored “MDD Executive Function” for Terminal-Bench-Science. The task asks an AI agent to reconstruct effect sizes from published studies of executive function in major depressive disorder."
share_image: /assets/portfolio/share/tbs-meta-analysis.jpg
share_alt: "Terminal-Bench-Science case study. MDD Executive Function, a meta-analysis task co-authored by Aaron Schneider and Dr. Ian Miller."
---

[View the merged research task on GitHub]({{ page.contribution_url }}).

## My contribution to the benchmark

I co-authored the task with Dr. Ian Miller, working through the source studies, comparison rules, and expected results. Version 1 and its associated research paper will include “MDD Executive Function.”

After Terminal-Bench-Science merged our task, I continued working on the benchmark as a maintainer. I review DevOps and infrastructure changes and work with the analysis team to process trial results.

## What the agent has to reproduce

A meta-analysis brings results from multiple studies onto a common scale. This task starts with source articles from Snyder’s 2013 meta-analysis and asks the agent to reconstruct the study-level effects.

<figure class="research-process" aria-labelledby="research-process-title">
  <figcaption id="research-process-title">From papers to effect sizes</figcaption>
  <ol>
    <li><strong>Select comparable results</strong><span>Find the comparisons that meet the task criteria.</span></li>
    <li><strong>Extract the group statistics</strong><span>Record the numbers each study reports for those groups.</span></li>
    <li><strong>Calculate each effect size</strong><span>Apply the Hedges correction for small samples.</span></li>
  </ol>
</figure>

The challenge combines reading scientific literature, selecting comparable outcomes, and calculating reproducible results. Correct arithmetic alone does not establish that a comparison answers the research question.

## Explore the task and working sessions

The repository contains the task instructions and implementation. The [benchmark presentation]({{ '/articles/' | relative_url }}#benchmark-presentation) introduces the work; the recordings below show specific authoring decisions.

<details class="technical-details" id="checking-the-grader">
<summary>Technical appendix: checking the benchmark grader</summary>
<div markdown="1">

Dr. Miller and I worked through three questions in October. Was the reference number right? Did that comparison belong in the answer? Could the agent tell from the instructions?

1. **Check the answer key.** An offline authoring test compared the JSON key with the expert spreadsheet. A separate regression test checked how the grader handled blank input. [Spreadsheet check, 7:51](https://www.youtube.com/watch?v=ICz5Q1s5QAg&t=471s).
2. **Trace a row to its rule.** We recorded why each comparison was required, optional, or excluded. A reviewer could take a disputed statistic from a paper and find the rule behind our decision. [Row audit, 13:26](https://www.youtube.com/watch?v=zPNJW0DI5PA&t=806s).
3. **Read the participant instructions.** We checked where the instructions disclosed each grading rule. Citations to the original papers gave reviewers a way to check the evidence for a row. [Instructions and verifier, 13:11](https://www.youtube.com/watch?v=fN4p2HbGkog&t=791s).

The merged grader reads two CSV tables derived from the key. Each required comparison needs its own submitted row. The second table defines additional admissible comparisons. A submitted row that matches neither table fails. The parser skips a completely blank line and flags a row with empty fields. [Merged verifier](https://github.com/harbor-framework/terminal-bench-science/blob/0c9b52723f35d39505b57e349c403dc9bdc66e46/tasks/life-sciences/neuroscience/mdd-executive-function/tests/test_outputs.py#L2-L103).

[Case overview](#case-title).

</div>
</details>
