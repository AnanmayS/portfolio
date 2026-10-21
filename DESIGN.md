---
version: 5
name: Plates
description: Cream laid paper, one blue ink, a fine grain. An engraved plate of the Chesapeake opens the front page with the name and a few lines in its sky; the projects and the work history follow as cards with a double rule, with a split-flap clock counting down to graduation beside them. The demos play on plates of solid ink.
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
    usage: "The name, the italic tagline, section and project titles, every number"
  sans:
    fontFamily: "Geist"
    weights: [400, 500]
    usage: "Everything that is a sentence or a row"
  mono:
    fontFamily: "Geist Mono"
    weight: 400
    usage: "Inside the demos only"
layout:
  wrap: 66rem
  grid: 12 columns, 0.875rem gap
  plate: "max(min(86vh, 48.75rem), the image's own height at this width)"
  base-size: 15px
motion:
  load: the name and its lines rise 14px, staggered 70ms, transform only, while every clock card turns over to its number
  parallax: the plate drifts at 0.22 of scroll
  hover: a linked card's border darkens; nothing moves
  countdown: each digit card turns over when it changes, 280ms down then 280ms up
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

Under the name: one line on what he builds, two sentences on what he likes,
and three links. That is the whole introduction; there is no About card.

The cards follow, on 90% paper with a blur, a hairline border and an inner
rule like a mount, pulling up over the water and continuing on the paper:
the five projects, each a name, one quick sentence, its one number set large
in the serif, and a short stack. The work history follows as plain rows on
the paper, one sentence per role; only the projects get the mount. Nothing
on the page is said twice, so there is no card of links (the hero has them).

In the blank sky at the right of the name, a split-flap clock counts down
to commencement: paper cards with ink digits in the serif, a hairline hinge
across each, days, hours, minutes and seconds, one plain line above it. The server renders the cards blank,
so the first thing a visitor sees is every card turning over to the right
number, and then the seconds keep turning. On a phone it sits under the
links. The date lives in content.ts.

On /work each project is a plate too, its demo on a panel of solid ink inside
the card. Inside that panel the tokens flip to light-on-dark, so the demos
keep the drawing they were made with.

## Colour

Paper, one ink, and four steps of the ink for softer text. Hairlines are the
ink at 16% and 34%. The only other colours are the green and the coral inside
the demos, for what went right and wrong, and they never appear on the paper.

## Type

Newsreader for anything that is a title or a number: the name at up to 96px,
set roman, the italic tagline, the plate names, the metrics. Geist for
everything else, down to 13px for dates, stacks and the clock's labels, in
sentence case, never tracked out. No caps labels, no arrows on links, no
middle dots: lists are written with commas.

## Motion

One moment on load: the name and its lines settle while the clock turns
over to the right numbers, with transform only, so a paused frame still
reads. Nothing else moves on its own; a card answers hover by darkening its
border. The plate's parallax and the flaps' turning stop under reduced
motion; the clock still counts.

## Do's and Don'ts

- Do keep the ink single. A second colour on the paper breaks the print.
- Do keep the grain at 10% and in CSS, never baked into the plate.
- Do generate any new plate in greyscale and let the filter tint it.
- Don't put text over the busy part of the plate; the fog marks the sky that is safe.
- Don't add a status badge to a project. Its card links to the page; that is the status.
- Don't name things the way a museum would. No "Plate I", no eyebrow labels anywhere; a name, a sentence, a number.
- Don't add motion that answers nothing: no scroll reveals, no hover lifts, no counting numbers.
- Do write every sentence so it can be read in one breath.
- Don't put phone numbers or anything not already public on the page.
