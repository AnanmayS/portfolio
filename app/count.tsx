"use client";

import { useEffect, useRef } from "react";

/*
  A metric that counts up to itself when its card rises into view. The
  server renders the finished value; the count runs only after the card's
  `deck:in` event, keeps the value's own format (grouping, decimals, the
  unit after it), and always lands on the exact text it started with.
*/
export function Count({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = el.closest(".card");
    if (!card) return;

    const match = /^([\d,]*\.?\d+)(.*)$/.exec(value);
    if (!match) return;
    const [, digits, suffix] = match;
    const target = parseFloat(digits.replace(/,/g, ""));
    const grouped = digits.includes(",");
    const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
    const format = (n: number) =>
      (grouped ? Math.round(n).toLocaleString("en-US") : n.toFixed(decimals)) + suffix;

    let frame = 0;
    let timer = 0;
    const run = () => {
      const start = performance.now();
      const duration = 1100;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = p < 1 ? format(target * eased) : value;
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      timer = window.setTimeout(() => {
        el.textContent = value;
      }, duration + 80);
    };

    card.addEventListener("deck:in", run, { once: true });
    return () => {
      card.removeEventListener("deck:in", run);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(timer);
      el.textContent = value;
    };
  }, [value]);

  return (
    <b ref={ref} className={className}>
      {value}
    </b>
  );
}
