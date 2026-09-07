/*
  A synthetic BTC-USD window in Tape's record format.

  Tape records a live exchange feed and replays it byte-identically; this file
  stands in for a capture, because no capture is checked into the portfolio.
  The shape is the real one: `level2_batch` book updates carry no sequence
  number, `matches` trades do, a reconnect writes a reseed record and the hole
  it left is written into the data as a gap record carrying the count of
  sequence numbers that went missing.

  Everything here is generated at module load from a fixed seed, so the server
  render and the first client render see exactly the same window. Nothing calls
  Date.now() or Math.random().
*/

export type TapeKind = "trade" | "l2" | "reseed" | "gap";

/** One stored record. Prices are dollars, sizes are BTC. */
export type TapeRecord = {
  /** Milliseconds from the start of the window. */
  t: number;
  /** Full-channel sequence number, or null for records that carry none. */
  seq: number | null;
  kind: TapeKind;
  /** Price level (l2) or trade price. Zero on reseed and gap records. */
  price: number;
  /** New size at the level (0 removes it), or the traded size. */
  size: number;
  /** "bid" | "ask" on l2, "buy" | "sell" on a trade, "" otherwise. */
  side: "bid" | "ask" | "buy" | "sell" | "";
  /** Sequence numbers lost, on gap records only. */
  missing?: number;
  /** Why the subscription reseeded, on reseed records only. */
  reason?: string;
};

export const SYMBOL = "BTC-USD";
/** Length of the captured window, milliseconds. */
export const WINDOW_MS = 60_000;
/** Book depth held per side. */
export const DEPTH = 14;
/** Levels shown per side. */
export const SHOWN = 8;

/* The one pre-existing hole: the feed dropped at 38s and came back 526
   sequence numbers later, which is one of the three gaps the real fault
   injection run produced (649 · 526 · 3,240). */
const GAP_AT_MS = 38_000;
const GAP_MISSING = 526;

/* mulberry32. Small, fast, and identical on every machine — which is the only
   property that matters here, since the server and the browser both run it. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Level = { p: number; s: number };

function round2(v: number) {
  return Math.round(v * 100) / 100;
}

function round4(v: number) {
  return Math.round(v * 10_000) / 10_000;
}

function build(): TapeRecord[] {
  const rand = mulberry32(0x7a9e3c15);
  const out: TapeRecord[] = [];

  /* Sequence numbers on the full channel advance faster than the messages we
     subscribe to, because every order lifecycle event consumes one. ~6.5 per
     record at ~30 records a second is ~195/sec, which is what makes a 526
     number hole read as roughly two and a half seconds off the air. */
  let seq = 41_882_100;
  let t = 0;
  const step = () => 4 + Math.floor(rand() * 6);

  /* Book state. bids descend, asks ascend, both DEPTH deep. */
  let mid = 97_014.5;
  const bids: Level[] = [];
  const asks: Level[] = [];

  const size = () => round4(0.004 + rand() ** 3 * 2.4);
  const tick = () => (4 + Math.floor(rand() ** 2 * 90)) / 100;

  let p = mid - 0.06;
  for (let i = 0; i < DEPTH; i++) {
    bids.push({ p: round2(p), s: size() });
    p -= tick();
  }
  p = mid + 0.06;
  for (let i = 0; i < DEPTH; i++) {
    asks.push({ p: round2(p), s: size() });
    p += tick();
  }

  /* A record costs time and sequence space whether or not we were connected to
     see it, so the clock and the counter advance in one place. That is what
     makes the hole below arithmetic rather than a guess: off the air for the
     same number of records, the sequence numbers are gone all the same. */
  const consume = () => {
    t += 22 + rand() * 22;
    seq += step();
  };

  const emit = (rec: TapeRecord) => {
    out.push(rec);
    consume();
  };

  const l2 = (side: "bid" | "ask", level: Level, silent: boolean) => {
    if (silent) {
      consume();
      return;
    }
    emit({ t: Math.round(t), seq: null, kind: "l2", price: level.p, size: level.s, side });
  };

  /* A snapshot is one frame off the wire, not a stream of updates, so its
     levels land together and cost no sequence space. Tape stores it as records
     all the same — the 1.1 MB level2 snapshot in the measured capture is this. */
  const snapshot = (reason: string) => {
    emit({ t: Math.round(t), seq: null, kind: "reseed", price: 0, size: 0, side: "", reason });
    for (const side of ["bid", "ask"] as const) {
      for (const level of side === "bid" ? bids : asks) {
        out.push({ t: Math.round(t), seq: null, kind: "l2", price: level.p, size: level.s, side });
        t += 0.4;
      }
    }
  };

  /* One price step: the inside level is taken out, the far side is extended,
     and the book re-centres one level up or down. Four book updates, which is
     what a real l2_batch tick looks like when the mid moves. */
  const walk = (up: boolean, silent: boolean) => {
    if (up) {
      const gone = asks.shift();
      if (!gone) return;
      l2("ask", { p: gone.p, s: 0 }, silent);
      const deep = { p: round2(asks[asks.length - 1].p + tick()), s: size() };
      asks.push(deep);
      l2("ask", deep, silent);
      const lifted = { p: round2(asks[0].p - Math.max(0.01, tick() / 2)), s: size() };
      if (lifted.p > bids[0].p) {
        bids.unshift(lifted);
        l2("bid", lifted, silent);
        const dropped = bids.pop();
        if (dropped) l2("bid", { p: dropped.p, s: 0 }, silent);
      }
    } else {
      const gone = bids.shift();
      if (!gone) return;
      l2("bid", { p: gone.p, s: 0 }, silent);
      const deep = { p: round2(bids[bids.length - 1].p - tick()), s: size() };
      bids.push(deep);
      l2("bid", deep, silent);
      const lowered = { p: round2(bids[0].p + Math.max(0.01, tick() / 2)), s: size() };
      if (lowered.p < asks[0].p) {
        asks.unshift(lowered);
        l2("ask", lowered, silent);
        const dropped = asks.pop();
        if (dropped) l2("ask", { p: dropped.p, s: 0 }, silent);
      }
    }
    mid = (bids[0].p + asks[0].p) / 2;
  };

  /* Direction has to persist or the mid jitters in place and sixty seconds of
     tape reads as noise rather than as a market. Two slow waves out of phase
     give the window a couple of legs the eye can follow while every individual
     step stays a coin flip. */
  const phase = rand() * Math.PI * 2;
  const drifting = () => {
    const u = t / WINDOW_MS;
    const wave = Math.sin(phase + u * 4.1) * 0.6 + Math.sin(phase * 1.7 + u * 9.3) * 0.4;
    return 0.5 + wave * 0.34;
  };

  const tickOnce = (silent: boolean) => {
    const drift = drifting();
    const roll = rand();
    if (roll < 0.24) {
      /* a trade at the inside, carrying a sequence number */
      const buy = rand() < drift;
      const level = buy ? asks[0] : bids[0];
      const traded = round4(0.0008 + rand() ** 3 * 0.7);
      if (!silent) {
        emit({
          t: Math.round(t),
          seq,
          kind: "trade",
          price: level.p,
          size: traded,
          side: buy ? "buy" : "sell",
        });
      } else {
        consume();
      }
      return;
    }
    if (roll < 0.46) {
      walk(rand() < drift, silent);
      return;
    }
    /* a resize at an existing level, weighted towards the inside */
    const side = rand() < 0.5 ? bids : asks;
    const idx = Math.floor(rand() ** 2 * side.length);
    side[idx] = { p: side[idx].p, s: size() };
    l2(side === bids ? "bid" : "ask", side[idx], silent);
  };

  /* --- the window --- */

  snapshot("subscribed");
  while (t < GAP_AT_MS) tickOnce(false);

  /* The feed drops. The book keeps moving where we cannot see it, which is the
     whole reason a gap has to be written into the data: the state on the other
     side is not the state we last saw. */
  const before = seq;
  while (seq - before < GAP_MISSING) tickOnce(true);
  /* The exchange's counter is where it is; ours lands on it exactly, so the
     record below states a hole of GAP_MISSING and nothing has to round. */
  seq = before + GAP_MISSING + 1;

  /* Reconnect: reseed, then the gap the sequence numbers proved, then the
     fresh snapshot the resubscribe hands back. */
  emit({
    t: Math.round(t),
    seq: null,
    kind: "reseed",
    price: 0,
    size: 0,
    side: "",
    reason: "reconnect: read timeout",
  });
  emit({
    t: Math.round(t),
    seq: null,
    kind: "gap",
    price: 0,
    size: 0,
    side: "",
    missing: GAP_MISSING,
  });
  for (const side of ["bid", "ask"] as const) {
    for (const level of side === "bid" ? bids : asks) {
      out.push({ t: Math.round(t), seq: null, kind: "l2", price: level.p, size: level.s, side });
      t += 0.4;
    }
  }

  while (t < WINDOW_MS) tickOnce(false);

  return out;
}

/** The captured window, in replay order. */
export const records: TapeRecord[] = build();

/** Records per second across the window, for the caption. */
export const RATE = Math.round((records.length / WINDOW_MS) * 1000);
