# Ananmay Som Singh Portfolio

A clean, responsive personal portfolio built with Next.js, TypeScript, and Tailwind CSS. It is intentionally simple to edit and ready to deploy on Vercel.

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

Run the production server locally:

```bash
npm run start
```

## Edit Your Information

Most content lives in `app/page.tsx`.

- Update your name, title, intro, email, GitHub, and LinkedIn in the `profile` object.
- Update navbar links in `navItems`.
- Update project cards in the `projects` array.
- Update experience items in the `experiences` array.
- Update skills in the `skillGroups` array.

Global styling is in `app/globals.css`.

## Deploy To Vercel

1. Push this project to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and choose **Add New Project**.
3. Import your GitHub repository.
4. Keep the default framework setting as **Next.js**.
5. Click **Deploy**.

No environment variables are required for this version of the site.

## Useful Commands

```bash
npm run dev
npm run typecheck
npm run build
```
