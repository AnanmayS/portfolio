"use client";

import { useEffect, useRef } from "react";

/*
  The cards below the fold rise in as they arrive. At hydration, any card
  already on screen is left exactly as the server rendered it; the rest get
  `pre` (down and clear) and then `in-view` as they scroll in, a little
  later each when several arrive at once. Once a card has risen the classes
  come off again, so hover transforms run from a clean state. A scroll
  sweep backs up the observer in throttled tabs.
*/
export function Deck({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const pending = Array.from(root.querySelectorAll<HTMLElement>(".card")).filter(
      (card) => card.getBoundingClientRect().top > window.innerHeight * 0.95,
    );
    pending.forEach((card) => card.classList.add("pre"));

    let batch = 0;
    let last = 0;
    const reveal = (card: HTMLElement) => {
      if (!card.classList.contains("pre") || card.classList.contains("in-view")) return;
      const now = performance.now();
      batch = now - last < 120 ? batch + 1 : 0;
      last = now;
      card.style.transitionDelay = `${batch * 70}ms`;
      card.classList.add("in-view");
      card.addEventListener(
        "transitionend",
        () => {
          card.style.transitionDelay = "";
          card.classList.remove("pre", "in-view");
        },
        { once: true },
      );
      observer.unobserve(card);
      card.dispatchEvent(new Event("deck:in"));
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && reveal(entry.target as HTMLElement)),
      { rootMargin: "0px 0px -8% 0px" },
    );
    pending.forEach((card) => observer.observe(card));

    let frame = 0;
    let timer = 0;
    const sweep = () => {
      frame = 0;
      clearTimeout(timer);
      timer = 0;
      const limit = window.innerHeight * 0.94;
      pending.forEach((card) => {
        if (card.classList.contains("pre") && card.getBoundingClientRect().top < limit) reveal(card);
      });
    };
    /* A frame when the tab is visible; a timer when it is not and frames don't run. */
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
      if (!timer) timer = window.setTimeout(sweep, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
