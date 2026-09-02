---
version: beta
name: Continuous Feed
description: A printout-paper personal site. Cool off-white sheet, slab display type against a humanist sans, monospace as the instrument voice, and one annotation red reserved for the live head of the record.
colors:
  paper: "#EDEFE8"
  paper-deep: "#E4E7DD"
  bar: "#D5DEC9"
  ink: "#191E1A"
  ink-soft: "#59615A"
  ink-faint: "#838C82"
  rule: "#C6CDBF"
  rule-soft: "#D7DCD0"
  flag: "#A8322C"
typography:
  display:
    fontFamily: "Zilla Slab, Georgia, serif"
    fontWeight: 700
    usage: "Name, section entries, project titles, dialog headings"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontWeight: 400
    usage: "Descriptions, notes, skill values"
  utility:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontWeight: 400
    usage: "Dates, rails, metrics, tool lists, section labels, all diagram annotation"
layout:
  shell-max-width: 47rem
  rail: 5.75rem
  page-gutter: 1.25rem
motion:
  feed-duration: 900ms
  pulse-duration: 2.4s
---

## Overview

Continuous Feed treats the page as a printout rather than a screen. The
organizing idea comes from the work itself: every project here exists to make a
system's behaviour inspectable after the fact — a feed you can replay
byte-for-byte, a build that proves what it skipped, an agent whose win rate
traces back to saved logs. So the site is built as a record, not a brochure.

This replaces the earlier "Quiet Desktop Personal Page" direction, which the
site had already drifted away from and which conflicted with the product brief's
instruction to avoid generic dark developer-site patterns.

## Colors

Nearly everything is paper, ink, and rule. The palette is a cool off-white with
a green cast — deliberately not the warm cream that reads as a default — and ink
carries a green undertone rather than being pure black.

- **Paper (#EDEFE8):** the page.
- **Paper deep (#E4E7DD):** the record strip's sheet and the preview panels, so
  diagrams read as objects placed on the page.
- **Bar (#D5DEC9):** the banding inside the record strip only. It encodes years.
  Do not use it as a general surface.
- **Flag (#A8322C):** the only accent. It means "look here" and nothing else:
  the live head of the record, the flagged gaps in the Tape diagram, focus
  rings, and link hover. Spending it anywhere else weakens all four.

## Typography

Three roles, deliberately not interchangeable:

- **Zilla Slab** is the voice. It is a technical slab, not a fashion serif, and
  it carries the name and every entry title.
- **Public Sans** is the substance. It stays quiet so descriptions read easily
  at length.
- **Space Mono** is the instrument. Anything that is a reading off a machine —
  dates, metrics, tool lists, diagram annotation, section labels — is set in it.

The mono runs wide. Assume roughly 0.6em per character when fitting it into a
fixed column, and stack rather than justify when two mono strings share a row.

## Structure

A single column with a left rail. The rail is not decoration: in Experience it
carries the time axis (year, then month span), and in Selected work it carries
the project's primary language. Both are real data a reader scans for. Do not
put sequence numbers there — the entries are not a sequence.

Section labels are small uppercase mono with wide tracking. Entries are
separated by hairlines and nothing else.

## The record strip

The signature element, and the one place complexity is spent. It is a
continuous-feed sheet: tear-off sprocket margins with perforations, year bands
as the time axis, one lane per role, and a red head marking now.

On load the sheet feeds left to right over 900ms, revealing the bands, bars and
finally the head. The cursor line then stays solid while only the small
recording indicator blinks, so the accent never sits washed out. Under
`prefers-reduced-motion` the strip renders fully drawn and still.

Keep everything around it quiet. If something new competes with the strip for
attention, the strip is not the problem.

## Quality floor

- Responsive to 390px. Wide diagrams (the strip, the project previews) scroll
  inside their own container rather than scaling their type into nothing; the
  page body never scrolls horizontally.
- Visible keyboard focus in flag red on every interactive element.
- `prefers-reduced-motion` respected globally.
- Diagrams carry a descriptive `aria-label`, and never carry information that
  appears nowhere else on the page.

## Do's and Don'ts

- Do derive diagram content from real numbers in the résumé.
- Do keep the accent scarce enough that a single red mark reads as a signal.
- Do let mono do the machine-reading and slab do the speaking.
- Don't add a second accent colour.
- Don't reintroduce a dark canvas; the product brief rules out generic dark
  developer-site patterns.
- Don't decorate the rail. If it isn't data, it doesn't go there.
