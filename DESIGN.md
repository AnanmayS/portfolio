---
version: 4
name: Dashboard
description: A dark, dashboard-style personal page. One painting at the top with the name over it, then two columns of bordered cards on a near-black ground; small type, hairlines, mono labels, coloured dots for status.
colors:
  dark:
    background: "#0a0b0e"
    foreground: "#e6e8ee"
    soft: "#c8ccd6"
    muted: "#8b919e"
    faint: "#6f7684"
    border: "#1f232b"
    panel: "#111318"
    plate: "#0e1014"
    chip: "#181b22"
    green: "#22c55e"
    amber: "#f59e0b"
    blue: "#3b82f6"
    sun: "#f0a868"
typography:
  sans:
    fontFamily: "Geist"
    weights: [400, 500, 600]
    usage: "Everything that is a sentence, a name, or a row"
  serif:
    fontFamily: "Newsreader"
    usage: "Page titles on the inner pages (/work and each project) only"
  mono:
    fontFamily: "Geist Mono"
    weight: 400
    usage: "Dates, stack tags, link keys, chips, the credit line, the footer"
layout:
  grid: 60rem
  column-min: 23.75rem
  gap: 0.75rem
  base-size: 13px
motion:
  enter: 640ms blur-and-rise, staggered 60ms per block
  art: one 6–12 s loop per project demo on /work, only while on screen
---

## Overview

The front page borrows the posture of an agent dashboard: a hero image with
a short line of controls over it, then a grid of small bordered cards that
read like status panels. The hero is an impressionist painting of Venice at
dusk, dimmed and faded into the page ground, with the name set large over
the glow and one button under it. Below, two columns: About, Experience and
Find me on the left; Projects on the right. The last card
in each column stretches so both columns end on the same line.

Everything on the cards is a row: a name, a mono tag at the right, one grey
line of text. Status is a 7px dot, green for current, grey for past. There
is no accent colour beyond those dots and the sun-orange eyebrow over the
name, which is pulled from the painting.

The inner pages (/work, each project) keep their gallery layout and
serif titles, on the same dark ground.

## Colour

Near-black ground, cards one step lighter, hairline borders a step above
that. Text in four greys: foreground for names, soft for body, muted for
descriptions, faint for labels. Green, amber and blue are reserved for
dots and small status marks; the sun orange appears once, over the name,
and on the small avatar in the chat.

## Type

Geist at 13px on the cards, 14px for the About paragraph. Geist Mono at
10–11px for anything that reads as a label. The name is the one large
thing on the page, at 64px.

## Illustrations

Each is an SVG animated with CSS, greyscale, in one synchronised loop that
plays only while the figure is on screen and rests at its finished frame
under reduced motion. It shows the mechanism, not a picture of it:
Wildebeest kills a worker mid-photo and draws both recoveries to scale in
real time, three missed heartbeats against a Docker event, then refuses a
late write from a stale lease epoch; Tape captures, loses the feed, flags
the hole, replays compressed, and matches the digest; ShowdownRL plays
four turns on a real battlefield, Charizard against Blastoise with a switch
to Venusaur, the masked policy beside it, and lands on the measured win rate
over the baseline; Pit Wall replays the real 2025 Hungarian Grand Prix lap by
lap to the stop that cost Piastri the win, asks what if he had stayed out,
fans 10,000 simulated finishes out from that lap and fills the bars with
where they ended; Beat the Bots plays one stretch of a round against the
32 bots, you buying from a market maker, a headline landing, the makers
pulling their quotes, the price gapping up as the bots digest the news,
and you selling to a momentum bot for +$148, the order book and your
account changing as it goes.

The pond is the exception that proves the rule: a picture, not a mechanism.
Sunlight is two layers of turbulence drifting against each other, the
terrapin's lap is a sampled ellipse with its heading taken from the tangent,
and it pauses and rests exactly as the diagrams do.

## Do's and Don'ts

- Do keep each card's text to one or two lines per row. The page is scanned, not read.
- Do keep the two columns ending on the same line; the stretch rule handles it when text changes.
- Don't add a status badge to a project. A row links to the code; that is the status.
- Don't add a second painting to the front page.
- Don't put phone numbers or anything not already public on the page.
