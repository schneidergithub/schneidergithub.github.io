---
layout: case-study
project: propoint
link_label: "Catching a one-cent checkout error at Super Salon"
permalink: /work/super-salon-checkout/
title: "One sale, two totals"
context: "ProPoint Global · Super Salon"
description: "A pre-release test bought eleven bottles of shampoo at a 15% discount. Super Salon’s online and desktop applications recorded the same sale one cent apart."
figure_heading: "The two Super Salon applications"
figures:
  - image: /assets/portfolio/supersalon.webp
    width: 1958
    height: 1104
    alt: "Super Salon desktop point-of-sale screen with line items and transaction controls."
    caption: "The desktop point of sale recorded sales synchronized from the online application."
  - image: /assets/portfolio/a03-calendar-large-orig.webp
    width: 1024
    height: 1001
    alt: "Super Salon web calendar showing appointments by stylist and checkout status."
    caption: "The SaaS calendar shows a different part of the same product. Staff could see which appointments were ready for checkout and which had already been paid."
---

## Following the sale past checkout

At ProPoint, I developed software for both the salon desktop application and its SaaS counterpart. I also programmed credit-card terminals and barcode scanners, and wrote hundreds of automated tests across the product stack. A sale could begin online and end up in a salon’s desktop records. That gave us two places to check what the customer had paid.

When the team introduced discounts for online purchases, an automated test applied the discount, recorded the sale in the SaaS application, and compared it with the desktop record after synchronization. Both applications accepted the sale. Comparing the amounts exposed the defect.

## Where the cent came from

The online application carried four decimal places through the calculation. The desktop software rounded to two. The difference became visible on the discounted multi-item purchase, and the team caught it before the feature went live.

Super Salon served tens of thousands of salons and handled more than $300 million in annual transactions. For the salon closing its books, the relevant question was simpler. Did the desktop record agree with the amount charged online? Testing the full trip through synchronization let us answer that question before release.

I used the same question when reviewing a generated chess video. The file played, but what did the viewer actually see before the timer expired? [Read the chess puzzle QA case]({{ '/work/chess-puzzle-qa/' | relative_url }}).
