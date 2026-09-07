"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEMO_SCRIPT,
  TICK,
  applyStep,
  cancelOrder,
  checkOrder,
  formatClock,
  formatTrade,
  group,
  levels,
  makeRandom,
  nextFlowOrder,
  seedMarket,
  submit,
  touch,
  type Level,
  type Order,
  type OrderBook,
  type OrderType,
  type Side,
  type Submission,
  type Trade,
} from "./orderbook-engine";

/*
  The matching engine lives next door in orderbook-engine.ts and knows nothing
  about React. Everything below is the view: a form that hands it orders, a
  ladder drawn to scale, and a tape. The whole visible state is one object so
  the visitor, the simulated flow and the replay can all advance it through the
  same functional update without racing each other.
*/

const TAPE_ROWS = 10;
const LADDER_ROWS = 8;
const FLOW_MS = 700;
const FLOW_MS_STILL = 2_000;
const REPLAY_MS = 600;
const FLOW_SEED = 20_250_607;

type View = {
  book: OrderBook;
  /** Newest fill first, capped at TAPE_ROWS. */
  tape: Trade[];
  /** Prices touched by the last event; those rows flash once. */
  hit: number[];
  /** Bumped per event so a re-hit row restarts its flash. */
  nonce: number;
  note: string | null;
};

function opening(): View {
  const { book, tape } = seedMarket();
  return { book, tape: [...tape].reverse(), hit: [], nonce: 0, note: null };
}

function absorb(view: View, book: OrderBook, trades: Trade[], note: string | null, keep: Trade[]): View {
  return {
    book,
    tape: [...trades].reverse().concat(keep).slice(0, TAPE_ROWS),
    hit: trades.map((trade) => trade.price),
    nonce: view.nonce + 1,
    note,
  };
}

function place(view: View, order: Submission): View {
  const result = submit(view.book, order);
  if (result.error) return view;
  return absorb(view, result.book, result.trades, null, view.tape);
}

function replayStep(view: View, index: number): View {
  const step = DEMO_SCRIPT[index];
  const out = applyStep(view.book, step);
  return absorb(view, out.book, out.trades, step.note, step.reset ? [] : view.tape);
}

export function OrderBook() {
  /* seedMarket() is pure and takes no clock, so the prerendered HTML and the
     first client render are identical. */
  const [view, setView] = useState<View>(opening);
  const [side, setSide] = useState<Side>("buy");
  const [type, setType] = useState<OrderType>("limit");
  const [price, setPrice] = useState("100.01");
  const [quantity, setQuantity] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [replay, setReplay] = useState<number | null>(null);
  const [still, setStill] = useState(false);

  const random = useRef<(() => number) | null>(null);

  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setStill(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  /* The simulated flow. Seeded, so it is the same market every visit. */
  useEffect(() => {
    if (!running || replay !== null) return;
    if (!random.current) random.current = makeRandom(FLOW_SEED);
    const draw = random.current;
    const timer = setInterval(
      () => setView((current) => place(current, nextFlowOrder(current.book, draw))),
      still ? FLOW_MS_STILL : FLOW_MS,
    );
    return () => clearInterval(timer);
  }, [running, replay, still]);

  /* main.c's demo mode, one step every 600 ms. */
  useEffect(() => {
    if (replay === null) return;
    const timer = setTimeout(() => {
      setView((current) => replayStep(current, replay));
      setReplay(replay + 1 < DEMO_SCRIPT.length ? replay + 1 : null);
    }, REPLAY_MS);
    return () => clearTimeout(timer);
  }, [replay]);

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const order: Submission = {
        side,
        type,
        price: type === "limit" ? Number(price) : undefined,
        quantity: Number(quantity),
        owner: "you",
      };
      const refused = checkOrder(order);
      setError(refused);
      if (refused) return;
      setView((current) => place(current, order));
    },
    [side, type, price, quantity],
  );

  const onCancel = useCallback((id: number) => {
    setView((current) => {
      const out = cancelOrder(current.book, id);
      return out.cancelled
        ? { ...current, book: out.book, hit: [], nonce: current.nonce + 1, note: null }
        : current;
    });
  }, []);

  const { book } = view;
  const bids = levels(book.bids, LADDER_ROWS);
  const asks = levels(book.asks, LADDER_ROWS);
  const scale = Math.max(1, ...bids.map((l) => l.cumulative), ...asks.map((l) => l.cumulative));
  const top = touch(book);
  /* The visitor's own orders, oldest first, so the list does not reshuffle
     under them when a price moves. */
  const mine = book.bids
    .concat(book.asks)
    .filter((order) => order.owner === "you")
    .sort((a, b) => a.id - b.id);
  const replaying = replay !== null;

  return (
    <div className="ob">
      {/* noValidate: the browser's own step/min checks would silently swallow
          the submit; the engine's checkOrder writes the message instead. */}
      <form className="ob-form" onSubmit={onSubmit} noValidate>
        <div className="ob-seg" role="group" aria-label="side">
          <button
            type="button"
            className={`ob-seg-btn${side === "buy" ? " is-on" : ""}`}
            aria-pressed={side === "buy"}
            onClick={() => setSide("buy")}
          >
            buy
          </button>
          <button
            type="button"
            className={`ob-seg-btn${side === "sell" ? " is-on" : ""}`}
            aria-pressed={side === "sell"}
            onClick={() => setSide("sell")}
          >
            sell
          </button>
        </div>

        <div className="ob-seg" role="group" aria-label="order type">
          <button
            type="button"
            className={`ob-seg-btn${type === "limit" ? " is-on" : ""}`}
            aria-pressed={type === "limit"}
            onClick={() => setType("limit")}
          >
            limit
          </button>
          <button
            type="button"
            className={`ob-seg-btn${type === "market" ? " is-on" : ""}`}
            aria-pressed={type === "market"}
            onClick={() => setType("market")}
          >
            market
          </button>
        </div>

        <label className="ob-field">
          <span>price</span>
          <input
            type="number"
            inputMode="decimal"
            step={TICK}
            min="0.01"
            value={price}
            disabled={type === "market"}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>

        <label className="ob-field">
          <span>qty</span>
          <input
            type="number"
            inputMode="numeric"
            step="10"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>

        <button type="submit" className="ob-submit">
          submit
        </button>
      </form>

      <p className="ob-error" role="alert">
        {error ?? ""}
      </p>

      <div className="ob-body">
        <div className="ob-market">
          <div className="ob-ladder">
            <Ladder side="buy" rows={bids} scale={scale} hit={view.hit} nonce={view.nonce} still={still} />
            <Ladder side="sell" rows={asks} scale={scale} hit={view.hit} nonce={view.nonce} still={still} />
          </div>

          <p className="ob-touch">
            {top.spread === null || top.mid === null
              ? top.bid === null && top.ask === null
                ? "spread — · mid — · the book is empty"
                : `spread — · mid — · nothing left on the ${top.bid === null ? "bid" : "ask"}`
              : `spread ${top.spread.toFixed(2)} · mid ${top.mid.toFixed(2)}`}
          </p>

          <div className="ob-mine">
            <span className="ob-mine-head">your resting orders</span>
            {mine.length === 0 ? (
              <span className="ob-mine-none">none yet — a limit order that does not cross rests here</span>
            ) : (
              <ul className="ob-mine-list">
                {mine.map((order: Order) => (
                  <li key={order.id}>
                    <span className="ob-mine-id">#{order.id}</span>
                    <span className={order.side === "buy" ? "ob-mine-buy" : "ob-mine-sell"}>{order.side}</span>
                    <span className="ob-mine-qty">{group(order.quantity)}</span>
                    <span className="ob-mine-at">@ {order.price.toFixed(2)}</span>
                    <button
                      type="button"
                      className="ob-cancel"
                      aria-label={`cancel order #${order.id}`}
                      onClick={() => onCancel(order.id)}
                    >
                      cancel
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="ob-tape">
          <span className="ob-tape-head">trades</span>
          <ol className="ob-tape-list" aria-label="the last ten fills, newest first">
            {view.tape.map((trade, index) => (
              <li key={`${trade.at}-${trade.buyOrderId}-${trade.sellOrderId}-${index}`} title={formatTrade(trade)}>
                <span className="ob-tape-at">{formatClock(trade.at)}</span>
                <span className={trade.aggressor === "buy" ? "ob-tape-buy" : "ob-tape-sell"}>
                  {trade.aggressor === "buy" ? "BUY " : "SELL"}
                </span>
                <span className="ob-tape-qty">{group(trade.quantity)}</span>
                <span className="ob-tape-px">@ {trade.price.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="ob-controls">
        <button
          type="button"
          className={`ob-btn${running ? " is-on" : ""}`}
          aria-pressed={running}
          onClick={() => setRunning((on) => !on)}
        >
          {running ? "stop the market" : "let the market run"}
        </button>
        <button type="button" className="ob-btn" disabled={replaying} onClick={() => setReplay(0)}>
          {replaying ? "replaying…" : "replay the demo"}
        </button>
        <p className="ob-stats">
          orders {group(book.orders)} · fills {group(book.fills)} · volume {group(book.volume)}
        </p>
      </div>

      <p className="ob-note">{view.note ?? " "}</p>

      <p className="ob-caption">
        The same matching rules as the C engine: price priority, then time. Everything here runs in your browser.
      </p>
    </div>
  );
}

function Ladder({
  side,
  rows,
  scale,
  hit,
  nonce,
  still,
}: {
  side: Side;
  rows: Level[];
  scale: number;
  hit: number[];
  nonce: number;
  still: boolean;
}) {
  const buy = side === "buy";
  return (
    <div className={`ob-side ${buy ? "ob-side-bid" : "ob-side-ask"}`}>
      <div className="ob-col-head">
        {buy ? (
          <>
            <span>size</span>
            <span>bid</span>
          </>
        ) : (
          <>
            <span>ask</span>
            <span>size</span>
          </>
        )}
      </div>
      <ol className="ob-rows" aria-label={buy ? "bids, best first" : "asks, best first"}>
        {rows.map((row, index) => {
          const flashed = !still && hit.includes(row.price);
          return (
            <li
              key={flashed ? `${row.price}-${nonce}` : row.price}
              className={`ob-row${index === 0 ? " is-best" : ""}${flashed ? " is-hit" : ""}`}
            >
              <span className="ob-depth" style={{ width: `${(row.cumulative / scale) * 100}%` }} aria-hidden="true" />
              {buy ? (
                <>
                  <span className="ob-size">{group(row.size)}</span>
                  <span className="ob-price">{row.price.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <span className="ob-price">{row.price.toFixed(2)}</span>
                  <span className="ob-size">{group(row.size)}</span>
                </>
              )}
            </li>
          );
        })}
        {rows.length === 0 && <li className="ob-row ob-row-empty">empty</li>}
      </ol>
    </div>
  );
}
