---
version: 3
name: Quiet
description: A neutral, prose-first personal page. No accent colour, one ink, two greys, one soft panel tone, hairlines; motion only where it measures something.
colors:
  light:
    background: "#FBFBFB"
    foreground: "#171717"
    muted: "#707070"
    faint: "#9A9A9A"
    border: "#EBEBEB"
    panel: "#F2F2F2"
    chip: "#ECECEC"
  dark:
    background: "#131313"
    foreground: "#F2F2F2"
    muted: "#9A9A9A"
    faint: "#6B6B6B"
    border: "rgba(255,255,255,0.10)"
    panel: "#1C1C1C"
    chip: "#242424"
typography:
  sans:
    fontFamily: "Public Sans"
    weights: [400, 500, 600]
    usage: "Everything that is a sentence, a name, or a row"
  hand:
    fontFamily: "Caveat"
    weights: [500, 600]
    usage: "The one handwritten phrase in the intro, and nothing else"
  mono:
    fontFamily: "Geist Mono"
    weight: 400
    usage: "Dates, readouts, stacks, chips, labels inside illustrations"
layout:
  shell: 35rem
  base-size: 15px
  section-gap: 3.5rem
motion:
  enter: 640ms blur-and-rise, staggered 60ms per block
  degree-fill: 1100ms once
  art: one 6–12 s loop per project, only while on screen
---

## Overview

Quiet is built for a reader who is deciding, in under a minute, whether to
keep reading. It borrows its posture from the best personal sites: a narrow
column, small type, a few sentences that sound like a person, sections as
plain rows with a hairline between them, nothing decorated. A pill, a
paragraph or three, one bar, three roles, four projects.

The page opens as prose rather than a name and a tagline. Body copy is grey;
the words that carry weight are set in ink with a small glyph beside them,
and the role is the one handwritten phrase, which behaves like a selected
text box when clicked. The résumé and the three ways to reach out sit in a
pill fixed to the top of the window so they are never more than one glance
away.

The bar is the degree progress: drawn to scale across the whole degree with
a live readout, the first thing after the name, and the only large gesture.
Under each project row sits one looping illustration that tells that
project's story in about eight seconds. Those four things move; nothing else
does except the entrance.

## Colour

Greyscale in both themes. There is no accent. Emphasis is the foreground;
the "before" or baseline state in a comparison is `--faint` or `--border`;
fills are the foreground at five percent (`--surface`). Illustrations sit on
`--panel`, a soft grey a step below the ground, with `--border` nudged
darker inside it so hairlines still read. Chips (an email, a handle) use
`--chip`. The only non-grey is the selection blue on the handwritten phrase's
handles, borrowed from a text editor, and the Pokémon sprites in the
ShowdownRL illustration, which are Pokémon Showdown's own (public/sprites)
and are shown in their real colours because a grey Charizard is not a
Charizard. A severed feed or a dead worker is
drawn dashed, never red; so is a heartbeat that never came. `--danger` exists only for a form error.

The page follows the system theme until the reader picks one. The choice is
stamped as `data-appearance` on the root and kept in localStorage.

## Type

Public Sans at 15px, weight 400, with 500 for names and the ink words in the
intro. Geist Mono for anything that is read as a number or a label. Caveat,
once, for the role. There is no heading; the intro is the largest text on
the page at 1rem.

## Structure

The pill, the intro prose, the degree bar, then sections: Experience, Work,
and a plain footer with the links, the College Park clock, and the theme
toggle. Experience comes first because the reader is most often hiring.

Every item in the pill is drawn the same grey disc so none reads as a
selected tab; the résumé is the only one with a label, and it carries an
outward arrow because it opens a PDF. Anything that says "email" opens the
email card: a compose window with the recipient already filled in, a
subject, a message, and Send. The reader never types an address.

The degree bar has no percentage under it; the readout is the countdown to
commencement, ticking once a second like the clock in the footer.

A row is the unit. Left column eight rem wide carries the name; the body
carries a title and a right-aligned tabular date. Rows that link expand on
hover into the margin with a soft fill and an arrow. A project is a row, a
two-sentence lede, and the illustration on a rounded panel with the mono
stack line in its corner.

## Illustrations

Each is an SVG animated with CSS, greyscale, in one synchronised loop that
plays only while the figure is on screen and rests at its finished frame
under reduced motion. It shows the mechanism, not a picture of it:
Wildebeest kills a worker mid-photo and draws both recoveries to scale in
real time, three missed heartbeats against a Docker event, then refuses a
late write from a stale lease epoch; Tape
captures, loses the feed, flags the hole, replays compressed, and matches
the digest; ForgeGrid schedules seven tasks over three workers against a
one-worker baseline, loses a worker, and finishes anyway; ShowdownRL plays
four turns on a real battlefield, Charizard against Blastoise with a switch
to Venusaur, the masked policy beside it, and lands on the measured win rate
over the baseline.

## Do's and Don'ts

- Do keep the page to four projects. A fifth needs to beat one of them.
- Do keep the intro to three short paragraphs. Every ink word earns it.
- Don't add a second handwritten phrase. One is a wink; two is a theme.
- Do let a number stay in prose; the illustration is where it gets drawn.
- Don't add a colour. If something needs emphasis, it is the foreground.
- Don't animate anything that does not measure or move in the model.
- Don't add a section that is a list of claims.
