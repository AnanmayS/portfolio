# Ananmay Som Singh — portfolio

A personal site where every project is something you can run, and every
number links to the run it came from. Built with Next.js as a static export
and deployed to GitHub Pages.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

## Where things live

- `app/content.ts` — the one source for projects, roles, links, and the
  evidence behind every claim. Components read from here; nothing here renders.
- `app/demos/` — one interactive demo per project (Tape replay, ForgeGrid
  scheduler, ShowdownRL replay, order book, option pricing, Polymarket risk
  sandbox, Daily Delve video). `CONVENTIONS.md` in that folder is the rule set
  they follow.
- `app/evidence.tsx` — turns a number in a lede into a claim that opens the
  log, table, or link it came from.
- `app/command-palette.tsx`, `app/terminal-mode.tsx` — Cmd+K and the `~~`
  shell.
- `app/github-data.ts` — reads recent commits and language bytes from GitHub
  at build time, falling back to `app/github-snapshot.json`. Refresh the
  snapshot locally with `node scripts/refresh-github-snapshot.mjs`; set
  `GITHUB_TOKEN` to raise the rate limit.
- `DESIGN.md`, `PRODUCT.md` — why it looks and reads the way it does.

## Keeping it honest

Ledes only state numbers that have an entry in `evidence` for that project.
Demos run the real mechanism (the C matching rules, the seven-task build
graph, the risk rules from the paper trader) and say so in their captions when
the data is synthetic.
