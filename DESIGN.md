---
version: 5
name: Plates
description: Cream laid paper, one blue ink, a fine grain. An engraved plate of the Chesapeake opens the front page with the name in its sky; the content follows as mounted plates, cards with a double rule. The demos play on plates of solid ink.
colors:
  light:
    paper: "#f1ece0"
    paper-deep: "#e8e2d1"
    card: "rgba(243,239,229,.9)"
    ink: "#1e3570"
    soft: "#3a4a86"
    muted: "#66719a"
    faint: "#949cb8"
    rule: "rgba(30,53,112,.16)"
    rule-strong: "rgba(30,53,112,.34)"
    plate: "#16274f"
    ok: "#2f7d5b"
    bad: "#b5533c"
typography:
  serif:
    fontFamily: "Newsreader"
    weight: 400
    usage: "The name, the italic tagline, section and project titles, every metric"
  sans:
    fontFamily: "Geist"
    weights: [400, 500]
    usage: "Everything that is a sentence or a row"
  mono:
    fontFamily: "Geist Mono"
    weight: 400
    usage: "Labels in small caps, dates, stacks, the clock, the colophon"
layout:
  wrap: 66rem
  grid: 12 columns, 0.875rem gap
  plate: "max(min(86vh, 48.75rem), the image's own height at this width)"
  base-size: 15px
motion:
  load: the name and its lines rise 14px, staggered 70ms, transform only
  reveal: cards below the fold rise 22px as they arrive, 70ms apart in a batch
  parallax: the plate drifts at 0.22 of scroll
  metric: counts up to itself when its card arrives, 1.1s ease-out
  hover: a linked card lifts 3px and its arrow slides right
  art: one 6–12 s loop per project demo, only while on screen
---

## Overview

The site is set on cream laid paper in one blue ink, with a fine grain over
everything. The front page opens on a full-bleed steel engraving of the
Chesapeake Bay (a screw-pile lighthouse, a skipjack, a far shore with a
steeple and a water tower, a pine at the right) with the name set in the
plate's blank sky and a soft breath of paper behind it. The print is sepia on
disk; an SVG duotone filter tints it to the page's ink and paper in the
browser, so the plate can never drift from the type.

The content follows as a deck of mounted plates: cards on 90% paper with a
blur, a hairline border and an inner rule like a mount, that pull up over the
water and continue on the paper. About and Now first; then the five projects,
numbered Plate I to V like the plates in a book, each with the number that
says it works set large in the serif; then Experience and Elsewhere.

On /work each project is a plate too, its demo on a panel of solid ink inside
the card. Inside that panel the tokens flip to light-on-dark, so the demos
keep the drawing they were made with.

## Colour

Paper, one ink, and four steps of the ink for softer text. Hairlines are the
ink at 16% and 34%. The only other colours are the green and the coral inside
the demos, for what went right and wrong, and they never appear on the paper.

## Type

Newsreader for anything that is a title or a number: the name at up to 96px,
the italic tagline, the plate names, the metrics. Geist for sentences and
rows at 14–16px. Geist Mono at 10.5–11.5px for labels (small caps,
letter-spaced), dates, stacks and the clock.

## Motion

Nothing waits invisible. The hero rises on load with transform only, so a
paused frame still reads. Cards already on screen at hydration are left as
the server rendered them; only the ones below the fold get the rise, and
the classes come off again once they have arrived. The plate's parallax, the
count-up and the pulse on the Now dot all stop under reduced motion.

## Do's and Don'ts

- Do keep the ink single. A second colour on the paper breaks the print.
- Do keep the grain at 10% and in CSS, never baked into the plate.
- Do generate any new plate in greyscale and let the filter tint it.
- Don't put text over the busy part of the plate; the fog marks the sky that is safe.
- Don't add a status badge to a project. Its card links to the page; that is the status.
- Don't put phone numbers or anything not already public on the page.
