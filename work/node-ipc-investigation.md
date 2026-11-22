---
layout: case-study
project: commondevops
permalink: /work/node-ipc-investigation/
title: "node-ipc and the evidence in the domain records"
link_label: "node-ipc investigation"
context: "CommonDevOps · Software supply-chain investigation"
description: "I led the CommonDevOps investigation into the May 2026 node-ipc incident and was the primary author of the post-incident report. We traced the domain associated with a maintainer account after three malicious releases appeared on npm."
---

## Report and recordings
{: #report-and-recordings tabindex="-1"}

- [Post-incident report on Figshare · first edition](https://doi.org/10.6084/m9.figshare.33865414.v1)
- [Interview with node-ipc creator Brandon Miller](https://www.youtube.com/watch?v=TZ04u6cj1ls)
- [Follow-up with Brandon Miller and security researcher Roni Carta](https://www.youtube.com/watch?v=eSvYhh7_Kyo)

## What a domain record can establish

The npm registry and the project repository told different stories. The registry offered three releases the repository did not show. Other investigators had already examined the packages. My question was narrower. What could we establish about the domain associated with a maintainer who had publishing access?

With help from Dr. Ian Miller and Javier Bonilla, I assembled registration and DNS records, profile captures, and the original headers of an email reply. Each answered a different question. The registration record dated the domain’s current registration. The DNS records showed where its mail was routed when we checked. The headers supported our conclusion that the reply passed through the domain’s mail service. The identity of the person writing it remained open.

I also documented our request for the registrar to preserve its records. The registrar acknowledged receipt and later explained that preservation required legal process. We could document the exchange. Whether any records were preserved remained unresolved.

## Two accounts of the response

Maintainer Brandon Miller recalled reading the incident brief, joining the public discussion, and comparing findings with people already investigating. [Hear maintainer Brandon Miller’s account at 6:54](https://www.youtube.com/watch?v=TZ04u6cj1ls&t=414s).

In the follow-up with Miller, security researcher Roni Carta explained how his team prioritized outreach by weekly package installations. Other dependencies ranked ahead of node-ipc in that queue. [Hear Carta on outreach priorities at 4:12](https://www.youtube.com/watch?v=eSvYhh7_Kyo&t=252s).

## What we published

Our evidence register distinguishes confirmed publication of malicious releases from the supported conclusion that someone misused valid publishing authority. The exact route to that authority and the operator’s identity remained unresolved. Readers can inspect the records behind each judgment in the [CommonDevOps incident report](https://commondevops.com/node-ipc-supply-chain-incident-report/).

[Report entry in Articles & Demos]({{ '/articles/' | relative_url }}#node-ipc-report).
