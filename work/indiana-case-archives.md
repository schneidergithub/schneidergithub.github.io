---
layout: case-study
project: indiana
link_label: "Indiana case archives"
permalink: /work/indiana-case-archives/
title: "Archiving case files across Indiana’s 92 counties"
context: "Indiana prosecutor case management · BCforward engagement"
description: "In a one-county pilot, my archive program hit a filename it couldn’t handle. I wrote a repair utility before expanding the archive statewide."
---

Through BCforward, I built the archiver for Indiana prosecutors. It moved documents and evidence from closed cases into AWS Glacier Deep Archive and automatically restored the files when a prosecutor reopened the case.

## Why I started with the oldest cases

The pilot covered cases closed for more than twenty years. Older uploads had filenames with spaces and repeated extensions that newer upload checks screened out. I changed the archiver and used the repair utility to find and correct the affected names. Then I expanded the rollout to more recently closed cases.

My estimate from the statewide rollout was hundreds of thousands of archived files per county, with storage savings of thousands of dollars per county each month.
