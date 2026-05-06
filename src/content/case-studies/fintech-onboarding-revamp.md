---
title: "Fintech Onboarding Revamp"
slug: "fintech-onboarding-revamp"
summary: "Redesigned onboarding flow to improve first-deposit conversion and reduce support friction."
tags: ["fintech", "onboarding", "conversion"]
featured: true
publishedAt: "2026-04-03"
role: "Lead Product Designer"
timeline: "4 months"
impact: "+21% first-deposit conversion, -34% onboarding support tickets"
tools: ["Figma", "Amplitude", "Maze", "Notion"]
visibility: "public"
domain: "Fintech"
capabilityTags: ["Research", "Strategy", "UX/UI", "Prototyping"]
---
## Context
Consumer fintech app had strong acquisition but low activation in the first week.

## Problem
New users were blocked by unclear identity verification steps and unclear progress.

## Role and constraints
I led product design with one PM and five engineers. Compliance requirements limited how much we could simplify KYC.

## Strategic artifacts
- Problem framing document aligned legal, operations, and product risks.
- JTBD map split user intent between "quick sign-up" and "account trust setup".
- North-star metric focused on first successful deposit within 72 hours.

## Design artifacts
- Rebuilt onboarding architecture into three progressive phases.
- Added contextual education cards only at moments of confusion.
- Introduced a reusable status component to surface verification state.

## Proof artifacts
- Before and after funnel showed meaningful drop-off recovery at document upload.
- Stakeholder quote: "This is the first onboarding review where legal approved without multiple rounds."
- Shipped in release v5.11 with phased rollout.

## Decision narrative
We chose progressive disclosure over single-screen completion. Trade-off: one extra step for some users; gain: significantly lower error rate and abandonment.

## Outcome and learnings
Outcome improved conversion and support efficiency while keeping compliance intact. Key learning: compliance-heavy flows still benefit from interaction pacing and trust signals.
