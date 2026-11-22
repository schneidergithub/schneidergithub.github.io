---
layout: case-study
project: commondevops
permalink: /work/chess-puzzle-qa/
title: "The chess puzzle that gave away the answer"
context: "CommonDevOps · QA automation"
description: "I reviewed several AI-generated versions of a daily chess puzzle video. One showed viewers the moves they were supposed to find while the puzzle timer was still running."
---

## What a playable video can miss

Our first milestone took a daily Lichess puzzle and produced a silent video locally. The run had to save the puzzle data, metadata, board frames, and a playable MP4. The checklist also called for an unclipped board and pieces centered in their squares. I compared the generated videos from the perspective of someone sitting down to solve the puzzle. [Read the local video milestone on GitHub](https://github.com/commondevops/llm-chess-experiment/blob/8d660666fc25a99a8846a2867089f8cfe6381f63/milestone1_local_recreation_instructions.md).

In one version it was Black’s move, but White’s pieces were at the bottom of the screen. The viewer playing Black had to read the position from the opponent’s seat. [Watch the board orientation review at 6:34](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=394s).

Another version highlighted each move as it played through the solution. I liked that cue for following the demonstration. The problem came a few seconds earlier, when the solution line was already visible and the viewer was still supposed to be thinking. [Watch the early reveal at 10:00](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=600s).

## How I would test the reveal

In the discussion I recommended reading the acceptance tests for placeholder assertions. For this puzzle, I would use a fixed position with Black to move and inspect frames from the exported video immediately before and after the timer expires. The two checks below are proposed regression tests. [Hear the discussion of placeholder tests at 11:21](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=681s).

{% include chess-reveal-check.html %}

A board can stay perfectly still while a caption gives away the answer. That’s why I would check the whole frame, including its text and highlights. The same reasoning caught a checkout defect at Super Salon. Both applications accepted a sale. Comparing what each recorded revealed the rounding error. [Read the Super Salon checkout case]({{ '/work/super-salon-checkout/' | relative_url }}).
