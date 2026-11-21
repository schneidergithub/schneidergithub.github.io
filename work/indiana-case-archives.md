---
layout: case-study
project: indiana
link_label: "Archiving case files across 92 Indiana counties"
permalink: /work/indiana-case-archives/
title: "Archiving case files across Indiana’s 92 counties"
context: "Indiana prosecutor case management · BCforward engagement"
description: "I built a program that moved files from long-closed criminal cases into lower-cost storage and automatically restored them when a prosecutor reopened the case."
---

## Closing the case changed where its files belonged

Indiana’s prosecutors needed to retain documents and evidence after a criminal case closed. Keeping every file in active storage carried a recurring cost. Through BCforward, I wrote the program that moved eligible files into AWS Glacier Deep Archive. Case status drove the return path, too. Reopening a case triggered restoration of its archived files.

## What one county taught me

I started in one county with cases that had been closed for more than twenty years. That first run exposed a filename the program could not handle. Older uploads could contain spaces and repeated file extensions, even though the current upload checks screened for those patterns.

I refactored the archive program and wrote a separate utility to find and correct the affected filenames. Starting with the oldest cases brought that legacy data into the pilot, while the rollout was still small enough to adjust. I then extended the program to more recently closed cases and rolled it out statewide.

## Rollout and storage savings

| Measure | Project result |
| --- | --- |
| County coverage | 92 Indiana counties |
| Files archived | Hundreds of thousands per county |
| Storage savings | Thousands of dollars per month per county |

Automatic restoration was what made the savings practical. A closed case could spend years in lower-cost storage, and the case-management workflow could bring its files back when they were needed again.
