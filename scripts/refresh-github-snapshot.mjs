#!/usr/bin/env node
/*
  Rewrites app/github-snapshot.json from the live GitHub API.

      node scripts/refresh-github-snapshot.mjs
      GITHUB_TOKEN=ghp_... node scripts/refresh-github-snapshot.mjs

  The build reads the API too, but a build without network access falls back to
  the checked-in file — so run this whenever the strip and the heatmap look
  stale, and commit the result.
*/

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { fetchGitHubSnapshot } from "./github-fetch.mjs";

const target = fileURLToPath(new URL("../app/github-snapshot.json", import.meta.url));

try {
  const snapshot = await fetchGitHubSnapshot();
  await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  const top = snapshot.languages
    .slice(0, 3)
    .map((l) => l.name)
    .join(", ");
  console.log(
    `wrote app/github-snapshot.json — ${snapshot.languages.length} languages across ` +
      `${snapshot.repoCount} repos (${top}), ${snapshot.recentCommits.length} commits, ` +
      `active repo ${snapshot.activeRepo?.name ?? "none"}`,
  );
} catch (err) {
  console.error(`refresh failed, app/github-snapshot.json left as it was: ${String(err)}`);
  process.exitCode = 1;
}
