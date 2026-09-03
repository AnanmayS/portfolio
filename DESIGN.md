---
version: beta
name: Measured
description: A minimal recruiter-first personal site. Near-white ground, one saturated accent spent only on measured results, and every strong claim drawn to scale as a delta the reader can see rather than only read.
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
  intake-collapse: 1900ms
  diagram-grow: 640ms
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

## The intake collapse

The signature, and the only place a large gesture is spent. A full-width bar
representing about 35 minutes of typing collapses to the 1.4% that is 30
seconds, inside a ghost outline that preserves the original extent. It is drawn
to true scale; the drama is the real ratio, not an effect.

Everything else on the page stays quiet so this lands. If a new element competes
with it, the new element is wrong.

## Motion

Four moments, all purposeful:

1. The hero rises on load, staggered.
2. The intake bar collapses once, after a beat holding at full width.
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
- Don't turn the hero into a stats row; the collapse is the hero.
- Don't let a decorative element animate. Motion is for things that measure.
