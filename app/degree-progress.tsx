"use client";

import { useEffect, useState } from "react";

/*
  Time left on the degree, counted down rather than totted up. The bar still
  draws the whole span to scale, but the readout is the part a reader can act
  on: how long is left. Each digit sits in its own column that rolls one step
  on every tick, so the seconds read as a number moving rather than as text
  being swapped out.
*/
const START = Date.UTC(2024, 7, 28); /* first day of term at UMD */
const END = Date.UTC(2028, 4, 18); /* expected commencement */
const SPAN = END - START;

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function measure(now: number) {
  const left = Math.max(END - now, 0);

  return {
    fraction: Math.min(Math.max(now - START, 0), SPAN) / SPAN,
    days: String(Math.floor(left / DAY)),
    hours: pad(Math.floor(left / HOUR) % 24),
    minutes: pad(Math.floor(left / MINUTE) % 60),
    seconds: pad(Math.floor(left / SECOND) % 60),
    spoken: Math.floor(left / DAY),
  };
}

/*
  One digit, as a two-slot column inside a one-character window: the numeral
  that was showing sits above the one showing now, and the column travels a
  single step each tick. Holding only two numerals rather than all ten is
  what makes a 0 following a 9 roll forward like any other tick instead of
  sweeping back through eight numerals.
*/
function Digit({ numeral }: { numeral: string }) {
  const [slots, setSlots] = useState({ was: numeral, now: numeral, rolling: false });

  useEffect(() => {
    /* The old numeral is parked at the top and the transform reset, which is
       invisible: what was on screen is exactly what is on screen now. */
    setSlots((prev) =>
      prev.now === numeral ? prev : { was: prev.now, now: numeral, rolling: false },
    );
  }, [numeral]);

  useEffect(() => {
    if (slots.rolling || slots.was === slots.now) return;

    /* A frame later the column is let go, and the transition carries it. */
    const frame = requestAnimationFrame(() =>
      setSlots((prev) => ({ ...prev, rolling: true })),
    );
    return () => cancelAnimationFrame(frame);
  }, [slots]);

  return (
    <span className="cd-digit">
      <span className={slots.rolling ? "cd-reel is-rolling" : "cd-reel"}>
        <span>{slots.was}</span>
        <span>{slots.now}</span>
      </span>
    </span>
  );
}

/* One unit of the countdown: its digits, then the letter that names it. */
function Unit({ value, label }: { value: string; label: string }) {
  return (
    <span className="cd-unit">
      {value.split("").map((numeral, index) => (
        /* The digit count is part of the key, so a day count dropping from
           three digits to two remounts instead of sliding sideways. */
        <Digit key={`${value.length}-${index}`} numeral={numeral} />
      ))}
      <span className="cd-label">{label}</span>
    </span>
  );
}

export function DegreeProgress({ buildNow }: { buildNow: number }) {
  /* Seeded from build time so the prerendered HTML and hydration agree. */
  const [now, setNow] = useState(buildNow);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const quiet =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    setStill(quiet);
    setNow(Date.now());

    /* A reader who asked for less motion gets the minute, not the second. */
    const timer = setInterval(() => setNow(Date.now()), quiet ? MINUTE : SECOND);
    return () => clearInterval(timer);
  }, []);

  const left = measure(now);

  return (
    <figure className="degree">
      <figcaption className="degree-what">
        <span>B.S. Computer Engineering, University of Maryland</span>
        <span className="mono">2024 – 28</span>
      </figcaption>

      <svg
        className="degree-svg"
        viewBox="0 0 720 20"
        role="img"
        aria-label="Progress through a B.S. in Computer Engineering, 28 August 2024 to an expected 18 May 2028."
        fill="none"
      >
        <rect x="0.5" y="0.5" width="719" height="19" rx="3" stroke="var(--border)" />
        <rect
          className="degree-fill"
          x="0"
          y="0"
          width={720 * left.fraction}
          height="20"
          rx="3"
          fill="var(--foreground)"
        />
      </svg>

      <div className="degree-read">
        <span className="countdown" aria-hidden="true">
          <Unit value={left.days} label="d" />
          <Unit value={left.hours} label="h" />
          <Unit value={left.minutes} label="m" />
          {still ? null : <Unit value={left.seconds} label="s" />}
        </span>
        <span className="u-quiet">
          {left.spoken} days until commencement on 18 May 2028.
        </span>
        <span className="degree-until">until commencement</span>
      </div>
    </figure>
  );
}
