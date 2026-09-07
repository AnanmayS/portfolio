/*
  The quiet strip under the hero: one line read off GitHub at build, two lines
  kept by hand in content.ts. Server component — every date here is resolved on
  the build machine, so nothing recomputes in the browser and there is no
  hydration mismatch to guard against.
*/

import { now } from "./content";
import type { GitHubSnapshot } from "./github-data";

const DAY = 86_400_000;

/** "today" / "yesterday" / "12 days ago" / "3 months ago", measured from the read. */
function relative(fromIso: string, atIso: string): string {
  const days = Math.floor((Date.parse(atIso) - Date.parse(fromIso)) / DAY);
  if (!Number.isFinite(days) || days < 0) return "just now";
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 45) return `${days} days ago`;
  const months = Math.round(days / 30.44);
  if (months < 18) return `${months} months ago`;
  return `${Math.round(days / 365.25)} years ago`;
}

const absolute = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));

const isoDay = (iso: string) => iso.slice(0, 10);

export function Currently({ snapshot }: { snapshot: GitHubSnapshot }) {
  const last = snapshot.recentCommits[0];
  const pushed = last
    ? { repo: last.repo, date: last.date, url: last.url, message: last.message }
    : snapshot.activeRepo
      ? {
          repo: snapshot.activeRepo.name,
          date: snapshot.activeRepo.pushedAt,
          url: snapshot.activeRepo.url,
          message: "",
        }
      : null;

  return (
    <section className="now" aria-label="Currently">
      <div className="now-row">
        {pushed ? (
          <div className="now-cell">
            <p className="now-label">last push</p>
            <p className="now-line">
              <a
                className="now-push"
                href={pushed.url}
                rel="noreferrer"
                target="_blank"
                title={`${pushed.repo}, ${absolute(pushed.date)}${
                  pushed.message ? ` — ${pushed.message}` : ""
                }`}
              >
                <span className="now-repo">{pushed.repo}</span>
                <span className="now-sep"> · </span>
                <time dateTime={isoDay(pushed.date)}>
                  {relative(pushed.date, snapshot.fetchedAt)}
                </time>
                {pushed.message ? (
                  <>
                    <span className="now-sep"> · </span>
                    <span className="now-msg">“{pushed.message}”</span>
                  </>
                ) : null}
              </a>
            </p>
          </div>
        ) : null}

        <div className="now-cell">
          <p className="now-label">this week</p>
          <p className="now-line" title={now.trying}>
            {now.trying}
          </p>
        </div>

        <div className="now-cell">
          <p className="now-label">reading</p>
          <p className="now-line" title={now.reading}>
            {now.reading}
          </p>
        </div>
      </div>

      <p className="now-source">
        from github at build ·{" "}
        <time dateTime={isoDay(snapshot.fetchedAt)}>{isoDay(snapshot.fetchedAt)}</time>
      </p>
    </section>
  );
}
