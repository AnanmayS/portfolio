# Ananmay Som Singh Portfolio

A clean, responsive personal portfolio built with Next.js, TypeScript, and Tailwind CSS.

Live site: [ananmays.github.io/portfolio](https://ananmays.github.io/portfolio/)

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

Create a production build:

```bash
npm run build
```

## Edit Your Information

Most content lives in `app/page.tsx`.

- Update your name, title, intro, email, GitHub, and LinkedIn in the `profile` object.
- Update navbar links in `navItems`.
- Update project cards in the `projects` array.
- Update experience items in the `experiences` array.
- Update skills in the `skillGroups` array.

Global styling is in `app/globals.css`.

## Deploy to GitHub Pages

The site is exported as static HTML and deployed automatically by
`.github/workflows/deploy-pages.yml`.

Every push to `main` runs the typecheck, builds the site with the GitHub Pages
base path, and publishes the `out` directory.

## Useful Commands

```bash
npm run dev
npm run typecheck
npm run build
```
