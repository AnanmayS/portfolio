/*
  The stack, measured. One stacked bar of language bytes summed across the most
  recently pushed public repos, then the hand-written list from content.ts for
  everything a byte count cannot see (databases, cloud, test runners).

  Server component, no client JavaScript: the chip-to-segment highlight is CSS
  `:has()` keyed on a stable index, so it works with the page's JS disabled.
*/

import { skills } from "./content";
import type { GitHubSnapshot } from "./github-data";

/** Segments thinner than this are widened to stay visible; labels keep the true share. */
const MIN_WIDTH_PCT = 0.8;
/** Four tones cycled so no two neighbouring segments share a colour. */
const TONES = 4;

type Segment = {
  name: string;
  bytes: number;
  /** True share of the summed bytes. */
  pct: number;
  /** Drawn width, floored so a half-percent language is still a visible sliver. */
  width: number;
  /** Stable position, the key the CSS highlight matches chip to segment on. */
  index: number;
  /** Which of the four tones this segment is painted in. */
  tone: number;
};

function segments(languages: GitHubSnapshot["languages"]): Segment[] {
  const total = languages.reduce((sum, l) => sum + l.bytes, 0);
  if (total <= 0) return [];

  const raw = languages.map((l) => (l.bytes / total) * 100);
  // Widening the slivers has to come out of the wide segments, or the row
  // overflows its 100%.
  const owed = raw.reduce((sum, p) => sum + Math.max(0, MIN_WIDTH_PCT - p), 0);
  const spare = raw.reduce((sum, p) => sum + Math.max(0, p - MIN_WIDTH_PCT), 0);
  const shrink = spare > 0 ? Math.min(1, owed / spare) : 0;

  return languages.map((l, i) => ({
    name: l.name,
    bytes: l.bytes,
    pct: raw[i],
    width:
      raw[i] <= MIN_WIDTH_PCT
        ? MIN_WIDTH_PCT
        : MIN_WIDTH_PCT + (raw[i] - MIN_WIDTH_PCT) * (1 - shrink),
    index: i,
    tone: i % TONES,
  }));
}

/** 49%, 6%, and 0.5% for anything that would otherwise round to nothing. */
const label = (pct: number) => (pct < 1 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`);

const bytesLabel = (bytes: number) =>
  bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1000).toLocaleString("en-US")} kB`;

export function SkillsHeatmap({ snapshot }: { snapshot: GitHubSnapshot }) {
  const bars = segments(snapshot.languages);
  const reading = bars.map((s) => `${s.name} ${label(s.pct)}`).join(", ");

  return (
    <div className="heat">
      {bars.length > 0 ? (
        <>
          <div className="heat-bar" role="img" aria-label={`Language share by bytes: ${reading}.`}>
            {bars.map((s) => (
              <span
                key={s.name}
                className="heat-item heat-seg"
                data-i={s.index}
                data-lang={s.name}
                data-tone={s.tone}
                style={{ width: `${s.width.toFixed(3)}%` }}
                title={`${s.name} · ${label(s.pct)} · ${bytesLabel(s.bytes)}`}
              />
            ))}
          </div>

          <ul className="heat-legend">
            {bars.map((s) => (
              <li key={s.name}>
                <button
                  className="heat-item heat-chip"
                  data-i={s.index}
                  data-lang={s.name}
                  type="button"
                  title={`${s.name} · ${bytesLabel(s.bytes)} of source`}
                >
                  <span className="heat-swatch" data-tone={s.tone} aria-hidden="true" />
                  {s.name} <span className="heat-pct">{label(s.pct)}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className="heat-caption">
            language share by bytes across {snapshot.repoCount} public repos on GitHub, measured at
            build
          </p>
        </>
      ) : null}

      <dl className="skills heat-hand">
        {skills.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>
              <p>{value}</p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
