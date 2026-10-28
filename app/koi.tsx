"use client";

import { useEffect, useRef } from "react";
import { startKoi } from "./koi/engine";

/*
  The pond behind the front page: a canvas the engine in koi/engine.ts swims
  three ASCII koi across. `avoid` names the text column the fish keep clear
  of. Clicking the water feeds them; the hint fades once someone has.
*/
export function Koi({ avoid }: { avoid: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    const column = document.querySelector<HTMLElement>(avoid);
    if (!el || !column) return;
    return startKoi(el, column);
  }, [avoid]);

  return (
    <div id="koi" ref={host} aria-hidden="true">
      <canvas />
      <p className="koi-hint">click the water</p>
    </div>
  );
}
