# Demo component conventions

Every interactive demo on the portfolio follows these rules so the page reads as
one system. Read DESIGN.md at the repo root first; it explains the palette,
type roles and motion budget. These are the mechanical rules on top of it.

## Files

- One component per file in `app/demos/<name>.tsx`, `"use client"` at the top,
  a single named export with no required props (e.g. `export function
  ForgeGridSandbox()`).
- Its CSS lives in `app/demos/<name>.css`. Do not import it from the component
  and do not touch `app/globals.css`; the integrator adds
  `@import "./demos/<name>.css";` to globals. Prefix every class with the demo's
  short name (`fg-`, `tape-`, `sd-`, `ob-`, `opt-`, `pm-`) so nothing collides.
- No new npm dependencies. React 19, TypeScript strict, Next 16 static export.
  Plain SVG for any drawing. No canvas unless SVG genuinely cannot do it.
- Do not read `window`, `document`, `localStorage` or `matchMedia` during
  render; only inside `useEffect`. The page is prerendered at build time and the
  first client render must match the server HTML exactly (no `Date.now()` or
  `Math.random()` in render; seed anything random with a fixed constant).

## Look

- Colours only through the tokens in `globals.css`: `--ground`, `--surface`,
  `--ink`, `--muted`, `--faint`, `--rule`, `--slow`, `--accent`, `--accent-ink`,
  `--on-accent`, `--danger`. Never a colour literal. The accent is spent only on
  a measured result or the primary control; `--slow` is the un-improved
  baseline in a comparison; `--danger` only for a failure or a severed feed.
- Fonts through `--font-code` (labels, numbers, controls), `--font-sans`
  (sentences), `--font-head` (never inside a demo).
- Small mono text is `0.6875rem`, controls `0.75rem`. Radius `var(--radius)`.
  Hairline borders `1px solid var(--rule)`. No shadows, gradients, or glows.
- The demo sits inside the page's `.work-figure` box (bordered, 1.25rem
  padding, `overflow-x: auto`, ground background). Design for a content width
  of about 41rem and make it usable down to 390px viewport width; below
  44rem the figure may scroll horizontally but the controls must not.
- Buttons: `border: 1px solid var(--rule); background: transparent; color:
  var(--ink); font: 0.75rem var(--font-code); padding: 0.45rem 0.7rem;
  border-radius: var(--radius)`. Primary action gets `background: var(--accent);
  color: var(--on-accent); border-color: transparent`. Hover on quiet buttons
  colours the text with the accent. Range inputs: `accent-color: var(--accent)`.
- Numbers that change use `font-variant-numeric: tabular-nums`.

## Behaviour

- Every control has a visible label or `aria-label`. Every SVG has
  `role="img"` and a descriptive `aria-label`, or is `aria-hidden` with an
  adjacent text readout that says the same thing.
- Keyboard: everything reachable by Tab, sliders by arrow keys, and any custom
  scrubber also works with arrow keys.
- Motion is only for things that measure or move in the model. Respect
  `prefers-reduced-motion` by reading `matchMedia` in an effect and, when it
  matches, stepping instead of animating.
- Per-frame updates write to refs and the DOM, not to React state, unless the
  update is at most a few times a second.
- Nothing fetches at runtime. All data is in the file or in a sibling
  `app/demos/<name>-data.ts`.
- The demo must render something sensible before any interaction; a visitor
  who never clicks should still see the result the project claims.
- Include a one-line caption element at the bottom (`<p className="<prefix>-caption">`)
  in `--faint` mono that states what the visitor is looking at and the
  measured number it relates to.

## Done means

- `npm run typecheck` passes from the repo root.
- `npm run build` passes (static export; no runtime-only APIs in render).
- You have exercised the component in a real browser via a throwaway page
  (`app/_scratch/<name>/page.tsx`, deleted before you finish) using
  `npm run dev` and Playwright with the preinstalled Chromium, and taken a
  screenshot at 1100px and 390px widths to check nothing overflows.
- Nothing outside `app/demos/` (and your deleted scratch page) is modified.
