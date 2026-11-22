---
layout: case-study
project: commondevops
link_label: "Chess puzzle QA"
permalink: /work/chess-puzzle-qa/
title: "The chess puzzle that gave away the answer"
context: "CommonDevOps · QA automation"
description: "In one of the AI-generated chess videos I reviewed, the solution appeared while the puzzle timer was still running."
---

## What a playable video can miss

Our first milestone called for a local video of the daily Lichess puzzle. The checklist covered the data, board frames, and playable MP4. It even specified that the pieces should sit in the middle of their squares. [Milestone checklist on GitHub](https://github.com/commondevops/llm-chess-experiment/blob/8d660666fc25a99a8846a2867089f8cfe6381f63/milestone1_local_recreation_instructions.md).

In one version it was Black’s move, but White’s pieces were at the bottom of the screen. The viewer had to solve the puzzle from the opponent’s seat. [Board orientation, 6:34](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=394s).

Another version highlighted each move during the demonstration. I liked that cue. A few seconds earlier, the viewer could already read the solution while the timer counted down. [Early reveal, 10:00](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=600s).

## How I would test the reveal

These are proposed regression tests. I would use a fixed position with Black to move and inspect two frames from the exported video, one just before the timer expires and one just after. [Why I check for placeholder tests, 11:21](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=681s).

{% include chess-reveal-check.html %}

A board can stay perfectly still while a caption gives away the answer. That’s why I would check the whole frame. For another example of testing what the user gets, see [Super Salon checkout]({{ '/work/super-salon-checkout/' | relative_url }}).
