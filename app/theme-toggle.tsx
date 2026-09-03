"use client";

import { useEffect, useState } from "react";

/*
  Dark is the default; this only ever stores an explicit choice. The attribute
  is `data-appearance` rather than `data-theme` so a host that stamps its own
  theme on the root cannot override the reader's choice here.
*/
export const THEME_KEY = "appearance";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.dataset.appearance === "light");
  }, []);

  const flip = () => {
    const next = light ? "dark" : "light";
    setLight(!light);

    if (next === "light") {
      document.documentElement.dataset.appearance = "light";
    } else {
      delete document.documentElement.dataset.appearance;
    }

    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode, or storage is full: the page still switches */
    }
  };

  return (
    <button className="theme-toggle" onClick={flip} type="button">
      {light ? "dark mode" : "light mode"}
    </button>
  );
}
