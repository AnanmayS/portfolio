"use client";

import { useSearchParams } from "next/navigation";
import { Ask } from "../ask";
import { askMore, askStarters } from "../content";

const STARTERS = [...askStarters, ...askMore];

/* The chat, with the question the front page linked here with (?q=) asked first. */
export function AskFromQuery() {
  const initial = useSearchParams().get("q")?.slice(0, 300) || undefined;
  return <Ask starters={STARTERS} initial={initial} heading={false} />;
}

/* The same chat without a first question: what the static page ships before JS runs. */
export function AskStatic() {
  return <Ask starters={STARTERS} heading={false} />;
}
