"use client";

import { useEffect, useRef, useState } from "react";

/*
  A string that morphs when it changes, character by character. Characters
  up to the first difference stay where they are; from there on, the old
  ones lift out (up, smaller, blurred) while the new ones drop in from
  below with a small overshoot. Used for the degree countdown and the
  footer clock, so a tick reads as one digit turning over rather than a
  whole line repainting.

  Each character carries the tick at which it last changed; that is its
  React key, so only characters that actually changed remount and replay
  the entrance. The exit copy is laid over the text at the prefix's width,
  which in a monospace face is simply that many `ch`. Set the font on the
  parent.
*/
type Change = { tick: number; from: number; leaving: string };

export function Ticker({ value, className = "" }: { value: string; className?: string }) {
  const prev = useRef(value);
  const gens = useRef<number[]>([]);
  const [change, setChange] = useState<Change>({ tick: 0, from: value.length, leaving: "" });
  const [leaving, setLeaving] = useState("");

  useEffect(() => {
    if (prev.current === value) return;
    const old = prev.current;
    prev.current = value;

    let i = 0;
    while (i < old.length && i < value.length && old[i] === value[i]) i++;

    const tick = change.tick + 1;
    for (let k = i; k < value.length; k++) gens.current[k] = tick;
    gens.current.length = value.length;

    setChange({ tick, from: i, leaving: old.slice(i) });
    setLeaving(old.slice(i));

    const timer = setTimeout(() => setLeaving(""), 360);
    return () => clearTimeout(timer);
    // `change.tick` is only read to number the next change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={`ticker ${className}`} aria-label={value} role="img">
      {leaving ? (
        <span
          className="ticker-out"
          aria-hidden="true"
          key={`out-${change.tick}`}
          style={{ left: `${change.from}ch` }}
        >
          {leaving.split("").map((c, i) => (
            <span className="ticker-char" key={i}>
              {c}
            </span>
          ))}
        </span>
      ) : null}
      <span aria-hidden="true">
        {value.split("").map((c, i) => {
          const gen = gens.current[i] ?? 0;
          return (
            <span
              className={`ticker-char${gen > 0 ? " is-in" : ""}`}
              key={`${gen}-${i}`}
            >
              {c}
            </span>
          );
        })}
      </span>
    </span>
  );
}
