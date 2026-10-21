"use client";

import { useEffect, useRef } from "react";

/*
  The engraving at the top of the front page. The file is a sepia print; the
  filter below tints it to the page's ink and paper, so it never drifts from
  the type. On wide screens, where the plate is behind the name, it drifts
  down at a fraction of the scroll; stacked under the name it stays put.

  The table values are the ink and the paper, per channel, as fractions of
  255: black in the print becomes ink, white becomes paper. The linear step
  first lifts the print's own cream (about 0.87 luminance) to white. The
  defaults below mirror --foreground and --background in globals.css for the
  first paint; on mount they are read from the live tokens, so a palette
  change carries the plate with it.
*/
const INK = [0.118, 0.208, 0.439];
const PAPER = [0.945, 0.925, 0.878];

/* The plate sits behind the name only above this width (see home.css). */
const WIDE = "(min-width: 64.0625rem)";

function channels(hex: string): number[] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
}

export function Plate({ src, alt }: { src: string; alt: string }) {
  const img = useRef<HTMLImageElement>(null);
  const funcs = useRef<(SVGFEFuncRElement | SVGFEFuncGElement | SVGFEFuncBElement | null)[]>([]);

  /* Tint from the live tokens. */
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const ink = channels(style.getPropertyValue("--foreground")) ?? INK;
    const paper = channels(style.getPropertyValue("--background")) ?? PAPER;
    funcs.current.forEach((el, i) => el?.setAttribute("tableValues", `${ink[i]} ${paper[i]}`));
  }, []);

  /* Parallax, wide screens only. */
  useEffect(() => {
    const el = img.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const plate = el.closest(".plate") as HTMLElement | null;
    if (!plate) return;
    const wide = matchMedia(WIDE);

    let frame = 0;
    const move = () => {
      frame = 0;
      if (!wide.matches) {
        el.style.transform = "";
        return;
      }
      const y = Math.min(window.scrollY, plate.offsetHeight) * 0.22;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(move);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    wide.addEventListener("change", move);
    move();
    return () => {
      window.removeEventListener("scroll", onScroll);
      wide.removeEventListener("change", move);
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
            <feFuncR ref={(n) => void (funcs.current[0] = n)} type="table" tableValues={`${INK[0]} ${PAPER[0]}`} />
            <feFuncG ref={(n) => void (funcs.current[1] = n)} type="table" tableValues={`${INK[1]} ${PAPER[1]}`} />
            <feFuncB ref={(n) => void (funcs.current[2] = n)} type="table" tableValues={`${INK[2]} ${PAPER[2]}`} />
          </feComponentTransfer>
        </filter>
      </svg>
      <img ref={img} className="plate-img" src={src} width={1916} height={821} alt={alt} fetchPriority="high" />
    </div>
  );
}
