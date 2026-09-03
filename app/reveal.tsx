"use client";

import { useEffect, useRef, useState } from "react";

/*
  Adds `is-visible` once the element has been scrolled into view. The CSS is
  written so the un-classed state is the FINAL state: if this never runs, the
  diagrams simply render finished rather than staying invisible.
*/
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [seen]);

  return (
    <div ref={ref} className={`${className} reveal${seen ? " is-visible" : ""}`}>
      {children}
    </div>
  );
}
