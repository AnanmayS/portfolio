"use client";

import { useEffect, useRef, useState } from "react";
import { Ticker } from "./ticker";

/*
  Live progress through the degree: a bar drawn to scale across the whole
  programme, and under it a countdown to commencement that ticks once a
  second like a clock. Updates are written straight to the DOM rather than
  through state, so the tick does not re-render the tree.
*/
const START = Date.UTC(2024, 7, 28); /* first day of term at UMD */
const END = Date.UTC(2028, 4, 18); /* expected commencement */
const SPAN = END - START;
const DAY = 86_400_000;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function measure(now: number, live: boolean) {
  const done = Math.min(Math.max(now - START, 0), SPAN);
  const left = Math.max(END - now, 0);
  const days = Math.floor(left / DAY);
  const fraction = done / SPAN;
  const percent = Math.round((fraction * 100) * 10) / 10;

  if (!live) {
    return { fraction, percent, left: `${days}d` };
  }

  const rest = left % DAY;
  const clock = `${pad(Math.floor(rest / 3_600_000))}:${pad(
    Math.floor(rest / 60_000) % 60,
  )}:${pad(Math.floor(rest / 1000) % 60)}`;

  return { fraction, percent, left: `${days}d ${clock}` };
}

export function DegreeProgress({ buildNow }: { buildNow: number }) {
  /* Rendered from build time so the prerendered HTML and hydration agree. */
  const seed = measure(buildNow, true);

  const fill = useRef<SVGRectElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [left, setLeft] = useState(seed.left);

  useEffect(() => {
    const still =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = () => {
      const next = measure(Date.now(), !still);
      if (fill.current) fill.current.setAttribute("width", String(720 * next.fraction));
      setLeft(next.left);
    };

    paint();

    /* Screen readers get one steady figure, not a spinning one. */
    if (svg.current) {
      svg.current.setAttribute(
        "aria-label",
        `${measure(Date.now(), false).percent} percent through a B.S. in Computer ` +
          `Engineering, 28 August 2024 to an expected 18 May 2028.`,
      );
    }

    const timer = setInterval(paint, still ? 60_000 : 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <figure className="degree">
      <svg
        className="degree-svg"
        ref={svg}
        viewBox="0 0 720 8"
        role="img"
        aria-label="Progress through a B.S. in Computer Engineering, 28 August 2024 to an expected 18 May 2028."
        fill="none"
      >
        <rect x="0" y="0" width="720" height="8" rx="4" fill="var(--track)" />
        <rect
          className="degree-fill"
          ref={fill}
          x="0"
          y="0"
          width={720 * seed.fraction}
          height="8"
          rx="4"
          fill="var(--foreground)"
        />
      </svg>

      <figcaption className="degree-read">
        <span className="degree-what">B.S. Computer Engineering</span>
        <span className="degree-left">
          <Ticker value={left} /> left
          <span className="degree-dot"> · </span>May 2028
        </span>
      </figcaption>
    </figure>
  );
}
