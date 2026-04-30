---
version: alpha
name: Quiet Desktop Personal Page
description: A minimal, nostalgic personal portfolio identity inspired by compact personal websites, with a narrow centered column, matte black canvas, soft gray text, white widget cards, small folder icons, and restrained playful controls.
colors:
  primary: "#F5F5F5"
  on-primary: "#111111"
  secondary: "#27272B"
  on-secondary: "#D6D6D8"
  tertiary: "#EFFF3C"
  on-tertiary: "#0D0D0D"
  success: "#47C36C"
  on-success: "#0D0D0D"
  background: "#0D0D0D"
  background-light: "#F4F2ED"
  on-background: "#F4F4F4"
  on-background-light: "#111111"
  surface: "#F5F5F5"
  surface-2: "#E9E9EC"
  surface-dark: "#111111"
  surface-control: "#27272B"
  surface-control-light: "#D8D3C8"
  text: "#F4F4F4"
  text-inverse: "#141414"
  muted: "#8C8C91"
  muted-light: "#67676F"
  faint: "#59595F"
  faint-light: "#8A8A91"
  line: "#2A2A2D"
  line-light: "#D7D2C8"
  folder-border: "#A9A9B0"
  folder-fill: "#F8F8F8"
  selection: "#EFFF3C"
typography:
  wordmark:
    fontFamily: "Avenir Next, Manrope, Trebuchet MS, sans-serif"
    fontSize: 20px
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: -0.06em
  headline-sm:
    fontFamily: "Avenir Next, Manrope, Trebuchet MS, sans-serif"
    fontSize: 18px
    fontWeight: 900
    lineHeight: 1.3
    letterSpacing: 0em
  title-md:
    fontFamily: "Avenir Next, Manrope, Trebuchet MS, sans-serif"
    fontSize: 15px
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: -0.04em
  body-md:
    fontFamily: "Avenir Next, Manrope, Trebuchet MS, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  body-sm:
    fontFamily: "Avenir Next, Manrope, Trebuchet MS, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label-md:
    fontFamily: "Avenir Next, Manrope, Trebuchet MS, sans-serif"
    fontSize: 14px
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: 0em
  label-sm:
    fontFamily: "Avenir Next, Manrope, Trebuchet MS, sans-serif"
    fontSize: 11px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: 0em
  label-caps:
    fontFamily: "Avenir Next, Manrope, Trebuchet MS, sans-serif"
    fontSize: 6.5px
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: 0.24em
  clock:
    fontFamily: "Courier New, Monaco, monospace"
    fontSize: 17px
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: -0.12em
spacing:
  none: 0px
  hairline: 1px
  xxs: 4px
  xs: 8px
  sm: 10px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 28px
  4xl: 34px
  5xl: 40px
  shell-width: 360px
  shell-width-large-text: 500px
  page-gutter: 16px
  section-gap: 34px
  widget-gap: 8px
  folder-gap: 24px
rounded:
  none: 0px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 18px
  full: 9999px
radii:
  none: "{rounded.none}"
  xs: "{rounded.xs}"
  sm: "{rounded.sm}"
  md: "{rounded.md}"
  lg: "{rounded.lg}"
  full: "{rounded.full}"
shadows:
  none: "none"
  widget: "0 18px 44px rgba(0, 0, 0, 0.32)"
  widget-light: "0 16px 36px rgba(20, 20, 20, 0.12)"
  success-glow: "0 0 0 4px rgba(71, 195, 108, 0.22)"
elevation:
  page:
    backgroundColor: "{colors.background}"
    shadow: "{shadows.none}"
    borderColor: "{colors.line}"
  widget-card:
    backgroundColor: "{colors.surface}"
    shadow: "{shadows.widget}"
    borderColor: "{colors.surface}"
  text-note:
    backgroundColor: transparent
    shadow: "{shadows.none}"
    borderColor: "{colors.line}"
motion:
  duration-fast: 160ms
  duration-standard: 180ms
  easing-standard: "ease"
  hover-lift-distance: -2px
  pulse-duration: 1.8s
layout:
  shell-max-width: 360px
  widget-columns: 2
  folder-columns-desktop: 4
  folder-columns-mobile: 2
  folder-width: 58px
  folder-height: 40px
components:
  page-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    width: "{spacing.shell-width}"
  wordmark:
    textColor: "{colors.text}"
    typography: "{typography.wordmark}"
  display-control:
    backgroundColor: "{colors.surface-control}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.full}"
    height: 32px
    padding: 5px 10px
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
  widget-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.lg}"
    padding: 12px 14px
  widget-label:
    textColor: "{colors.faint}"
    typography: "{typography.label-caps}"
  folder-icon:
    backgroundColor: "{colors.folder-fill}"
    textColor: "{colors.faint}"
    rounded: "{rounded.none}"
    width: 58px
    height: 40px
  project-note:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    rounded: "{rounded.none}"
    padding: 0 0 0 12px
  availability:
    backgroundColor: transparent
    textColor: "{colors.success}"
    typography: "{typography.label-md}"
  mail-link:
    backgroundColor: transparent
    textColor: "{colors.tertiary}"
    typography: "{typography.label-md}"
---

## Overview

Quiet Desktop Personal Page is a compact, nostalgic portfolio design system. It borrows from small personal websites, lightweight desktop widgets, and low-key “about me” pages rather than corporate portfolio templates.

The page should feel intimate and useful: a narrow column floating on a matte black canvas, small type, muted gray text, clipped lists, folder icons for projects, and a few playful controls. The goal is not visual spectacle. The goal is to make the site feel hand-built, memorable, and easy to scan.

## Colors

The color system is deliberately sparse.

- **Background (#0D0D0D):** The main dark canvas. It should feel almost black but not completely flat.
- **Surface (#F5F5F5):** Used for the small widget cards at the top of the page.
- **Muted Gray (#8C8C91):** The dominant text color for body copy and section content.
- **Faint Gray (#59595F):** Used for folder labels, metadata, and lower-priority details.
- **Yellow (#EFFF3C):** Used sparingly for contact affordances and folder hover accents.
- **Green (#47C36C):** Used for availability and positive status only.

Do not introduce a large accent palette. This design works because nearly everything is gray, with only small flashes of yellow or green.

## Typography

Typography should feel casual but confident. Use a sans-serif stack with heavy weights for names, labels, and project titles. Body copy should stay small, gray, and readable.

- The wordmark is heavy and tightly tracked.
- Section headings are lowercase with a colon.
- Lists use plain hyphen prefixes instead of decorative bullets.
- Widget labels are tiny uppercase text with wide tracking.
- The clock uses a monospace-like fallback to feel like a desktop widget.

Avoid large marketing-style hero typography. The site should feel like a personal page, not a SaaS landing page.

## Layout

The layout is a single centered column with a maximum width around 360px. This narrowness is central to the identity.

Top-level sections are stacked vertically with modest spacing. The widgets use a two-column grid, with the “last shipped” card spanning both columns. Projects start with a row of small folder icons, then expand into compact text notes.

On mobile, preserve the narrow-column feel but let folder icons wrap into two columns.

## Elevation & Depth

Depth is used only for widget cards. The white cards should look like small physical objects placed on the dark page. Text sections and project notes should remain flat.

Hover states use tiny movement only: one or two pixels of lift is enough. Avoid heavy card systems, glassmorphism, large gradients, or dramatic shadows.

## Shapes

Widget cards use soft 18px corners. Controls use full pill rounding. Folder icons are intentionally square and pixel-like, with a tab and simple border.

The contrast between rounded widgets and blocky folders is part of the charm. Do not round the folder icons into app icons.

## Components

### Header

The header is a simple row: wordmark on the left, display controls on the right. The controls are small pills and should feel like personal-site toys rather than serious app settings.

### Navigation

Navigation is plain text. It should be lowercase, muted, and small. No sticky bar is needed for this design.

### Widgets

The widget cards are the highest-contrast elements. They use white surfaces, black text, small uppercase labels, and soft shadows. Keep content short.

### Sections

Sections use lowercase headings ending in a colon. Body content is mostly hyphen lists. This keeps the writing direct and personal.

### Project Folders

Projects are represented first as small desktop folders with labels underneath. These should be clickable and playful. Detailed project descriptions follow as compact notes with a thin left border.

### Contact

Contact uses a green availability row, a yellow mail action, and muted social links. The interaction should be direct and simple.

## Do's and Don'ts

- Do keep the page narrow and personal.
- Do use lowercase labels and short section titles.
- Do use hyphen lists for casual, scannable copy.
- Do reserve yellow and green for tiny moments of emphasis.
- Do keep project folders simple and desktop-like.
- Don't use large hero gradients, oversized cards, or glossy portfolio patterns.
- Don't add more accent colors.
- Don't turn every project into a big marketing card.
- Don't make the page too wide on desktop.
- Don't over-animate; this design should feel quiet and handmade.
