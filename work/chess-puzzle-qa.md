---
layout: case-study
work_design: true
project: commondevops
work_return_id: chess-benchmarks
work_return_label: Chess benchmarks section
link_label: "Qualitative chess benchmark"
permalink: /work/chess-puzzle-qa/
share_image: /assets/portfolio/share/chess-puzzle-benchmark.jpg
share_alt: "Qualitative chess video benchmark by Aaron Schneider, illustrated with a board frame from the generated puzzle video."
title: "Evaluating AI-built chess puzzle videos"
context: "CommonDevOps · QA automation"
description: "We used a chess puzzle video project as a qualitative benchmark of AI-assisted software development. I reviewed the generated videos against the requested deliverable and the experience of someone trying to solve the puzzle."
figures:
  - image: /assets/publications/chess-render.jpg
    width: 1280
    height: 720
    alt: "A position from the local chess puzzle video, with highlighted squares and coordinates around the board."
    caption: "A board frame from the Claude Opus 4.6 demonstration. The presentation reviews the complete video, including orientation, move cues, and the timing of the solution reveal."
---

[Watch the benchmark presentation]({{ '/articles/' | relative_url }}#chess-benchmark-presentation).

## The benchmark deliverable

AI coding tools were asked to turn a daily Lichess puzzle into a playable local video. This made the output directly inspectable: we could watch the result and compare it with the requested behavior.

The [milestone checklist on GitHub](https://github.com/commondevops/llm-chess-experiment/blob/8d660666fc25a99a8846a2867089f8cfe6381f63/milestone1_local_recreation_instructions.md) covered the data, board frames, and playable MP4. It even specified that the pieces should sit in the middle of their squares.

## My review: from working software to a usable puzzle

I reviewed whether the video communicated the puzzle clearly: the board perspective, the move highlights, and when the answer appeared. These are qualitative observations from the demonstrated outputs, not a numerical ranking of the tools.

<h2 id="what-a-playable-video-can-miss" tabindex="-1">What a playable video can miss</h2>

The [presentation on the benchmark]({{ '/articles/' | relative_url }}#chess-benchmark-presentation) shows one version with Black to move and White’s pieces at the bottom of the screen. The viewer had to solve the puzzle from the opponent’s seat. [Board orientation, 6:34](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=394s).

Another version highlighted each move during the demonstration. I liked that cue. A few seconds earlier, the viewer could already read the solution while the timer counted down. [Early reveal, 10:00](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=600s).

## How I would test the reveal

These are proposed regression tests. I would use a fixed position with Black to move and inspect two frames from the exported video, one just before the timer expires and one just after. [Why I check for placeholder tests, 11:21](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=681s).

{% include chess-reveal-check.html %}

A board can stay perfectly still while a caption gives away the answer. That’s why I would check the whole frame. For another example of testing what the user gets, see [Super Salon checkout]({{ '/work/super-salon-checkout/' | relative_url }}).
