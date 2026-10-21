"use client";

import { useEffect, useState } from "react";

/*
  A split-flap clock counting down to a date: days, hours, minutes, seconds,
  one paper card per digit, a hinge across the middle. When a digit changes, the old top half folds down and
  the new bottom half folds up behind it, the way a flap display turns.
  The server renders blank cards; the client fills them on mount and every
  second after, so the first thing a visitor sees is every card turning
  over to the right number.
*/
type Parts = { days: number; hours: number; minutes: number; seconds: number };

function until(target: number): Parts {
  const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s / 3600) % 24,
    minutes: Math.floor(s / 60) % 60,
    seconds: s % 60,
  };
}

const groups: { key: keyof Parts; width: number; label: string }[] = [
  { key: "days", width: 3, label: "days" },
  { key: "hours", width: 2, label: "hours" },
  { key: "minutes", width: 2, label: "min" },
  { key: "seconds", width: 2, label: "sec" },
];

export function Countdown({ to, label }: { to: string; label: string }) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const target = new Date(to).getTime();
    const tick = () => setParts(until(target));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [to]);

  const spoken = parts
    ? `${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds until ${label}`
    : `Counting down to ${label}`;

  return (
    <div className="flipclock" role="timer" aria-live="off" aria-label={spoken}>
      <p className="flip-head" aria-hidden="true">
        {label}
      </p>
      <div className="flip-groups" aria-hidden="true">
        {groups.map(({ key, width, label: name }) => {
          const text = parts ? String(parts[key]).padStart(width, "0") : " ".repeat(width);
          return (
            <div className="flip-group" key={key}>
              <div className="flip-digits">
                {text.split("").map((ch, i) => (
                  <Flap key={i} char={ch} />
                ))}
              </div>
              <span className="flip-label">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* One card. `shown` is what the static halves show; while a change is in
   flight the top already shows the new digit and the bottom still the old,
   with two leaves turning between them. The leaves come off when their
   animation ends, or after its length if the tab never ran it. */
function Flap({ char }: { char: string }) {
  const [state, setState] = useState({ next: char, shown: char, turn: 0 });

  useEffect(() => {
    setState((s) => (s.next === char ? s : { next: char, shown: s.next, turn: s.turn + 1 }));
  }, [char]);

  const turning = state.next !== state.shown;
  const settle = () => setState((s) => (s.shown === s.next ? s : { ...s, shown: s.next }));

  useEffect(() => {
    if (!turning) return;
    const timer = setTimeout(settle, 640);
    return () => clearTimeout(timer);
  }, [turning, state.turn]);

  return (
    <span className="flap">
      <span className="flap-half flap-top">
        <span>{state.next}</span>
      </span>
      <span className="flap-half flap-bottom">
        <span>{state.shown}</span>
      </span>
      {turning && (
        <span key={`t${state.turn}`} className="flap-leaf flap-leaf-top">
          <span>{state.shown}</span>
        </span>
      )}
      {turning && (
        <span key={`b${state.turn}`} className="flap-leaf flap-leaf-bottom" onAnimationEnd={settle}>
          <span>{state.next}</span>
        </span>
      )}
    </span>
  );
}
