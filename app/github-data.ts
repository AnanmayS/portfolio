/*
  Build-time GitHub read. Server only — never import this from a "use client"
  file. Next prerenders the page, so this runs on the build machine and the
  result is baked into the HTML; nothing reaches GitHub from a visitor's
  browser.

  It tries the REST API first and falls back to app/github-snapshot.json, which
  is checked in, so a build with no network (CI without egress, an offline
  laptop) still produces the same page with slightly older numbers.

  NOTE: `fetchLive` below is a typed twin of `fetchGitHubSnapshot` in
  scripts/github-fetch.mjs. The project sets `allowJs: false` with
  `moduleResolution: "bundler"`, so importing the .mjs from TypeScript would
  need a hand-written declaration file; duplicating forty lines is the smaller
  cost. Change one, change the other.
*/

import snapshotJson from "./github-snapshot.json";

export type GitHubSnapshot = {
  /** ISO instant the data was read. Relative dates on the page are measured from here. */
  fetchedAt: string;
  user: string;
  recentCommits: {
    repo: string;
    message: string;
    date: string;
    url: string;
  }[];
  activeRepo: { name: string; pushedAt: string; url: string } | null;
  /** Summed across the sampled repos, descending, top ten. */
  languages: { name: string; bytes: number }[];
  /** How many repos those language bytes were summed across. */
  repoCount: number;
};

const API = "https://api.github.com";
const USER = "AnanmayS";
const REPO_SAMPLE = 15;
const COMMIT_SAMPLE = 5;
const TOP_LANGUAGES = 10;
const TIMEOUT_MS = 6000;

const fallback = snapshotJson as GitHubSnapshot;

type ApiRepo = {
  name: string;
  fork: boolean;
  private: boolean;
  pushed_at: string;
  html_url: string;
};

type ApiCommit = {
  html_url: string;
  commit: { message: string; committer: { date: string } | null } | null;
};

/** One request, JSON out, aborted after six seconds. Throws on anything but 2xx. */
async function get<T>(path: string, token: string | undefined): Promise<T> {
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
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLive(): Promise<GitHubSnapshot> {
  const token = process.env.GITHUB_TOKEN;
  const repos = await get<ApiRepo[]>(`/users/${USER}/repos?per_page=100&sort=pushed`, token);
  const own = repos
    .filter((r) => !r.fork && !r.private && r.name.toLowerCase() !== USER.toLowerCase())
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at));
  if (own.length === 0) throw new Error("no public repos returned");

  const sampled = own.slice(0, REPO_SAMPLE);
  const totals = new Map<string, number>();
  for (const repo of sampled) {
    const langs = await get<Record<string, number>>(`/repos/${USER}/${repo.name}/languages`, token);
    for (const [name, bytes] of Object.entries(langs)) {
      totals.set(name, (totals.get(name) ?? 0) + Number(bytes));
    }
  }

  const commits: GitHubSnapshot["recentCommits"] = [];
  for (const repo of own.slice(0, COMMIT_SAMPLE)) {
    let list: ApiCommit[];
    try {
      list = await get<ApiCommit[]>(`/repos/${USER}/${repo.name}/commits?per_page=3`, token);
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

/** One read per build even when several components ask for it. */
let pending: Promise<GitHubSnapshot> | null = null;

async function read(): Promise<GitHubSnapshot> {
  try {
    const live = await fetchLive();
    console.log(
      `[github-data] live api · ${live.languages.length} languages across ${live.repoCount} repos · ` +
        `${live.recentCommits.length} commits · read ${live.fetchedAt}`,
    );
    return live;
  } catch (err) {
    console.log(
      `[github-data] snapshot app/github-snapshot.json (api unavailable: ${
        err instanceof Error ? err.message : String(err)
      }) · read ${fallback.fetchedAt}`,
    );
    return fallback;
  }
}

/**
 * The snapshot the page renders from. Never throws and never returns an empty
 * object: on any failure it hands back the checked-in JSON.
 */
export async function loadGitHubSnapshot(): Promise<GitHubSnapshot> {
  pending ??= read();
  return pending;
}
