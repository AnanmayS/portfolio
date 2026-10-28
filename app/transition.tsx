"use client";

import { useLayoutEffect } from "react";

/*
  Opening a project from the gallery as one movement rather than a jump: the
  card's demo grows into the project page's demo and its name slides into the
  title, while everything else crossfades. It uses the browser's view
  transitions: the clicked card's parts are named just before the old page
  is captured, the project page carries the same names (plain.css), and the
  page tells the transition it has arrived (<Arrived />) so the new state is
  captured once it has rendered. Browsers without view transitions, and
  readers who prefer less motion, just navigate.
*/

type Navigate = (href: string) => void;

declare global {
  interface Window {
    __projectArrived?: () => void;
  }
}

export function openProject(e: React.MouseEvent<HTMLAnchorElement>, href: string, navigate: Navigate) {
  // A new tab, a new window, a download: leave those to the browser.
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  e.preventDefault();

  const card = e.currentTarget;
  const frame = card.querySelector<HTMLElement>(".frame");
  const name = card.querySelector<HTMLElement>(".name");
  if (frame) frame.style.viewTransitionName = "project-frame";
  if (name) name.style.viewTransitionName = "project-title";

  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          window.__projectArrived = undefined;
          resolve();
        };
        window.__projectArrived = done;
        // Never hold the page frozen if the project page is slow or never says so.
        setTimeout(done, 1200);
        navigate(href);
      }),
  );
  // A transition the browser skips (a hidden tab, say) still navigates; nothing to report.
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}

/* Rendered by a project page: it has painted, so the transition can take its picture. */
export function Arrived() {
  useLayoutEffect(() => {
    window.__projectArrived?.();
  }, []);
  return null;
}
