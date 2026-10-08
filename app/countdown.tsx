"use client";

import { useEffect, useState } from "react";

/*
  A split-flap countdown to commencement: days, hours, minutes, seconds,
  each digit on its own tile. When a digit changes, the top half of the old
  digit folds down and the bottom half of the new one folds up after it,
  like a departures board. Under reduced motion the digits just change.

  Rendered from build time so the prerendered HTML and hydration agree;
  the first paint on the client flips every digit that moved since.
*/
const END = Date.UTC(2028, 4, 18, 14, 0); /* expected commencement, 10:00 ET */
const DAY = 86_400_000;

function parts(now: number) {
  const left = Math.max(END - now, 0);
  const days = Math.floor(left / DAY);
  const rest = left % DAY;
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return {
    days: pad(days, 3),
    hours: pad(Math.floor(rest / 3_600_000)),
    minutes: pad(Math.floor(rest / 60_000) % 60),
    seconds: pad(Math.floor(rest / 1000) % 60),
  };
}

function FlipDigit({ value, still }: { value: string; still: boolean }) {
  const [shown, setShown] = useState({ cur: value, prev: value, tick: 0 });

  useEffect(() => {
    if (value === shown.cur) return;
    if (still) {
      setShown({ cur: value, prev: value, tick: 0 });
      return;
    }
    setShown((s) => ({ cur: value, prev: s.cur, tick: s.tick + 1 }));
    const timer = setTimeout(() => setShown((s) => ({ ...s, prev: s.cur })), 620);
    return () => clearTimeout(timer);
    // Only a new value starts a flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, still]);

  const flipping = shown.prev !== shown.cur;

  return (
    <span className="flip-digit" aria-hidden="true">
      <span className="flip-half flip-top">
        <span>{shown.cur}</span>
      </span>
      <span className="flip-half flip-bottom">
        <span>{flipping ? shown.prev : shown.cur}</span>
      </span>
      {flipping && (
        <>
          <span className="flip-half flip-top flip-flap-top" key={`t${shown.tick}`}>
            <span>{shown.prev}</span>
          </span>
          <span className="flip-half flip-bottom flip-flap-bottom" key={`b${shown.tick}`}>
            <span>{shown.cur}</span>
          </span>
        </>
      )}
    </span>
  );
}

function Group({ value, label, still }: { value: string; label: string; still: boolean }) {
  return (
    <span className="flip-group">
      <span className="flip-tiles">
        {value.split("").map((digit, i) => (
          <FlipDigit key={i} value={digit} still={still} />
        ))}
      </span>
      <span className="flip-label mono">{label}</span>
    </span>
  );
}

export function Countdown({ buildNow }: { buildNow: number }) {
  const [now, setNow] = useState(buildNow);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const t = parts(now);

  return (
    <figure className="flip">
      <span className="sr-only" role="timer">
        {Number(t.days)} days, {Number(t.hours)} hours and {Number(t.minutes)} minutes until commencement, May 2028.
      </span>
      <span className="flip-row" aria-hidden="true">
        <Group value={t.days} label="days" still={still} />
        <span className="flip-colon">:</span>
        <Group value={t.hours} label="hrs" still={still} />
        <span className="flip-colon">:</span>
        <Group value={t.minutes} label="min" still={still} />
        <span className="flip-colon">:</span>
        <Group value={t.seconds} label="sec" still={still} />
      </span>
      <figcaption className="flip-caption mono">until graduation · may 2028</figcaption>
    </figure>
  );
}
