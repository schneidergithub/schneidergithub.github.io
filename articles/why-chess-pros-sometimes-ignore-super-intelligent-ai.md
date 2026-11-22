---
layout: essay
title: "Why Chess Pros Sometimes Ignore Super-Intelligent AI"
author: "Aaron Schneider"
original_date: "2025-04-18"
description: "An engine calls my rook move a mistake. I want to trade into a pawn ending. What that difference tells us about using AI to make decisions."
permalink: /articles/why-chess-pros-sometimes-ignore-super-intelligent-ai/
share_image: /assets/publications/chess-before-the-trades.png
share_alt: "The chess engine marks White’s rook move as a mistake and shows a +1.4 evaluation beside the board."
share_image_type: image/png
share_width: 758
share_height: 475
---

I was recently talking to my friend about chess and how it relates to computer science. In my opinion, this is an overlooked area where a lot of cutting edge stuff is happening. Below are some of my initial thoughts, please criticize me to no end!

## The Rise of AI in Chess Changed the Game Forever.

The game of chess fundamentally changed when computers started beating the best human players.  In 1997 IBM’s Deep Blue beat the world champion Kasparov, forever changing chess and also some core beliefs about "intelligence". Anyway, what’s more interesting to me is how professionals interact with these tools today.

Modern chess isn’t just about playing. It’s about analyzing positions with software tools. These “chess engines” evaluate moves with superhuman accuracy and depth. After a match, players often go through every move with an engine, comparing what they played against what the machine would have done. And sometimes, they intentionally disagree.

<figure>
  <a href="{{ '/assets/publications/chess-mate-in-43.png' | relative_url }}" aria-label="View the mate-in-43 position at full size"><img src="{{ '/assets/publications/chess-mate-in-43.png' | relative_url }}" alt="Only kings and pawns remain. The engine shows #43 above the move list." width="761" height="474" loading="lazy" decoding="async"></a>
  <figcaption>The computer engine found a forced checkmate 43 moves from this position!</figcaption>
</figure>

## Not Every “Best Move” Is Practical.

Imagine a position where the engine recommends a line with a +2 advantage (equivalent to about 2 pawns ahead)  but that line requires twenty perfect next moves. One mistake and the advantage disappears.

A human player might instead choose a line with only a +1.0 advantage that’s easier to manage. The structure is more stable, the pressure is lower, and it’s less likely to fall apart with a single oversight. It’s not about precision. It’s about resilience.

This is the same kind of tradeoff people make in the real world all the time. You might skip a high-performance language or tool in favor of something more familiar and predictable. The best solution isn’t always the fastest, it’s the one that works under real-world pressure.

<figure>
  <a href="{{ '/assets/publications/chess-before-the-trades.png' | relative_url }}" aria-label="View the position before the trades at full size"><img src="{{ '/assets/publications/chess-before-the-trades.png' | relative_url }}" alt="White’s rook has moved to e3. The engine marks the move as a mistake and suggests moving the knight to e2." width="758" height="475" loading="lazy" decoding="async"></a>
  <figcaption>I'm playing white - my strategy is to trade off all main pieces, because I want to simplify the position. I disagree with the computer's analysis here. I knew intuitively that if I get to just kings &amp; pawns (first image), I should win the game.</figcaption>
</figure>

## Sometimes the Human Sees What the Machine Misses.

Even today, engines don’t see everything. In a complex position, an engine might miss a forced checkmate that’s 50+ moves away, simply because it hasn’t searched that deep. A human might look at the board and immediately recognize the pattern. Eventually the engine catches up. But that lag shows that brute-force calculation isn’t the whole story. There’s still value in intuition and long-term pattern recognition, skills that experienced humans develop over years.

\*Engines can see much further at the end of the game versus the beginning. The depth is typically around 17-25 moves at the start of the game and goes up towards the end of the game when less pieces are on the board.  In the above screenshots, my strategy of simplifying ends up being correct and the engine finally finds a forced checkmate.

## Magnus Carlsen and the Strategy of Playing the Opponent.

I recently spoke with a game theory professor at CMU, who is also an excellent chess player. He explained something that really stuck with me: high-level players often make moves not because they’re the best in isolation, but because they’re the best against a specific opponent.  Magnus Carlsen (arguably the GOAT of chess) is the perfect example. He often avoids sharp, well-studied openings. Not because they’re bad, but because his opponents know them cold. By choosing a line that’s slightly less "perfect", Magnus pulls them out of their prep and into a game where creativity matters more than memorization. That’s where he thrives.  It’s a reminder that strategy is situational. The best move in theory may not be the best move in context.

## AI Optimization Isn’t Always the Right Call

This same lesson applies to software development. AI might recommend a solution that looks ideal on paper. But if that solution is brittle, unfamiliar, or hard to maintain, it might not be the best choice for your team.  There’s a difference between theoretical optimization and practicality. A clean, maintainable solution, even if it’s not the most efficient, is often the better path. The ability to adapt, collaborate, and manage risk can outweigh raw performance.

## Why Traditional Programming Still Wins in Many Domains

Chess engines are fast and powerful, but for the most part they’re built on traditional algorithms: evaluation functions, search trees, and deterministic logic. Not deep learning. Not black-box AI.  In areas like sorting, routing, and compression, we still rely on traditional, predictable algorithms. The goal is accuracy, not creativity. That’s a good reminder that not every problem benefits from AI. In many cases, a clean, hard-coded solution is still the right tool for the job. If you want 100% accuracy that's repeatable, don't use a probabilistic AI solution.

AI is useful for chess openings, where the decision tree is too large for regular algorithms. However, the goal is not to emulate humans and as the game gets closer to the end, it makes sense to flip to traditional deterministic methodology with 100% accuracy.

## The Real Skill Is Knowing When to Trust the Tool

The key takeaway isn’t just about chess. It’s about how people use technology. AI is powerful. It sees patterns we can’t. However, these tools struggle with context. They don’t feel stress, manage tradeoffs, and sometimes they are just flat-out wrong.

The best chess players know when to follow the machine, and when to go their own way. Regardless, just the analysis provides deeper insight and there's value in that alone.

## The chess benchmark presentation

In our qualitative benchmark of AI-assisted software development, one generated puzzle video gave away the answer while the timer was still running. [Watch the chess benchmark presentation]({{ '/articles/' | relative_url }}#chess-benchmark-presentation).
