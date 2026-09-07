"use client";

import { useEffect, useState } from "react";

/*
  The page follows the system theme until the reader picks one. The choice is
  stamped on the root as data-appearance and stored under this key; the
  inline script in layout.tsx replays it before first paint.
*/
export const THEME_KEY = "appearance";

function effective(): "light" | "dark" {
  const set = document.documentElement.dataset.appearance;
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(effective() === "dark");
  }, []);

  const flip = () => {
    const next = effective() === "dark" ? "light" : "dark";
    document.documentElement.dataset.appearance = next;
    setDark(next === "dark");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode, or storage is full: the page still switches */
    }
  };

  return (
    <button onClick={flip} type="button" aria-label="Toggle light and dark">
      {dark === null ? "theme" : dark ? "light" : "dark"}
    </button>
  );
}
