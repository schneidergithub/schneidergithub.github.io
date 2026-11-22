---
layout: case-study
project: propoint
link_label: "Super Salon checkout"
permalink: /work/super-salon-checkout/
title: "One sale, two totals"
context: "ProPoint Global · Super Salon"
description: "Before release, our checkout test bought eleven bottles of shampoo at a 15% discount. Super Salon’s online and desktop records came out one cent apart."
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
---

## Where the cent came from

At ProPoint, I developed software for both applications and wrote hundreds of automated tests. When we added discounts for online purchases, our test followed a sale through synchronization and compared the total at the desktop register with the amount charged online.

Both applications accepted the sale. The online calculation carried four decimal places, and the desktop calculation rounded to two. Comparing the totals caught the error before the discount feature went live.

[How a chess puzzle gave away its answer]({{ '/work/chess-puzzle-qa/' | relative_url }}).
