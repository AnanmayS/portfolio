"use client";

import { useEffect, useRef } from "react";

/*
  Live progress through the degree. The bar advances about 8.6e-7 percent a
  second, so the readout carries enough decimals for the tail to move every
  frame while the leading digits stay steady and readable. Updates are written
  straight to the DOM rather than through state, so a 60fps counter does not
  re-render the tree sixty times a second.
*/
const START = Date.UTC(2024, 7, 28); /* first day of term at UMD */
const END = Date.UTC(2028, 4, 15); /* expected May 2028 */
const SPAN = END - START;
const DAY = 86_400_000;
const PLACES = 9;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function measure(now: number, live: boolean) {
  const done = Math.min(Math.max(now - START, 0), SPAN);
  const left = Math.max(END - now, 0);
  const days = Math.floor(left / DAY);
  const percent = (done / SPAN) * 100;
  const fraction = done / SPAN;

  if (!live) {
    return { fraction, head: percent.toFixed(2), tail: "", left: `${days}d left` };
  }

  const text = percent.toFixed(PLACES);
  const dot = text.indexOf(".");
  const rest = left % DAY;
  const clock = `${pad(Math.floor(rest / 3_600_000))}:${pad(
    Math.floor(rest / 60_000) % 60,
  )}:${pad(Math.floor(rest / 1000) % 60)}`;

  return {
    fraction,
    head: text.slice(0, dot + 3),
    tail: text.slice(dot + 3),
    left: `${days}d ${clock} left`,
  };
}

export function DegreeProgress({ buildNow }: { buildNow: number }) {
  /* Rendered from build time so the prerendered HTML and hydration agree. */
  const seed = measure(buildNow, true);

  const fill = useRef<SVGRectElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const tail = useRef<HTMLSpanElement>(null);
  const left = useRef<HTMLSpanElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const still =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = () => {
      const next = measure(Date.now(), !still);
      if (fill.current) fill.current.setAttribute("width", String(720 * next.fraction));
      if (head.current) head.current.textContent = next.head;
      if (tail.current) tail.current.textContent = next.tail;
      if (left.current) left.current.textContent = next.left;
    };

    paint();

    /* Screen readers get one steady figure, not a spinning one. */
    if (svg.current) {
      svg.current.setAttribute(
        "aria-label",
        `${measure(Date.now(), false).head} percent through a B.S. in Computer ` +
          `Engineering, 28 August 2024 to an expected May 2028.`,
      );
    }

    if (still) {
      const timer = setInterval(paint, 60_000);
      return () => clearInterval(timer);
    }

    let frame = requestAnimationFrame(function loop() {
      paint();
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <figure className="degree">
      <figcaption className="degree-what">
        degree progress · b.s. computer engineering, umd
      </figcaption>

      <svg
        className="degree-svg"
        ref={svg}
        viewBox="0 0 720 44"
        role="img"
        aria-label="Progress through a B.S. in Computer Engineering, 28 August 2024 to an expected May 2028."
        fill="none"
      >
        <rect x="0.5" y="8.5" width="719" height="27" stroke="var(--rule)" />
        <rect
          className="degree-fill"
          ref={fill}
          x="0"
          y="8"
          width={720 * seed.fraction}
          height="28"
          fill="var(--accent)"
        />
      </svg>

      <div className="degree-read">
        <span>
          <span className="degree-pct">
            <span ref={head}>{seed.head}</span>
            <span className="degree-tail" ref={tail}>
              {seed.tail}
            </span>
            %
          </span>
          <span className="degree-span"> of aug 2024 → may 2028</span>
        </span>
        <span className="degree-left" ref={left}>
          {seed.left}
        </span>
      </div>
    </figure>
  );
}
