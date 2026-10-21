"use client";

import { useEffect, useRef } from "react";

/*
  The engraving at the top of the front page. The file is a sepia print; the
  filter below tints it to the page's ink and paper, so it never drifts from
  the type. On scroll it drifts down at a fraction of the page's speed.

  The table values are the ink and the paper, per channel, as fractions of
  255: black in the print becomes ink, white becomes paper. The linear step
  first lifts the print's own cream (about 0.87 luminance) to white.
*/
const ink = [0.118, 0.208, 0.439];
const paper = [0.945, 0.925, 0.878];

export function Plate({ src, alt }: { src: string; alt: string }) {
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = img.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const plate = el.closest(".plate") as HTMLElement | null;
    if (!plate) return;

    let frame = 0;
    const move = () => {
      frame = 0;
      const y = Math.min(window.scrollY, plate.offsetHeight) * 0.22;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(move);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    move();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="plate-art">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <filter id="ink" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values=".2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.16" intercept="-0.02" />
            <feFuncG type="linear" slope="1.16" intercept="-0.02" />
            <feFuncB type="linear" slope="1.16" intercept="-0.02" />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="table" tableValues={`${ink[0]} ${paper[0]}`} />
            <feFuncG type="table" tableValues={`${ink[1]} ${paper[1]}`} />
            <feFuncB type="table" tableValues={`${ink[2]} ${paper[2]}`} />
          </feComponentTransfer>
        </filter>
      </svg>
      <img ref={img} className="plate-img" src={src} width={1916} height={821} alt={alt} fetchPriority="high" />
    </div>
  );
}
