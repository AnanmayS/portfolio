# Ananmay Som Singh — portfolio

A quiet personal site: three projects, each with a looping illustration of
how it works, a live degree-progress bar, experience, and a stack line.
Next.js as a static export, deployed to GitHub Pages.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

## Where things live

- `app/content.ts` — everything the page says: projects, roles, links.
- `app/art/` — one animated SVG per project (`tape`, `forgegrid`, `showdown`),
  CSS-animated, greyscale, looping only while on screen.
- `app/degree-progress.tsx` — the bar drawn to scale across the degree with a
  live readout.
- `app/page.tsx`, `app/globals.css` — the page and the whole theme.
- `DESIGN.md`, `PRODUCT.md` — why it looks and reads the way it does.
