/*
  Live GitHub read, in plain ESM so `node scripts/refresh-github-snapshot.mjs`
  can run it with no build step.

  NOTE: app/github-data.ts carries a typed twin of `fetchGitHubSnapshot` (about
  forty lines). The project sets `allowJs: false` with `moduleResolution:
  "bundler"`, so a `.mjs` cannot be imported from the TypeScript module without
  adding a declaration file for it; the duplication is deliberate. Change one,
  change the other — the shapes are identical and the snapshot JSON is the
  contract between them.
*/

const API = "https://api.github.com";
const USER = "AnanmayS";
/** Languages are summed across this many most-recently-pushed repos. */
const REPO_SAMPLE = 15;
/** Commits are read from this many most-recently-pushed repos. */
const COMMIT_SAMPLE = 5;
const TOP_LANGUAGES = 10;
const TIMEOUT_MS = 6000;

/** One request, JSON out, aborted after six seconds. Throws on anything but 2xx. */
async function get(path, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API + path, {
      signal: controller.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": `${USER}-portfolio-build`,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Reads the public repo list, the language byte counts and the newest commits.
 * Resolves to a GitHubSnapshot. Throws if the network is unavailable; callers
 * fall back to the checked-in snapshot.
 */
export async function fetchGitHubSnapshot(token = process.env.GITHUB_TOKEN) {
  const repos = await get(`/users/${USER}/repos?per_page=100&sort=pushed`, token);
  const own = repos
    .filter((r) => !r.fork && !r.private && r.name.toLowerCase() !== USER.toLowerCase())
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at));
  if (own.length === 0) throw new Error("no public repos returned");

  const sampled = own.slice(0, REPO_SAMPLE);
  const totals = new Map();
  for (const repo of sampled) {
    const langs = await get(`/repos/${USER}/${repo.name}/languages`, token);
    for (const [name, bytes] of Object.entries(langs)) {
      totals.set(name, (totals.get(name) ?? 0) + Number(bytes));
    }
  }

  const commits = [];
  for (const repo of own.slice(0, COMMIT_SAMPLE)) {
    let list;
    try {
      list = await get(`/repos/${USER}/${repo.name}/commits?per_page=3`, token);
    } catch {
      continue; // an empty repo answers 409; it should not sink the build
    }
    for (const c of list) {
      commits.push({
        repo: repo.name,
        message: String(c.commit?.message ?? "").split("\n")[0],
        date: new Date(c.commit?.committer?.date ?? repo.pushed_at).toISOString(),
        url: c.html_url,
      });
    }
  }
  commits.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return {
    fetchedAt: new Date().toISOString(),
    user: USER,
    recentCommits: commits.slice(0, 6),
    activeRepo: {
      name: own[0].name,
      pushedAt: new Date(own[0].pushed_at).toISOString(),
      url: own[0].html_url,
    },
    languages: [...totals.entries()]
      .map(([name, bytes]) => ({ name, bytes }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, TOP_LANGUAGES),
    repoCount: sampled.length,
  };
}
