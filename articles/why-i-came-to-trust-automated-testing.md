---
layout: essay
title: "Why I Came to Trust Automated Testing"
author: "Aaron Schneider"
description: "Seven developers built salon software across four countries. Agreeing on what a sale should total gave us a test that caught two different prices for the same purchase."
permalink: /articles/why-i-came-to-trust-automated-testing/
---

There were seven of us, all senior developers, and we never met in person. I worked from Costa Rica. My teammates were in the United States, the Philippines and New Zealand. At ProPoint Global, we were building salon software that customers could use on their phones and staff could use to run a business. We cut some features early, told people what to expect, and shipped on time. In more than 25 years in software, that project still stands out.

It was my first real experience with continuous integration, continuous delivery and test-driven development. I had my doubts about that last part. I could spend hours writing tests for a feature before a customer could do anything with it. Then I still had to build the feature.

Our process changed. Some of us started the next set of features while others wrote automated tests for the previous sprint. We kept one habit. We agreed on the acceptance criteria and wrote them into the story. Take a file upload. “The file must be smaller than 5 MB” gives product, development and QA an answer to a very specific question. Does a file of exactly 5 MB pass? Everyone can read the story and give the same answer.

I remember the test that won me over. We offered a 15% discount on an online purchase. Our automated test followed the sale into Super Salon’s desktop register and compared the two records. One showed $19.99. The other showed $20.00. Both applications had accepted the sale. The difference only showed up when we asked whether they agreed on how much the customer had paid.

We caught it before release. Around 30,000 salons used Super Salon, and hundreds of millions of dollars in transactions ran through the platform each year. A rounding rule buried in two applications was exactly the kind of detail I wanted a test to check every time we changed checkout.

I still vary when I write a test. What I carry from that team is the conversation that comes first. Before building a discount feature, I want the people writing the story, the people programming the register and the people testing the sale to agree on the amount that should appear in both places. Senior engineers have a responsibility to help write those checks and to bring junior colleagues into the decisions behind them.

[How the checkout calculation differed]({{ '/work/super-salon-checkout/' | relative_url }}) · [Explore Guest Pass and Super Salon]({{ '/work/from-booking-to-checkout/' | relative_url }})

Adapted from [my original LinkedIn article](https://www.linkedin.com/pulse/moment-i-became-believer-automated-testing-tdd-aaron-schneider-ewzye/).
