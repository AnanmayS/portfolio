import type { Metadata } from "next";
import { Suspense } from "react";
import { BackLink } from "../back-link";
import { asset } from "../paths";
import { AskFromQuery, AskStatic } from "./ask-from-query";

export const metadata: Metadata = {
  title: "Ask about me — Ananmay Som Singh",
  description: "Ask about Ananmay's projects, experience and what he's good at.",
};

/* The full "Ask about me" chat, under a strip of water lilies. */
export default function AskPage() {
  return (
    <main className="page page-narrow">
      <BackLink />

      <figure className="hang hang-strip">
        <img className="hang-img" src={asset("/paintings/water-lilies.webp")} alt="" />
      </figure>

      <header className="page-head">
        <h1 className="page-title">Ask about me</h1>
        <p className="page-sub">Answers come from my résumé and projects. Anything else, just email me.</p>
      </header>

      <div className="ask-page">
        <Suspense fallback={<AskStatic />}>
          <AskFromQuery />
        </Suspense>
      </div>
    </main>
  );
}
