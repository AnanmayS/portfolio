---
version: 2
name: Quiet
description: A neutral, list-first personal page. No accent colour, one ink, two greys, hairlines; motion only where it measures something.
colors:
  light:
    background: "#FFFFFF"
    foreground: "#171717"
    muted: "#6B6B6B"
    faint: "#9A9A9A"
    border: "#EBEBEB"
  dark:
    background: "#131313"
    foreground: "#F2F2F2"
    muted: "#9A9A9A"
    faint: "#6B6B6B"
    border: "rgba(255,255,255,0.10)"
typography:
  sans:
    fontFamily: "Geist"
    weights: [400, 500]
    usage: "Everything that is a sentence, a name, or a row"
  mono:
    fontFamily: "Geist Mono"
    weight: 400
    usage: "Dates, readouts, stacks, labels inside illustrations"
layout:
  shell: 42rem
  base-size: 14.5px
  section-gap: 3rem
motion:
  enter: 640ms blur-and-rise, staggered 60ms per block
  degree-fill: 1100ms once
  art: one 6–9 s loop per project, only while on screen
---

## Overview

Quiet is built for a reader who is deciding, in under a minute, whether to
keep reading. It borrows its posture from the best personal sites: a short
column, small type, sections as plain rows with a hairline between them,
nothing decorated. Three projects, three roles, one stack line, one bar.

The bar is the degree progress: drawn to scale across the whole degree with
a live readout, the first thing after the name, and the only large gesture.
Under each project row sits one looping illustration that tells that
project's story in about eight seconds. Those four things move; nothing else
does except the entrance.

## Colour

Greyscale in both themes. There is no accent. Emphasis is the foreground;
the "before" or baseline state in a comparison is `--faint` or `--border`;
fills are the foreground at five percent (`--surface`). A severed feed or a
dead worker is drawn dashed, never red. `--danger` exists only for a form
error.

The page follows the system theme until the reader picks one. The choice is
stamped as `data-appearance` on the root and kept in localStorage.

## Type

Geist at 14.5px, weight 400, with 500 for names and the heading. Geist Mono
for anything that is read as a number or a label. The heading is the only
thing above 1rem.

## Structure

Name and one-line tagline, the degree bar, then sections: Work, Experience,
Stack, and a sticky bottom bar of links that fades the page under it.

A row is the unit. Left column eight rem wide carries the name; the body
carries a title and a right-aligned tabular date. Rows that link expand on
hover into the margin with a soft fill and an arrow. A project is a row, a
two-sentence lede, the illustration in a bordered figure, and a mono stack
line.

## Illustrations

Each is an SVG animated with CSS, greyscale, in one synchronised loop that
plays only while the figure is on screen and rests at its finished frame
under reduced motion. It shows the mechanism, not a picture of it: Tape
captures, loses the feed, flags the hole, replays compressed, and matches
the digest; ForgeGrid schedules seven tasks over three workers against a
one-worker baseline, loses a worker, and finishes anyway; ShowdownRL plays
four turns with the masked policy beside the board and lands on the
measured win rate over the baseline.

## Do's and Don'ts

- Do keep the page to three projects. A fourth needs to beat one of them.
- Do let a number stay in prose; the illustration is where it gets drawn.
- Don't add a colour. If something needs emphasis, it is the foreground.
- Don't animate anything that does not measure or move in the model.
- Don't add a section that is a list of claims.
