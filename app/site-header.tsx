"use client";

import { useEffect, useState } from "react";

/*
  A quiet persistent bar that appears once the hero scrolls away, so the
  resume and email stay one click from wherever a reader has got to.
*/
export function SiteHeader({ resumeHref }: { resumeHref: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 440);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`topbar${shown ? " is-shown" : ""}`}>
      <div className="topbar-inner">
        <span className="topbar-name">Ananmay Som Singh</span>
        <nav className="topbar-links" aria-label="Quick links">
          <a href="mailto:ananmays20@gmail.com">email</a>
          <a className="topbar-cta" href={resumeHref} target="_blank">
            résumé
          </a>
        </nav>
      </div>
    </div>
  );
}
