# Ananmay Som Singh — portfolio

A quiet personal site on one screen: a terrapin pond, a short intro, a live
degree-progress bar and experience on the left; three projects on the right,
each with a looping illustration of how it works.
Next.js as a static export, deployed to GitHub Pages.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

## Where things live

- `app/content.ts` — everything the page says: projects, roles, links.
- `app/art/` — one animated SVG per project (`wildebeest`, `tape`, `showdown`),
  CSS-animated, greyscale, looping only while on screen; and `pond`, the
  terrapin at the top of the page, the one picture in colour.
- `app/degree-progress.tsx` — the bar drawn to scale across the degree with a
  live readout.
- `app/page.tsx`, `app/globals.css` — the page and the whole theme.
- `DESIGN.md`, `PRODUCT.md` — why it looks and reads the way it does.
