"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { projects } from "./content";
import { Framed } from "./framed";
import { openProject } from "./transition";

/*
  The projects as a gallery: one card each, its demo playing on top and its
  name, year and one sentence under it, in a row that runs past the column to
  the edge of the screen and scrolls sideways. Scrolling up and down (a wheel,
  a trackpad, a swipe on a phone) runs through it too, anywhere on the page,
  until it reaches either end, when the page takes over again. Opening a card
  grows its demo into the project page (transition.tsx).
*/
export function Gallery() {
  const row = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = row.current;
    if (!el) return;

    // Move the row by `delta` px if it can go that way; say whether it did.
    const move = (delta: number) => {
      const end = el.scrollWidth - el.clientWidth;
      if ((delta < 0 && el.scrollLeft <= 0) || (delta > 0 && el.scrollLeft >= end - 1)) return false;
      el.scrollLeft += delta;
      return true;
    };

    // Scrolling up and down anywhere on the page runs through the gallery;
    // at either end, the page scrolls as usual.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.ctrlKey) return;
      if (move(e.deltaY)) e.preventDefault();
    };

    // The same on a phone: an up or down swipe moves the row along.
    let lastY = 0;
    let vertical: boolean | null = null;
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      vertical = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (vertical === null) {
        const dx = Math.abs(t.clientX - startX), dy = Math.abs(t.clientY - lastY);
        if (dx + dy < 6) return;
        vertical = dy > dx;
      }
      if (!vertical) return;
      const dy = lastY - t.clientY;
      lastY = t.clientY;
      if (move(dy)) e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="gallery" ref={row} aria-label="Projects">
      {projects.map((p) => (
        <Link
          key={p.slug}
          className="card"
          href={`/work/${p.slug}`}
          onClick={(e) => openProject(e, `/work/${p.slug}`, (href) => router.push(href))}
        >
          <Framed project={p} />
          <span className="card-head">
            <span className="name">{p.name}</span>
            <span className="meta">{p.year}</span>
          </span>
          <span className="card-lede">{p.lede}</span>
        </Link>
      ))}
    </div>
  );
}
