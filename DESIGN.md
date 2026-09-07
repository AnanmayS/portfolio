---
version: beta
name: Measured
description: A minimal recruiter-first personal site in dark and light. One saturated accent spent only on measured results, and every strong claim drawn to scale as a mark the reader can see rather than only read.
colors:
  dark:
    ground: "#0F1216"
    surface: "#171B21"
    ink: "#E8EBEF"
    muted: "#AAB2BD"
    faint: "#838C99"
    rule: "#262C34"
    slow: "#39424D"
    accent: "#7B93FF"
    on-accent: "#0F1216"
  light:
    ground: "#FAFAFB"
    surface: "#F1F2F5"
    ink: "#14181D"
    muted: "#4C545F"
    faint: "#6A7280"
    rule: "#E2E5EA"
    slow: "#BCC3CD"
    accent: "#2743E8"
    on-accent: "#FFFFFF"
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
minute, whether to keep reading. The organizing idea comes from the work
itself — nearly every strong line about it is a measured delta (2.5 s to 1.0 s,
4 hours to 95 minutes, 59% faster, 79% over 1,000 matches). So the page does
not just state those numbers. Each project is a working model of the real
mechanism that the reader operates in the browser, and each number is a claim
that opens to the run it came from. The reader sees the size of the improvement
by causing it.

Minimal here means precise, not sparse: separation is carried by space first,
hairlines only where a row genuinely needs an edge, and a single accent.

## Colors

Near-monochrome in both themes, with one saturated accent.

Dark is the default and lives on bare `:root`; light is the override, keyed on
`data-appearance="light"` on the root element. The attribute is deliberately
not `data-theme`: some hosts stamp that themselves, and would override the
reader's own choice. An explicit choice is stored in `localStorage` and applied
by a tiny script before first paint, so a reader who picked light never sees a
flash of dark.

Every colour is declared as a token in the bare `:root` block and only
redefined in the light block. Nothing is styled with a literal, so both themes
resolve as a complete set — this is why the diagrams invert correctly without
having any theme logic of their own.

The accent shifts between themes rather than staying fixed: cobalt on light,
lifted to a paler blue on dark so it keeps its contrast against a dark ground.
`--on-accent` carries the text colour that sits on top of the accent, which
flips from white to near-black; it is never assumed.

The accent is reserved for a measured result and nothing else: the degree bar,
the flagged gaps in Tape, the 59% mark, the win rate, the resume action, focus
rings, and link hover.

`--slow` is the deliberate neutral for the un-improved side of a comparison. It
must stay visibly distinct from `--rule` in both themes, or the baseline reads
as an empty track instead of the slow run.

## Typography

Three roles. Familjen Grotesk speaks and is used with restraint — the name,
entry titles, the closing line. Schibsted Grotesk carries all reading text.
Azeret Mono is the measuring voice: anything that is a date, a label, a stack,
an action, or a number read off a run.

## Structure

Single column, 44rem, ordered so the work leads: who and how to reach them, a
one-line "currently" strip read from GitHub at build, then the projects as
runnable demos with the question each one answers, then the smaller things by
name, then experience, then the stack measured from the repos, then contact.

Each project entry is: name and year, the question it answers in italic, a
lede whose numbers are claims (dotted accent underline, a tiny mono label)
that open an evidence drawer, the demo in the bordered figure, then the stack
as chips.

Experience uses short bullets rather than prose. A reader scanning for scope
should not have to parse a paragraph.

A quiet fixed bar appears once the hero scrolls away, keeping the resume and
email one click from anywhere on the page. It is function, not chrome — nothing
lives in it that is not an action.

## Degree progress

Once the signature; now a single hairline under the hero actions, because the
demos are the page's gesture and the bar would compete with them. It still
answers the question a recruiter has first — when is this person available —
with a bar drawn to scale across the whole degree, 28 August 2024 to an
expected 18 May 2028, and a readout that counts down live beside it.

The bar alone would look static: it advances about 0.07% a day, far below what
a viewer can see. The readout is what makes it read as live, so the two are one
device, not a bar with a decoration attached. Both endpoints are real dates —
the first day of term and expected commencement — so the figure is not an
estimate. Both stay labelled on the page so the span it is measured against is
always visible.

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

The demos are allowed to be louder than this; nothing else on the page is.

## Motion

Four moments on the page itself, all purposeful:

1. The hero rises on load, staggered.
2. The degree bar fills once on load, then only its readout changes.
3. The fixed bar slides in past the hero.
4. Dialogs (contact, evidence, command palette) rise in.

Inside a demo, motion is only ever the model moving: a build running, a feed
replaying, a turn advancing, a book being hit. Nothing decorative animates.
Every demo reads `prefers-reduced-motion` and steps instead of animating.

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
- Don't style anything with a colour literal; both themes resolve through
  tokens, and a literal breaks one of them.
- Don't turn the hero into a stats row; the work is the hero.
- Don't state a number in a lede without an evidence entry behind it.
- Don't add a demo that shows a picture of the mechanism; it has to run it.
- Don't let a decorative element animate. Motion is for things that measure.
- Don't reach for `data-theme`; this page owns `data-appearance`.
