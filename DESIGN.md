---
version: 3
name: Quiet
description: A neutral, prose-first personal page on one screen. No accent colour, one ink, two greys, one soft panel tone, hairlines; one picture in colour; motion only where it measures something.
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
  page: 82rem
  side: 26.25rem
  split-from: 64rem
  base-size: 15px
motion:
  enter: 640ms blur-and-rise, staggered 60ms per block
  degree-fill: 1100ms once
  art: one 6–12 s loop per project, only while on screen
  pond: a 24 s lap, the same rules
---

## Overview

Quiet is built for a reader who is deciding, in under a minute, whether to
keep reading, so on a laptop there is nothing to scroll: the whole page is
one screen. It borrows its posture from the best personal sites: small type,
a few sentences that sound like a person, plain rows with a hairline between
them, nothing decorated. A pond, a name and two sentences, one line of
links, one bar, three roles on the left; three projects on the right.

The pond comes first: a diamondback terrapin, the University of Maryland's
mascot, paddling a slow lap through sunlit water, its edges feathered into
the page. It is the one picture, and the one thing in colour. Under it the
name, then prose: body copy is grey, the words that carry weight are set in
ink with a small glyph beside them, and the role is the one handwritten
phrase, which behaves like a selected text box when clicked.

The bar is the degree progress, drawn to scale across the whole degree with
a live readout. Each project card carries one looping illustration that
tells that project's story in about eight seconds. Those things and the
terrapin move; nothing else does except the entrance.

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
Charizard. The pond is in colour because it is a picture, not a diagram:
green water, a terrapin, lily pads; its palette stays inside it. A severed
feed or a dead worker is drawn dashed, never red; so is a heartbeat that
never came. `--danger` exists only for a form error.

The page follows the system theme until the reader picks one. The choice is
stamped as `data-appearance` on the root and kept in localStorage.

## Type

Public Sans at 15px, weight 400, with 500 for names and the ink words in the
intro. Geist Mono for anything that is read as a number or a label. Caveat,
once, for the role. The name is the page's one heading, at 1.0625rem; the
only larger type is each project's number.

## Structure

From 64rem the page splits. The left column, 26.25rem, holds the person:
the pond, the name and two sentences, one line of links, the degree bar,
and Experience. The right holds Work, with the College Park clock and the
theme toggle in its header. Below 64rem it is one column in the same order,
Work last.

The links are one line of small grey pills: Résumé, with an outward arrow
because it opens a PDF; Email me, the one filled pill, because it is the
one that starts a conversation; the GitHub handle; LinkedIn. Email me opens
the email card: a compose window with the recipient already filled in, a
subject, a message, and Send. The reader never types an address.

The degree bar has no percentage under it; the readout is the countdown to
commencement, ticking once a second like the clock above the work.

A role is a row: company and short title, a right-aligned tabular date, and
one grey line saying what came of it. A project is a card on the panel
tone: the illustration on the left, and on the right its name and year, one
sentence, the number that says it works, and the mono stack line. When the
column is too narrow for both, the illustration moves on top.

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
over the baseline.

The pond is the exception that proves the rule: a picture, not a mechanism.
Sunlight is two layers of turbulence drifting against each other, the
terrapin's lap is a sampled ellipse with its heading taken from the tangent,
and it pauses and rests exactly as the diagrams do.

## Do's and Don'ts

- Do keep the page to three projects. A fourth needs to beat one of them.
- Do keep the intro to two short sentences under the name. Every ink word earns it.
- Do keep the page to one screen on a laptop. Anything new has to fit or replace something.
- Don't add a second handwritten phrase. One is a wink; two is a theme.
- Do give each project one number, the one that says it works; the illustration is where it gets drawn.
- Don't add a colour. If something needs emphasis, it is the foreground. The pond is the one picture; don't add a second.
- Don't animate anything that does not measure or move in the model.
- Don't add a section that is a list of claims.
