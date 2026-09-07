"use client";

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import {
  RATE,
  SHOWN,
  SYMBOL,
  WINDOW_MS,
  records as baseRecords,
  type TapeRecord,
} from "./tape-replay-data";

/*
  Tape replays a stored window of exchange feed, byte for byte the same every
  run, and every hole the recorder found is written into the data as a record
  rather than into a log line. This is that window with a playhead on it.

  Three things the visitor can do, and each one is the project's claim rather
  than a decoration:

  · Scrub. The book below is folded from the level2 updates since the last
    reseed, so the state at any instant is reconstructed rather than stored.
    Snapshots every CHUNK records keep a drag at 60fps from being O(n).
  · Land in a gap. Replay stops there, the book is the last thing that was
    true, and the note says how many sequence numbers went missing. That is
    what "gaps are never silent" looks like from the outside.
  · Sever the feed. A new hole appears in the data, the timeline gains a mark,
    and the digest changes — because the window changed. Scrubbing and
    replaying it a thousand times never changes it, which is the whole point.

  Per-frame work writes to refs and the DOM. React state here is only the
  things that change a few times a minute: playing, speed, and the severs.
*/

/* Where the playhead starts: far enough in that the book and the tape are
   both full on first paint, and clear of the gap at 38s. */
const START_MS = 12_000;
/* How much feed a severed connection costs. */
const SEVER_MS = 5_000;
/* Records between reconstruction checkpoints. */
const CHUNK = 64;
/* Density columns across the timeline. */
const COLUMNS = 120;

const SPEEDS = [1, 10, 100, 2790] as const;
type Speed = (typeof SPEEDS)[number];

/* ---------------------------------------------------------------- format */

function pad(n: number, width: number) {
  return String(n).padStart(width, "0");
}

/** 00:38.120 — the offset into the window, as `tape replay` prints it. */
function clock(ms: number) {
  const clamped = Math.max(0, Math.min(WINDOW_MS, ms));
  const whole = Math.floor(clamped / 1000);
  return `${pad(Math.floor(whole / 60), 2)}:${pad(whole % 60, 2)}.${pad(
    Math.floor(clamped) % 1000,
    3,
  )}`;
}

/* Grouped by hand rather than through Intl, so the server and the browser
   cannot disagree about a locale. */
function group(n: number) {
  const s = String(Math.trunc(Math.abs(n)));
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ",";
    out += s[i];
  }
  return (n < 0 ? "-" : "") + out;
}

function money(v: number) {
  const cents = Math.round(v * 100);
  return `${group(Math.trunc(cents / 100))}.${pad(Math.abs(cents) % 100, 2)}`;
}

function amount(v: number) {
  return v.toFixed(4);
}

/* ------------------------------------------------------------- the window */

type Level = { price: number; size: number };
type Gap = { start: number; end: number; missing: number };

/** The state of the feed at one instant, folded out of the records. */
type View = {
  bids: Level[];
  asks: Level[];
  trades: TapeRecord[];
  seq: number | null;
  /** The gap the playhead is standing in, if any. */
  gap: Gap | null;
};

type Book = {
  bids: Map<number, number>;
  asks: Map<number, number>;
  trades: TapeRecord[];
  seq: number | null;
};

function emptyBook(): Book {
  return { bids: new Map(), asks: new Map(), trades: [], seq: null };
}

function cloneBook(b: Book): Book {
  return {
    bids: new Map(b.bids),
    asks: new Map(b.asks),
    trades: b.trades.slice(),
    seq: b.seq,
  };
}

/** Folds one record into the book. A reseed reseats it; that is what a reseed is. */
function fold(b: Book, rec: TapeRecord) {
  switch (rec.kind) {
    case "l2": {
      const side = rec.side === "bid" ? b.bids : b.asks;
      if (rec.size === 0) side.delete(rec.price);
      else side.set(rec.price, rec.size);
      return;
    }
    case "trade": {
      b.trades.push(rec);
      if (b.trades.length > SHOWN) b.trades.shift();
      b.seq = rec.seq;
      return;
    }
    case "reseed": {
      b.bids.clear();
      b.asks.clear();
      return;
    }
    default:
      return;
  }
}

function topOf(side: Map<number, number>, ascending: boolean): Level[] {
  const out: Level[] = [];
  for (const [price, size] of side) out.push({ price, size });
  out.sort((a, c) => (ascending ? a.price - c.price : c.price - a.price));
  return out.slice(0, SHOWN);
}

/**
 * Every gap in a window, as the span of wall time the feed was off the air.
 * The span runs from the last message before the hole to the gap record that
 * proved it, which is exactly the region replay refuses to cross.
 */
function gapsOf(recs: TapeRecord[]): Gap[] {
  const out: Gap[] = [];
  for (let i = 0; i < recs.length; i++) {
    const rec = recs[i];
    if (rec.kind !== "gap") continue;
    let j = i - 1;
    while (j >= 0 && recs[j].kind !== "l2" && recs[j].kind !== "trade") j--;
    out.push({
      start: j >= 0 ? recs[j].t : rec.t,
      end: rec.t,
      missing: rec.missing ?? 0,
    });
  }
  return out;
}

/**
 * The window with the visitor's severed spans cut out of it.
 *
 * Cutting is not deleting: the records inside a hole still moved the book, and
 * the book on the far side is not the book we last saw. So the fold keeps
 * running through the hole unseen, and the reconnect writes what a reconnect
 * writes — a reseed, a gap record carrying the sequence numbers that went
 * missing, and the fresh snapshot the resubscribe hands back.
 */
function severed(base: TapeRecord[], severs: number[]): TapeRecord[] {
  if (severs.length === 0) return base;

  const holes = severs
    .slice()
    .sort((a, b) => a - b)
    .map((start) => ({ start, end: start + SEVER_MS }));

  /* Sequence numbers are only visible on trades, so the size of a hole is read
     off the trades on either side of it. */
  const prevSeq: (number | null)[] = new Array(base.length).fill(null);
  const nextSeq: (number | null)[] = new Array(base.length).fill(null);
  let seen: number | null = null;
  for (let i = 0; i < base.length; i++) {
    if (base[i].kind === "trade") seen = base[i].seq;
    prevSeq[i] = seen;
  }
  seen = null;
  for (let i = base.length - 1; i >= 0; i--) {
    if (base[i].kind === "trade") seen = base[i].seq;
    nextSeq[i] = seen;
  }

  const out: TapeRecord[] = [];
  const book = emptyBook();
  let hole = 0;
  let cutFrom = -1;

  for (let i = 0; i < base.length; i++) {
    const rec = base[i];
    while (hole < holes.length && rec.t >= holes[hole].end) hole++;
    const inside = hole < holes.length && rec.t >= holes[hole].start;

    if (inside) {
      if (cutFrom < 0) cutFrom = i;
      fold(book, rec);
      continue;
    }

    if (cutFrom >= 0) {
      const before = cutFrom > 0 ? prevSeq[cutFrom - 1] : null;
      const after = nextSeq[i];
      const missing =
        before !== null && after !== null && after - before > 1 ? after - before - 1 : i - cutFrom;
      out.push({
        t: rec.t - 40,
        seq: null,
        kind: "reseed",
        price: 0,
        size: 0,
        side: "",
        reason: "reconnect: severed",
      });
      out.push({
        t: rec.t - 20,
        seq: null,
        kind: "gap",
        price: 0,
        size: 0,
        side: "",
        missing,
      });
      /* the snapshot the exchange sends back on resubscribe: one frame, so the
         levels land together, and sorted so the window is the same window
         however this ran */
      let at = rec.t - 19;
      for (const side of ["bid", "ask"] as const) {
        const levels = [...(side === "bid" ? book.bids : book.asks)].sort((a, b) =>
          side === "bid" ? b[0] - a[0] : a[0] - b[0],
        );
        for (const [price, size] of levels) {
          out.push({ t: at, seq: null, kind: "l2", price, size, side });
          at += 0.02;
        }
      }
      cutFrom = -1;
    }

    fold(book, rec);
    out.push(rec);
  }

  /* A hole with nothing after it would leave records missing and no record of
     it, which is the one outcome this project exists to prevent. */
  if (cutFrom >= 0) {
    out.push({
      t: WINDOW_MS - 20,
      seq: null,
      kind: "reseed",
      price: 0,
      size: 0,
      side: "",
      reason: "reconnect: severed",
    });
    out.push({
      t: WINDOW_MS - 10,
      seq: null,
      kind: "gap",
      price: 0,
      size: 0,
      side: "",
      missing: base.length - cutFrom,
    });
  }

  return out;
}

/* ------------------------------------------------------- reconstruction */

type Window = {
  recs: TapeRecord[];
  times: number[];
  checkpoints: Book[];
  gaps: Gap[];
  density: number[];
  digest: string;
};

function checkpointsOf(recs: TapeRecord[]) {
  const marks: Book[] = [];
  const book = emptyBook();
  for (let i = 0; i < recs.length; i++) {
    if (i % CHUNK === 0) marks.push(cloneBook(book));
    fold(book, recs[i]);
  }
  marks.push(cloneBook(book));
  return marks;
}

/** Messages per column across the window, the shape `tape verify` draws. */
function densityOf(recs: TapeRecord[]) {
  const bins = new Array(COLUMNS).fill(0);
  for (const rec of recs) {
    if (rec.kind !== "l2" && rec.kind !== "trade") continue;
    const k = Math.min(COLUMNS - 1, Math.floor((rec.t / WINDOW_MS) * COLUMNS));
    bins[k] += 1;
  }
  /* A snapshot arrives as one frame of many records and would otherwise
     flatten the whole window, so the scale is the 90th percentile and a
     column is allowed to top out. */
  const sorted = bins.filter((n) => n > 0).sort((a, b) => a - b);
  const peak = Math.max(1, sorted[Math.floor(sorted.length * 0.9)] ?? 1);
  return bins.map((n) => Math.min(1, n / peak));
}

/**
 * FNV-1a over the canonical form of every record, in four lanes so it reads
 * like the digest it stands in for. Tape hashes canonical NDJSON with SHA-256
 * in CI; this is the same idea at a size a browser can do while you watch.
 */
function digestOf(recs: TapeRecord[]) {
  const lanes = [0x811c9dc5, 0x1000193, 0x7f4a7c15, 0x9e3779b9];
  const out: string[] = [];
  for (let lane = 0; lane < lanes.length; lane++) {
    let h = lanes[lane] >>> 0;
    for (const rec of recs) {
      const text = `${rec.kind}|${rec.t}|${rec.seq ?? ""}|${rec.side}|${rec.price}|${rec.size}|${rec.missing ?? ""}`;
      for (let i = 0; i < text.length; i++) {
        h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0;
      }
      h = Math.imul(h ^ 0x0a, 0x01000193) >>> 0;
    }
    out.push(h.toString(16).padStart(8, "0"));
  }
  return out.join("");
}

function windowOf(severs: number[]): Window {
  const recs = severed(baseRecords, severs);
  return {
    recs,
    times: recs.map((r) => r.t),
    checkpoints: checkpointsOf(recs),
    gaps: gapsOf(recs),
    density: densityOf(recs),
    digest: digestOf(recs),
  };
}

/** Index of the last record at or before `ms`. */
function indexAt(times: number[], ms: number) {
  let lo = 0;
  let hi = times.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= ms) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

/** The book, the tape and the sequence number at `ms`. */
function viewAt(win: Window, ms: number): View {
  const idx = indexAt(win.times, ms);
  const mark = Math.max(0, Math.min(win.checkpoints.length - 1, Math.floor((idx + 1) / CHUNK)));
  const book = cloneBook(win.checkpoints[mark]);
  for (let i = mark * CHUNK; i <= idx; i++) fold(book, win.recs[i]);

  let gap: Gap | null = null;
  for (const g of win.gaps) {
    if (ms >= g.start && ms <= g.end) gap = g;
  }

  return {
    bids: topOf(book.bids, false),
    asks: topOf(book.asks, true),
    trades: book.trades,
    seq: book.seq,
    gap,
  };
}

/* The window as it stands before anyone touches it. Built once, at module
   load, so the server render and the first client render are the same. */
const BASE = windowOf([]);
const SEED = viewAt(BASE, START_MS);

/* ------------------------------------------------------------- the panel */

type Cells = {
  depth: HTMLSpanElement | null;
  px: HTMLSpanElement | null;
  sz: HTMLSpanElement | null;
};

type TradeCells = {
  at: HTMLSpanElement | null;
  side: HTMLSpanElement | null;
  px: HTMLSpanElement | null;
  sz: HTMLSpanElement | null;
};

type PanelRefs = {
  book: HTMLDivElement | null;
  note: HTMLParagraphElement | null;
  spread: HTMLSpanElement | null;
  asks: Cells[];
  bids: Cells[];
  trades: TradeCells[];
};

function makeRefs(): PanelRefs {
  const cells = () => Array.from({ length: SHOWN }, () => ({ depth: null, px: null, sz: null }));
  return {
    book: null,
    note: null,
    spread: null,
    asks: cells(),
    bids: cells(),
    trades: Array.from({ length: SHOWN }, () => ({ at: null, side: null, px: null, sz: null })),
  };
}

const rows = Array.from({ length: SHOWN }, (_, i) => i);

/*
  Rendered once from the seed and written to imperatively after that: a scrub
  touches sixteen book rows and eight tape rows sixty times a second, and none
  of that should go through React.
*/
const Panel = memo(function Panel({ refs, seed }: { refs: PanelRefs; seed: View }) {
  const askSeed = seed.asks;
  const bidSeed = seed.bids;
  const peak = Math.max(
    1e-9,
    ...askSeed.map((l) => l.size),
    ...bidSeed.map((l) => l.size),
  );
  const spread =
    askSeed.length && bidSeed.length ? askSeed[0].price - bidSeed[0].price : 0;

  return (
    <div className="tape-panes">
      <div className="tape-pane">
        <div className="tape-panehead">
          <span>book · {SYMBOL}</span>
          <span>size</span>
        </div>

        <div
          className="tape-book"
          ref={(el) => {
            refs.book = el;
          }}
        >
          {rows.map((i) => {
            /* asks read downwards to the inside, so the best ask sits on the
               spread line the way a book is drawn on a desk */
            const level = askSeed[SHOWN - 1 - i];
            return (
              <div className="tape-row tape-ask" key={`a${i}`}>
                <span
                  className="tape-px"
                  ref={(el) => {
                    refs.asks[i].px = el;
                  }}
                >
                  {level ? money(level.price) : "—"}
                </span>
                <span className="tape-bar">
                  <span
                    className="tape-depth"
                    style={{ width: level ? `${(level.size / peak) * 100}%` : "0%" }}
                    ref={(el) => {
                      refs.asks[i].depth = el;
                    }}
                  />
                </span>
                <span
                  className="tape-sz"
                  ref={(el) => {
                    refs.asks[i].sz = el;
                  }}
                >
                  {level ? amount(level.size) : ""}
                </span>
              </div>
            );
          })}

          <div className="tape-spread">
            <span>spread</span>
            <span
              ref={(el) => {
                refs.spread = el;
              }}
            >
              {money(spread)}
            </span>
          </div>

          {rows.map((i) => {
            const level = bidSeed[i];
            return (
              <div className="tape-row tape-bid" key={`b${i}`}>
                <span
                  className="tape-px"
                  ref={(el) => {
                    refs.bids[i].px = el;
                  }}
                >
                  {level ? money(level.price) : "—"}
                </span>
                <span className="tape-bar">
                  <span
                    className="tape-depth"
                    style={{ width: level ? `${(level.size / peak) * 100}%` : "0%" }}
                    ref={(el) => {
                      refs.bids[i].depth = el;
                    }}
                  />
                </span>
                <span
                  className="tape-sz"
                  ref={(el) => {
                    refs.bids[i].sz = el;
                  }}
                >
                  {level ? amount(level.size) : ""}
                </span>
              </div>
            );
          })}
        </div>

        <p
          className="tape-gapnote"
          ref={(el) => {
            refs.note = el;
          }}
          hidden
        />
      </div>

      <div className="tape-pane">
        <div className="tape-panehead">
          <span>tape · matches</span>
          <span>size</span>
        </div>
        <div className="tape-trades">
          {rows.map((i) => {
            /* newest print at the top */
            const trade = seed.trades[seed.trades.length - 1 - i];
            return (
              <div className="tape-trow" key={`t${i}`}>
                <span
                  className="tape-at"
                  ref={(el) => {
                    refs.trades[i].at = el;
                  }}
                >
                  {trade ? clock(trade.t) : ""}
                </span>
                <span
                  className="tape-side"
                  ref={(el) => {
                    refs.trades[i].side = el;
                  }}
                >
                  {trade ? trade.side : ""}
                </span>
                <span
                  className="tape-px"
                  ref={(el) => {
                    refs.trades[i].px = el;
                  }}
                >
                  {trade ? money(trade.price) : ""}
                </span>
                <span
                  className="tape-sz"
                  ref={(el) => {
                    refs.trades[i].sz = el;
                  }}
                >
                  {trade ? amount(trade.size) : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

/* ---------------------------------------------------------------- demo */

export function TapeReplay() {
  const clipId = useId().replace(/:/g, "");

  const [severs, setSevers] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(100);
  const [still, setStill] = useState(false);

  const win = useMemo(() => (severs.length === 0 ? BASE : windowOf(severs)), [severs]);

  const refs = useRef<PanelRefs>(makeRefs());
  const offset = useRef(START_MS);
  const head = useRef<HTMLSpanElement>(null);
  const clip = useRef<SVGRectElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const severBtn = useRef<HTMLButtonElement>(null);
  const hint = useRef<HTMLSpanElement>(null);

  /* --- painting --- */

  const paint = useCallback(
    (ms: number) => {
      const at = Math.max(0, Math.min(WINDOW_MS, ms));
      offset.current = at;
      const view = viewAt(win, at);
      const cells = refs.current;

      const fraction = at / WINDOW_MS;
      if (head.current) head.current.style.left = `${fraction * 100}%`;
      if (clip.current) clip.current.setAttribute("width", String(720 * fraction));

      const seqText = view.seq === null ? "—" : group(view.seq);
      if (readout.current) readout.current.textContent = `t = ${clock(at)} · seq ${seqText}`;
      if (track.current) {
        track.current.setAttribute("aria-valuenow", String(Math.round(at)));
        track.current.setAttribute(
          "aria-valuetext",
          view.gap
            ? `${clock(at)}, inside a gap of ${group(view.gap.missing)} missing sequence numbers`
            : `${clock(at)}, sequence ${seqText}`,
        );
      }

      let peak = 1e-9;
      for (const level of view.asks) peak = Math.max(peak, level.size);
      for (const level of view.bids) peak = Math.max(peak, level.size);

      for (let i = 0; i < SHOWN; i++) {
        const ask = view.asks[SHOWN - 1 - i];
        const row = cells.asks[i];
        if (row.px) row.px.textContent = ask ? money(ask.price) : "—";
        if (row.sz) row.sz.textContent = ask ? amount(ask.size) : "";
        if (row.depth) row.depth.style.width = ask ? `${(ask.size / peak) * 100}%` : "0%";

        const bid = view.bids[i];
        const brow = cells.bids[i];
        if (brow.px) brow.px.textContent = bid ? money(bid.price) : "—";
        if (brow.sz) brow.sz.textContent = bid ? amount(bid.size) : "";
        if (brow.depth) brow.depth.style.width = bid ? `${(bid.size / peak) * 100}%` : "0%";
      }

      if (cells.spread) {
        const inside =
          view.asks.length && view.bids.length ? view.asks[0].price - view.bids[0].price : 0;
        cells.spread.textContent = money(inside);
      }

      for (let i = 0; i < SHOWN; i++) {
        const trade = view.trades[view.trades.length - 1 - i];
        const row = cells.trades[i];
        if (row.at) row.at.textContent = trade ? clock(trade.t) : "";
        if (row.side) row.side.textContent = trade ? trade.side : "";
        if (row.px) row.px.textContent = trade ? money(trade.price) : "";
        if (row.sz) row.sz.textContent = trade ? amount(trade.size) : "";
      }

      const isGap = view.gap !== null;
      if (cells.book) cells.book.classList.toggle("is-flagged", isGap);
      if (cells.note) cells.note.hidden = !isGap;
      if (isGap && view.gap && cells.note) {
        cells.note.textContent =
          `gap · ${group(view.gap.missing)} sequence numbers missing · ` +
          `replay stops here; nothing backtests on this window`;
      }

      /* Severing needs somewhere to cut, and a hole inside a hole says
         nothing. The button follows the playhead rather than the last render. */
      const near = win.gaps.some((g) => at >= g.start - 200 && at <= g.end);
      const room = at <= WINDOW_MS - SEVER_MS - 2000;
      if (severBtn.current) severBtn.current.disabled = near || !room;
      if (hint.current) {
        hint.current.textContent = near
          ? " · playhead is inside one"
          : room
            ? ""
            : " · no feed left to cut";
      }
    },
    [win],
  );

  /* Repaint after every commit, so a render that resets seeded text — a sever,
     a speed change — is corrected before the browser draws it. */
  useEffect(() => {
    paint(offset.current);
  });

  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    setStill(query.matches);
    const onChange = () => setStill(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* --- play --- */

  useEffect(() => {
    if (!playing) return;

    if (offset.current >= WINDOW_MS) paint(0);

    /* A moving playhead is the model moving, so it animates — but a reader who
       asked for less motion gets the same replay one step a second. */
    if (still) {
      const timer = setInterval(() => {
        const next = offset.current + 1000 * speed;
        if (next >= WINDOW_MS) {
          paint(WINDOW_MS);
          setPlaying(false);
          return;
        }
        paint(next);
      }, 1000);
      return () => clearInterval(timer);
    }

    let last = performance.now();
    let frame = requestAnimationFrame(function loop(now) {
      const next = offset.current + (now - last) * speed;
      last = now;
      if (next >= WINDOW_MS) {
        paint(WINDOW_MS);
        setPlaying(false);
        return;
      }
      paint(next);
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, still, paint]);

  /* --- scrubbing --- */

  const seek = useCallback(
    (clientX: number) => {
      const el = track.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      if (box.width <= 0) return;
      paint(((clientX - box.left) / box.width) * WINDOW_MS);
    },
    [paint],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setPlaying(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    seek(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    seek(event.clientX);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const fine = event.shiftKey ? 25 : 250;
    let next: number | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = offset.current - fine;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next = offset.current + fine;
    else if (event.key === "PageDown") next = offset.current - 5000;
    else if (event.key === "PageUp") next = offset.current + 5000;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = WINDOW_MS;
    if (next === null) return;
    event.preventDefault();
    setPlaying(false);
    paint(next);
  };

  /* --- severing --- */

  const sever = () => {
    setPlaying(false);
    setSevers((prev) => [...prev, Math.round(offset.current)]);
  };

  const reset = () => {
    setPlaying(false);
    setSevers([]);
  };

  const flags = win.gaps.length;
  /* Sixty seconds of feed at the selected speed: 60 s, 6 s, 0.6 s, and at
     2,790x — the rate `tape verify` measured on a real capture — 21 ms. */
  const inWhat =
    speed >= 1000
      ? `${Math.floor(WINDOW_MS / speed)} ms`
      : `${(WINDOW_MS / speed / 1000).toFixed(speed >= 100 ? 1 : 0)} s`;

  return (
    <figure className="tape">
      <div className="tape-head">
        <span className="tape-what">
          replay · {SYMBOL} · {WINDOW_MS / 1000}s window · {group(win.recs.length)} records
        </span>
        <span className="tape-now" ref={readout}>
          {`t = ${clock(START_MS)} · seq ${SEED.seq === null ? "—" : group(SEED.seq)}`}
        </span>
      </div>

      <div
        className="tape-track"
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={`Playhead over a ${WINDOW_MS / 1000} second capture of ${SYMBOL}`}
        aria-valuemin={0}
        aria-valuemax={WINDOW_MS}
        aria-valuenow={START_MS}
        aria-valuetext={`${clock(START_MS)}, sequence ${SEED.seq === null ? "none" : group(SEED.seq)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <svg
          className="tape-hist"
          viewBox="0 0 720 40"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id={clipId}>
              <rect ref={clip} x="0" y="0" width={720 * (START_MS / WINDOW_MS)} height="40" />
            </clipPath>
          </defs>
          {win.density.map((v, i) =>
            v > 0 ? (
              <rect
                key={i}
                x={i * (720 / COLUMNS)}
                y={40 - Math.max(2, v * 38)}
                width={720 / COLUMNS - 1.4}
                height={Math.max(2, v * 38)}
                fill="var(--slow)"
              />
            ) : null,
          )}
          <g clipPath={`url(#${clipId})`}>
            {win.density.map((v, i) =>
              v > 0 ? (
                <rect
                  key={i}
                  x={i * (720 / COLUMNS)}
                  y={40 - Math.max(2, v * 38)}
                  width={720 / COLUMNS - 1.4}
                  height={Math.max(2, v * 38)}
                  fill="var(--ink)"
                />
              ) : null,
            )}
          </g>
        </svg>

        {win.gaps.map((gap) => (
          <span
            key={gap.start}
            className="tape-gapmark"
            style={{
              left: `${(gap.start / WINDOW_MS) * 100}%`,
              width: `${((gap.end - gap.start) / WINDOW_MS) * 100}%`,
            }}
          />
        ))}

        <span className="tape-playhead" ref={head} style={{ left: `${(START_MS / WINDOW_MS) * 100}%` }} />
      </div>

      <div className="tape-controls">
        <button
          type="button"
          className="tape-go"
          onClick={() => setPlaying((on) => !on)}
          aria-label={playing ? "Pause replay" : "Play replay"}
        >
          {playing ? "pause" : "play"}
        </button>

        <div className="tape-speeds" role="group" aria-label="Replay speed">
          {SPEEDS.map((option) => (
            <button
              key={option}
              type="button"
              className="tape-speed"
              aria-pressed={speed === option}
              onClick={() => setSpeed(option)}
            >
              {group(option)}×
            </button>
          ))}
        </div>

        <span className="tape-rate">
          {speed >= 1000 ? "tape verify · " : ""}
          {WINDOW_MS / 1000} s replayed in {inWhat}
        </span>
      </div>

      <div className="tape-controls">
        <button
          type="button"
          className="tape-sever"
          ref={severBtn}
          onClick={sever}
          title="Cut the next 5 seconds of feed out of the window at the playhead"
        >
          sever feed
        </button>
        <button type="button" className="tape-reset" onClick={reset} disabled={severs.length === 0}>
          reset
        </button>
        <span className="tape-flags">
          {group(flags)} gap{flags === 1 ? "" : "s"} flagged
          <span ref={hint} />
        </span>
      </div>

      <Panel refs={refs.current} seed={SEED} />

      <p className="tape-digest">
        <span className="tape-k">digest</span>
        <code>{win.digest}</code>
        <span className="tape-k">fnv1a of this window · scrubbing never changes it</span>
      </p>

      <p className="tape-caption">
        Synthetic feed in Tape&apos;s record format, {group(baseRecords.length)} records at {RATE}/s,
        generated from a fixed seed. Measured on a real capture: 6,434 records replayed in 72 ms,
        2,790× real time, byte-identical (sha256 checked in CI).
      </p>
    </figure>
  );
}
