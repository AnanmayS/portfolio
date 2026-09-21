"use client";

import { useEffect, useState } from "react";
import { person } from "./content";

/*
  Local time in College Park, ticking once a second. Rendered empty on the
  server so the prerendered HTML and hydration agree; the footer keeps its
  height because the line beside it is always there.
*/
const format = new Intl.DateTimeFormat("en-US", {
  timeZone: person.timeZone,
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function Clock() {
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () => setNow(format.format(new Date()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="clock mono" suppressHydrationWarning>
      {now}
    </span>
  );
}
