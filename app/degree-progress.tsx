"use client";

import { useEffect, useState } from "react";

/*
  Live progress through the degree. The bar is drawn to scale across the whole
  span; the readout ticks, because the bar itself only moves 0.07% a day and
  would otherwise look static.
*/
const START = Date.UTC(2024, 8, 1); /* Sep 2024, first UMD term */
const END = Date.UTC(2028, 4, 15); /* expected May 2028 */
const SPAN = END - START;
const DAY = 86_400_000;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function measure(now: number, withClock: boolean) {
  const done = Math.min(Math.max(now - START, 0), SPAN);
  const left = Math.max(END - now, 0);
  const days = Math.floor(left / DAY);

  if (!withClock) {
    return { fraction: done / SPAN, percent: (done / SPAN) * 100, left: `${days}d left` };
  }

  const rest = left % DAY;
  const clock = `${pad(Math.floor(rest / 3_600_000))}:${pad(
    Math.floor(rest / 60_000) % 60,
  )}:${pad(Math.floor(rest / 1000) % 60)}`;

  return {
    fraction: done / SPAN,
    percent: (done / SPAN) * 100,
    left: `${days}d ${clock} left`,
  };
}

export function DegreeProgress({ buildNow }: { buildNow: number }) {
  /* Seeded from build time so the server and first client render agree. */
  const [state, setState] = useState(() => measure(buildNow, true));

  useEffect(() => {
    const still =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = () => setState(measure(Date.now(), !still));
    tick();

    const timer = setInterval(tick, still ? 60_000 : 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <figure className="degree">
      <figcaption className="degree-what">
        degree progress · b.s. computer engineering, umd
      </figcaption>

      <svg
        className="degree-svg"
        viewBox="0 0 720 44"
        role="img"
        aria-label={`${state.percent.toFixed(
          1,
        )} percent through a B.S. in Computer Engineering, September 2024 to an expected May 2028.`}
        fill="none"
      >
        <rect x="0.5" y="8.5" width="719" height="27" stroke="var(--rule)" />
        <rect
          className="degree-fill"
          x="0"
          y="8"
          width={720 * state.fraction}
          height="28"
          fill="var(--accent)"
        />
      </svg>

      <div className="degree-read">
        <span>
          <span className="degree-pct">{state.percent.toFixed(2)}%</span>
          <span className="degree-span"> of sep 2024 → may 2028</span>
        </span>
        <span className="degree-left">{state.left}</span>
      </div>
    </figure>
  );
}
