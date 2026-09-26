"use client";

import { useEffect, useRef, useState } from "react";
import { ComposeTrigger } from "./compose";
import { SendIcon } from "./icons";

/*
  "Ask about me", under the work. MOCK: answers come from the short list
  below, matched by keyword, so the box can be seen and tried before a
  model is wired in. Every answer is written from the résumé and content.ts;
  anything outside them gets the honest fallback, which points at email.

  Answers type out a few words at a time, or appear at once under reduced
  motion. The thread scrolls inside a fixed height so the page never grows.
*/
type Turn = { from: "you" | "me"; text: string; fallback?: boolean };

const STARTERS = ["What's Wildebeest?", "What does he do at GSAlpha Labs?", "What's he best at?"];

const ANSWERS: { keys: string[]; text: string }[] = [
  {
    keys: ["wildebeest", "camera", "wildlife", "scheduler", "fault"],
    text: "A pipeline that sorts wildlife camera-trap photos with two vision models across many machines. Ananmay wrote the scheduler from scratch on Postgres and Redis: a crashed worker's photos are back in play in 0.16 s instead of 5.6 s, and across 30 injected faults no photo was lost or counted twice.",
  },
  {
    keys: ["gsalpha", "homeflow", "intern", "job", "work at", "current"],
    text: "He's a software engineering intern at GSAlpha Labs, building HomeFlow AI: a Next.js platform in production that files closing packets, drafts offers and tracks deadlines for California real-estate agents. His offer workflow drafts a purchase agreement from a 175-page disclosure packet in under 5 minutes.",
  },
  {
    keys: ["best", "strength", "good at", "skills", "language", "stack"],
    text: "Backend and distributed systems, and measuring that they work. Wildebeest's scheduler, Tape's byte-for-byte market-data replay at 2,790× real time, and a test framework at SEDS that cut a hardware regression from 4 hours to 95 minutes. Mostly Go, Python and TypeScript.",
  },
  {
    keys: ["tape", "market", "replay", "exchange"],
    text: "Tape records live exchange feeds to S3 and replays them byte for byte, at 2,790× real time. Every gap in the feed is written into the data, so a backtest never quietly runs on missing trades. It's written in Go on AWS.",
  },
  {
    keys: ["showdown", "pokemon", "pokémon", "reinforcement", "rl"],
    text: "ShowdownRL is a PPO agent that plays live Pokémon Showdown battles through a real browser. It wins 79% of 1,000 simulated battles, masking illegal moves, and a tuning pipeline only promotes a new model if it beats the old one on every metric.",
  },
  {
    keys: ["seds", "cubesat", "gps", "verilog", "satellite"],
    text: "At SEDS @ UMD he built the Python test framework for 26 Verilog modules in a CubeSat GPS receiver, which became the team standard, and cut the hardware regression from 4 hours to 95 minutes by running testbenches in parallel.",
  },
  {
    keys: ["school", "umd", "maryland", "graduate", "degree", "study"],
    text: "He studies computer engineering at the University of Maryland and expects to graduate in May 2028.",
  },
];

const FALLBACK =
  "I don't have an answer for that one. Ananmay can tell you himself: the Email me button reaches him directly.";

function answer(question: string): Turn {
  const q = question.toLowerCase();
  const hit = ANSWERS.find((entry) => entry.keys.some((key) => q.includes(key)));
  return hit ? { from: "me", text: hit.text } : { from: "me", text: FALLBACK, fallback: true };
}

export function Ask() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [shown, setShown] = useState(0); /* words of the last answer on screen */
  const [draft, setDraft] = useState("");
  const thread = useRef<HTMLDivElement>(null);

  const last = turns[turns.length - 1];
  const typing = last?.from === "me" && shown < last.text.split(" ").length;

  /* Type the newest answer out, three words a tick. */
  useEffect(() => {
    if (!last || last.from !== "me") return;
    const words = last.text.split(" ").length;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(words);
      return;
    }
    setShown(0);
    const timer = setInterval(() => {
      setShown((n) => {
        if (n + 3 >= words) clearInterval(timer);
        return Math.min(n + 3, words);
      });
    }, 45);
    return () => clearInterval(timer);
  }, [last]);

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight });
  }, [turns, shown]);

  const ask = (question: string) => {
    const text = question.trim();
    if (!text || typing) return;
    setShown(0);
    setTurns((t) => [...t, { from: "you", text }, answer(text)]);
    setDraft("");
  };

  return (
    <section className="ask" aria-label="Ask about Ananmay">
      <div className="ask-head">
        <h2 className="section-title">Ask about me</h2>
        <span className="ask-note">answers come from my résumé and projects</span>
      </div>

      <div className="ask-thread" ref={thread} aria-live="polite">
        {turns.length === 0 ? (
          <p className="ask-me">
            Hi, I can answer questions about Ananmay&rsquo;s projects, experience and what he&rsquo;s
            good at.
          </p>
        ) : (
          turns.map((turn, i) => {
            const isLast = i === turns.length - 1;
            const words = turn.text.split(" ");
            const text = isLast && turn.from === "me" ? words.slice(0, shown).join(" ") : turn.text;
            return (
              <p key={i} className={turn.from === "you" ? "ask-you" : "ask-me"}>
                {text}
                {turn.fallback && (!isLast || !typing) && (
                  <>
                    {" "}
                    <ComposeTrigger className="ask-mail">Email me</ComposeTrigger>
                  </>
                )}
              </p>
            );
          })
        )}
      </div>

      <div className="ask-starters">
        {STARTERS.map((q) => (
          <button key={q} type="button" className="ask-starter" onClick={() => ask(q)} disabled={typing}>
            {q}
          </button>
        ))}
      </div>

      <form
        className="ask-form"
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
      >
        <label className="ask-label" htmlFor="ask-input">
          Your question
        </label>
        <input
          id="ask-input"
          className="ask-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about projects, experience, skills…"
          maxLength={300}
          autoComplete="off"
        />
        <button className="ask-send" type="submit" aria-label="Ask" disabled={!draft.trim() || typing}>
          <SendIcon size={14} />
        </button>
      </form>
    </section>
  );
}
