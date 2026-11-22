---
layout: case-study
project: commondevops
link_label: "Chess video benchmark"
permalink: /work/chess-puzzle-qa/
share_image: /assets/portfolio/share/chess-puzzle-benchmark.jpg
share_alt: "A chess puzzle that reveals too much. Qualitative benchmark by Aaron Schneider, with a chessboard from the generated puzzle video."
title: "The chess puzzle that gave away the answer"
context: "CommonDevOps · QA automation"
description: "We used a chess puzzle video project as a qualitative benchmark of AI-assisted software development. One of the videos I reviewed gave away the solution while the puzzle timer was still running."
figures:
  - image: /assets/publications/chess-render.jpg
    width: 1280
    height: 720
    alt: "A position from the local chess puzzle video, with highlighted squares and coordinates around the board."
    caption: "This frame preserves a board position from a local render. I watched the countdown to check when a viewer could see the answer."
---

## What a playable video can miss
{: #what-a-playable-video-can-miss tabindex="-1"}

Our first milestone called for a local video of the daily Lichess puzzle. The [milestone checklist on GitHub](https://github.com/commondevops/llm-chess-experiment/blob/8d660666fc25a99a8846a2867089f8cfe6381f63/milestone1_local_recreation_instructions.md) covered the data, board frames, and playable MP4. It even specified that the pieces should sit in the middle of their squares. In a companion essay, I explain [why I’d separate rendering from publishing]({{ '/articles/fresh-sandbox-github/' | relative_url }}#publishing-the-video).

The [presentation on the benchmark]({{ '/articles/' | relative_url }}#chess-benchmark-presentation) shows one version with Black to move and White’s pieces at the bottom of the screen. The viewer had to solve the puzzle from the opponent’s seat. [Board orientation, 6:34](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=394s).

Another version highlighted each move during the demonstration. I liked that cue. A few seconds earlier, the viewer could already read the solution while the timer counted down. [Early reveal, 10:00](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=600s).

## How I would test the reveal

These are proposed regression tests. I would use a fixed position with Black to move and inspect two frames from the exported video, one just before the timer expires and one just after. [Why I check for placeholder tests, 11:21](https://www.youtube.com/watch?v=IXzLwNlLAI4&t=681s).

{% include chess-reveal-check.html %}

A board can stay perfectly still while a caption gives away the answer. That’s why I would check the whole frame. For another example of testing what the user gets, see [Super Salon checkout]({{ '/work/super-salon-checkout/' | relative_url }}).
