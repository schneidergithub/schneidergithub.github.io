---
layout: essay
title: "What a fresh sandbox inherits from GitHub"
author: "Aaron Schneider"
description: "A pull-request comment can change an AI review without changing the commit. A chess-video project shows how to set a separate boundary around publication."
permalink: /articles/fresh-sandbox-github/
share_image: /assets/portfolio/share/fresh-sandbox-github.jpg
share_alt: "What a fresh sandbox inherits from GitHub, an engineering essay by Aaron Schneider. Beside the title is a chess position from the project’s rendered puzzle video."
---

Imagine two review jobs starting from the same commit. Between runs, a teammate leaves a comment explaining why a test was skipped. The second reviewer opens the same pull request and finds an explanation the first reviewer never saw. Both checkouts are clean. The evidence has changed.

Dr. Ian Miller and I discussed this on a CommonDevOps livestream. A pull request lets one engineer leave context for the next shift. That history becomes an input when a coding agent reads it. If I’m comparing two runs, I’d give both the same snapshot of the discussion and save it alongside the commit. [The pull-request example at 59:31](https://www.youtube.com/watch?v=i0a7tXSLj3c&t=3571s).

What can the agent change? Our chess-video project made that a separate decision. The first milestone required a local run to save the Lichess puzzle, its metadata, numbered board frames and a playable MP4. A reviewer could watch the finished puzzle without YouTube credentials. I’d require a separate approval before giving a publishing job access to the channel. [Chess milestone and acceptance checks](https://github.com/commondevops/llm-chess-experiment/blob/8d660666fc25a99a8846a2867089f8cfe6381f63/milestone1_local_recreation_instructions.md#L16-L51).
