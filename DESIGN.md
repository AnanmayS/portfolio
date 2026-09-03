---
version: beta
name: Measured
description: A minimal recruiter-first personal site. Near-white ground, one saturated accent spent only on measured results, and every strong claim drawn to scale as a mark the reader can see rather than only read.
colors:
  ground: "#FAFAFB"
  surface: "#F1F2F5"
  ink: "#14181D"
  muted: "#4C545F"
  faint: "#6A7280"
  rule: "#E2E5EA"
  slow: "#BCC3CD"
  accent: "#2743E8"
  accent-ink: "#1C33B8"
typography:
  display:
    fontFamily: "Familjen Grotesk"
    fontWeight: 700
    usage: "Name, entry titles, closing line"
  body:
    fontFamily: "Schibsted Grotesk"
    fontWeight: 400
    usage: "Lead, bullets, project ledes, skill values"
  utility:
    fontFamily: "Azeret Mono"
    fontWeight: 400
    usage: "Dates, section labels, stacks, actions, all diagram annotation"
layout:
  shell: 44rem
  gutter: 1.5rem
  radius: 4px
  block-gap: 5.5rem
motion:
  degree-fill: 1100ms
  diagram-grow: 640ms
  readout: every animation frame (60s under reduced motion)
---

## Overview

Measured is built for one reader in a hurry: someone deciding, in well under a
minute, whether to keep reading. The organizing idea comes from the resume
itself — nearly every strong line on it is a measured delta (35 minutes to 30
seconds, 4 hours to 95 minutes, 59% faster, 79% over 1,000 matches). So the page
does not just state those numbers. It draws them to scale, and the reader sees
the size of the improvement before they finish reading the sentence.

Minimal here means precise, not sparse: separation is carried by space first,
hairlines only where a row genuinely needs an edge, and a single accent.

## Colors

Near-monochrome. A cool near-white ground, blue-black ink, and one saturated
cobalt.

The accent is reserved for a measured result and nothing else: the collapsed
intake bar, the flagged gaps in Tape, the 59% mark, the win rate, the resume
action, focus rings, and link hover. If it starts appearing on decoration it
stops reading as a signal.

`--slow` is the deliberate neutral for the un-improved side of a comparison. It
must stay visibly darker than `--rule`, or the baseline reads as an empty track
instead of the slow run.

## Typography

Three roles. Familjen Grotesk speaks and is used with restraint — the name,
entry titles, the closing line. Schibsted Grotesk carries all reading text.
Azeret Mono is the measuring voice: anything that is a date, a label, a stack,
an action, or a number read off a run.

## Structure

Single column, 44rem, ordered the way a recruiter reads: who and how to reach
them, then the signature measurement, then experience, then work with evidence,
then stack, then contact.

Experience uses short bullets rather than prose. A reader scanning for scope
should not have to parse a paragraph.

A quiet fixed bar appears once the hero scrolls away, keeping the resume and
email one click from anywhere on the page. It is function, not chrome — nothing
lives in it that is not an action.

## Degree progress

The signature, and the only place a large gesture is spent. A bar drawn to
scale across the whole degree — September 2024 to an expected May 2028 — with a
readout that counts down live beside it.

The bar alone would look static: it advances about 0.07% a day, far below what
a viewer can see. The readout is what makes it read as live, so the two are one
device, not a bar with a decoration attached. Both ends are labelled on the
page because the start date is an assumption drawn from the earliest UMD date
on the resume, not something the resume states.

The percentage carries nine decimals because progress advances 8.6e-7 percent
a second: fewer places and the figure sits still. The leading two decimals stay
at full strength and the fine tail is dimmed, so the number reads as "54.14"
with live precision behind it rather than as noise. Updates are written
straight to the DOM, not through state, so a per-frame counter does not
re-render the tree sixty times a second.

It also answers the question a recruiter has first: when is this person
available.

The readout is the only thing on the page that changes on its own. Under
`prefers-reduced-motion` it drops to two decimals and whole days and updates
once a minute — a spinning number is motion too. Screen readers are given one
steady figure rather than a moving one.

Everything else stays quiet so this lands. If a new element competes with it,
the new element is wrong.

## Motion

Four moments, all purposeful:

1. The hero rises on load, staggered.
2. The degree bar fills once on load, then only its readout changes.
3. Project diagrams draw in when scrolled into view.
4. The fixed bar slides in past the hero.

The reveal CSS is written so the un-classed state is the finished state: if the
IntersectionObserver never runs, diagrams render complete rather than staying
invisible. Under `prefers-reduced-motion` everything lands immediately.

## Quality floor

- Responsive to 390px. Diagrams scroll inside their own bordered figure rather
  than scaling their type below legibility; the page never scrolls sideways.
- All small mono text meets WCAG AA against the ground (measured at 4.65:1);
  body text is far above it.
- Visible keyboard focus in the accent on every interactive element.
- Every diagram carries a descriptive `aria-label` and repeats nothing that is
  unavailable in text.

## Do's and Don'ts

- Do draw a number to scale rather than enlarging its type.
- Do keep the accent scarce enough that one blue mark reads as the answer.
- Do write experience as short bullets a scanner can skim.
- Don't add a second accent, a gradient, or a shadow that is not the dialog's.
- Don't turn the hero into a stats row; the degree bar is the hero.
- Don't let a decorative element animate. Motion is for things that measure.
