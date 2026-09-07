/*
  A limit order book, ported from the C engine in
  github.com/AnanmayS/limit-order-book-simulator (orderbook.h / orderbook.c).

  The rules the C keeps, kept here:
    - price-time priority: bids high price first, asks low price first, and an
      equal price broken by the earlier arrival (C: sort_orders)
    - a trade executes at the RESTING order's price (README: "Execution Price:
      Trades execute at the resting order's price")
    - partial fills leave the larger order in the book with the remainder
    - cancel is by order id and searches both sides (C: cancel_order)
    - the trade report reads exactly as the C prints it (C: print_trade)

  One deliberate difference. The C rests every order and only crosses the book
  when you ask it to (`add_order` then `match_orders`); its demo always calls
  the two together. Here `submit` is that pair: the incoming order walks the far
  side while it still crosses, then the remainder rests. That is what makes a
  limit order "rest if it doesn't cross", and it is what gives us an aggressor,
  which the C's batch matcher has no notion of.

  No React, no DOM, no clock, no randomness that is not seeded. Every function
  is pure: nothing mutates the book it is handed, it returns a new one, so the
  UI can hold a book in state and a prerender and its hydration agree.
*/

export type Side = "buy" | "sell";
export type OrderType = "limit" | "market";
export type Owner = "market" | "you";

export type Order = {
  id: number;
  side: Side;
  price: number;
  /** Remaining quantity; a partial fill decrements it in place. */
  quantity: number;
  /** Arrival sequence — the "time" half of price-time priority. */
  timestamp: number;
  owner: Owner;
};

export type Trade = {
  buyOrderId: number;
  sellOrderId: number;
  price: number;
  quantity: number;
  /** Which side crossed the spread to make this trade happen. */
  aggressor: Side;
  /** Simulated clock, milliseconds since midnight. Never a wall clock. */
  at: number;
};

export type OrderBook = {
  bids: Order[];
  asks: Order[];
  nextOrderId: number;
  currentTime: number;
  clock: number;
  orders: number;
  fills: number;
  volume: number;
};

export type Submission = {
  side: Side;
  type: OrderType;
  /** Ignored by a market order. */
  price?: number;
  quantity: number;
  owner?: Owner;
};

export type Result = {
  book: OrderBook;
  trades: Trade[];
  /** -1 when the order was rejected. */
  orderId: number;
  /** Quantity left resting in the book. */
  resting: number;
  error: string | null;
};

/** The tape opens at 10:42:07.113 and only ever moves forward from there. */
export const CLOCK_START = 10 * 3_600_000 + 42 * 60_000 + 7_000 + 113;
export const TICK = 0.01;
export const MAX_QUANTITY = 10_000;

/* Simulated milliseconds an event consumes. Fixed, so the tape is reproducible. */
const ORDER_STEP = 137;
const TRADE_STEP = 11;

/* Prices are held as doubles but always minted from whole cents, so two
   equal prices are bit-identical and `===` is a safe comparison. */
const toCents = (price: number) => Math.round(price * 100);
const fromCents = (cents: number) => cents / 100;

export function createBook(): OrderBook {
  return {
    bids: [],
    asks: [],
    nextOrderId: 1,
    currentTime: 0,
    clock: CLOCK_START,
    orders: 0,
    fills: 0,
    volume: 0,
  };
}

function copy(book: OrderBook): OrderBook {
  return {
    ...book,
    bids: book.bids.map((order) => ({ ...order })),
    asks: book.asks.map((order) => ({ ...order })),
  };
}

/** C: sort_orders. Best price first; ties go to whoever arrived first. */
function priority(side: Side) {
  return (a: Order, b: Order) =>
    a.price === b.price
      ? a.timestamp - b.timestamp
      : side === "buy"
        ? b.price - a.price
        : a.price - b.price;
}

/** Does an incoming order reach the far side's best price? */
function crosses(type: OrderType, side: Side, limit: number, resting: number) {
  if (type === "market") return true;
  return side === "buy" ? limit >= resting : limit <= resting;
}

/** Thousands separators, written out rather than left to the host's locale
    data, so the server's string and the browser's string are the same. */
export function group(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Everything `submit` would refuse, so the form can say why before it asks. */
export function checkOrder({ type, price, quantity }: Submission): string | null {
  if (!Number.isFinite(quantity) || Math.trunc(quantity) !== quantity || quantity < 1) {
    return "quantity must be a whole number of 1 or more";
  }
  if (quantity > MAX_QUANTITY) {
    return `quantity must be ${group(MAX_QUANTITY)} or less`;
  }
  if (type === "limit") {
    if (!Number.isFinite(price ?? NaN) || (price as number) <= 0) {
      return "a limit order needs a price above 0.00";
    }
    if (Math.abs((price as number) * 100 - toCents(price as number)) > 1e-6) {
      return `price must land on the ${TICK.toFixed(2)} tick`;
    }
  }
  return null;
}

/**
 * Add one order, cross what it can, rest what it cannot.
 * Returns a new book; the one passed in is untouched.
 */
export function submit(book: OrderBook, order: Submission): Result {
  const error = checkOrder(order);
  if (error) return { book, trades: [], orderId: -1, resting: 0, error };

  const next = copy(book);
  const id = next.nextOrderId++;
  const timestamp = next.currentTime++;
  next.orders += 1;
  next.clock += ORDER_STEP;

  const limit = order.type === "limit" ? toCents(order.price as number) : 0;
  const far = order.side === "buy" ? next.asks : next.bids;
  const trades: Trade[] = [];
  let left = order.quantity;

  /* C: match_orders — take the top of the far side until it stops crossing. */
  while (left > 0 && far.length > 0) {
    const top = far[0];
    if (!crosses(order.type, order.side, limit, toCents(top.price))) break;

    const quantity = Math.min(left, top.quantity);
    next.clock += TRADE_STEP;
    trades.push({
      buyOrderId: order.side === "buy" ? id : top.id,
      sellOrderId: order.side === "buy" ? top.id : id,
      price: top.price /* the resting order's price */,
      quantity,
      aggressor: order.side,
      at: next.clock,
    });

    top.quantity -= quantity;
    left -= quantity;
    next.fills += 1;
    next.volume += quantity;
    if (top.quantity === 0) far.shift();
  }

  /* A limit order rests once it stops crossing. A market order never rests:
     whatever it could not fill is gone. */
  if (left > 0 && order.type === "limit") {
    const near = order.side === "buy" ? next.bids : next.asks;
    near.push({
      id,
      side: order.side,
      price: fromCents(limit),
      quantity: left,
      timestamp,
      owner: order.owner ?? "you",
    });
    near.sort(priority(order.side));
    return { book: next, trades, orderId: id, resting: left, error: null };
  }

  return { book: next, trades, orderId: id, resting: 0, error: null };
}

/** C: cancel_order. Searches bids then asks; false when the id is not resting. */
export function cancelOrder(book: OrderBook, id: number): { book: OrderBook; cancelled: boolean } {
  const holds = (side: Order[]) => side.some((order) => order.id === id);
  if (!holds(book.bids) && !holds(book.asks)) return { book, cancelled: false };

  const next = copy(book);
  next.bids = next.bids.filter((order) => order.id !== id);
  next.asks = next.asks.filter((order) => order.id !== id);
  next.clock += ORDER_STEP;
  return { book: next, cancelled: true };
}

/* ---------- reading the book ---------- */

export type Level = { price: number; size: number; cumulative: number; ids: number[] };

/** Collapse a sorted side into price levels, carrying cumulative depth. */
export function levels(side: Order[], depth = 8): Level[] {
  const out: Level[] = [];
  let cumulative = 0;
  for (const order of side) {
    const last = out[out.length - 1];
    cumulative += order.quantity;
    if (last && last.price === order.price) {
      last.size += order.quantity;
      last.cumulative = cumulative;
      last.ids.push(order.id);
    } else {
      if (out.length === depth) break;
      out.push({ price: order.price, size: order.quantity, cumulative, ids: [order.id] });
    }
  }
  return out;
}

export type Touch = { bid: number | null; ask: number | null; spread: number | null; mid: number | null };

export function touch(book: OrderBook): Touch {
  const bid = book.bids.length > 0 ? book.bids[0].price : null;
  const ask = book.asks.length > 0 ? book.asks[0].price : null;
  return {
    bid,
    ask,
    spread: bid !== null && ask !== null ? fromCents(toCents(ask) - toCents(bid)) : null,
    mid: bid !== null && ask !== null ? fromCents(Math.round((toCents(ask) + toCents(bid)) / 2)) : null,
  };
}

/* ---------- formatting ---------- */

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

/** Simulated clock to "10:42:07.113". */
export function formatClock(at: number): string {
  const t = ((at % 86_400_000) + 86_400_000) % 86_400_000;
  return `${pad(Math.floor(t / 3_600_000))}:${pad(Math.floor(t / 60_000) % 60)}:${pad(
    Math.floor(t / 1000) % 60,
  )}.${pad(t % 1000, 3)}`;
}

/** C: print_trade — the same sentence the terminal build prints. */
export function formatTrade(trade: Trade): string {
  return (
    `Buy Order #${trade.buyOrderId} matched with Sell Order #${trade.sellOrderId} ` +
    `at price ${trade.price.toFixed(2)} for quantity ${trade.quantity}`
  );
}

/* ---------- a deterministic opening book ---------- */

const SEED_BIDS: Array<[number, number]> = [
  [10000, 120],
  [9999, 180],
  [9998, 260],
  [9997, 90],
  [9996, 340],
  [9995, 400],
];

const SEED_ASKS: Array<[number, number]> = [
  [10002, 140],
  [10003, 200],
  [10004, 110],
  [10005, 300],
  [10006, 240],
  [10007, 380],
];

/**
 * Six levels a side around 100.00 and three trades already on the tape, all
 * produced by the engine itself so the opening state obeys the same rules as
 * everything after it. Same result every call — safe to render on the server.
 */
export function seedMarket(): { book: OrderBook; tape: Trade[] } {
  let book = createBook();
  const rest = (side: Side, cents: number, quantity: number) => {
    book = submit(book, { side, type: "limit", price: fromCents(cents), quantity, owner: "market" }).book;
  };

  for (const [cents, quantity] of SEED_BIDS) rest("buy", cents, quantity);
  for (const [cents, quantity] of SEED_ASKS) rest("sell", cents, quantity);

  const opening: Submission[] = [
    { side: "buy", type: "market", quantity: 60, owner: "market" },
    { side: "sell", type: "market", quantity: 40, owner: "market" },
    { side: "buy", type: "limit", price: 100.02, quantity: 50, owner: "market" },
  ];

  const tape: Trade[] = [];
  for (const order of opening) {
    const result = submit(book, order);
    book = result.book;
    tape.push(...result.trades);
  }

  return { book, tape };
}

/* ---------- the C demo, step by step ---------- */

export type DemoStep = {
  note: string;
  reset?: true;
  place?: Submission[];
  cancel?: number;
};

/**
 * main.c's demo mode, in the order it runs it: seed both sides, cross, cross
 * again, cancel #1, then sweep the book from each direction. The C adds its
 * orders and then calls match_orders; here each order matches as it lands,
 * which is the same sequence of events with the pauses removed.
 */
export const DEMO_SCRIPT: DemoStep[] = [
  { note: "init_orderbook — an empty book", reset: true },
  {
    note: "three buy orders rest",
    place: [
      { side: "buy", type: "limit", price: 100.5, quantity: 100, owner: "market" },
      { side: "buy", type: "limit", price: 100.25, quantity: 200, owner: "market" },
      { side: "buy", type: "limit", price: 100.0, quantity: 150, owner: "market" },
    ],
  },
  {
    note: "three sell orders rest — spread 0.50",
    place: [
      { side: "sell", type: "limit", price: 101.0, quantity: 100, owner: "market" },
      { side: "sell", type: "limit", price: 101.25, quantity: 200, owner: "market" },
      { side: "sell", type: "limit", price: 101.5, quantity: 150, owner: "market" },
    ],
  },
  {
    note: "buy 50 @ 101.00 — crosses, fills 50, leaves #4 half done",
    place: [{ side: "buy", type: "limit", price: 101.0, quantity: 50, owner: "market" }],
  },
  {
    note: "buy 100 @ 101.25 — walks two ask levels",
    place: [{ side: "buy", type: "limit", price: 101.25, quantity: 100, owner: "market" }],
  },
  {
    note: "sell 75 @ 100.50 — hits the bid, #1 keeps 25",
    place: [{ side: "sell", type: "limit", price: 100.5, quantity: 75, owner: "market" }],
  },
  { note: "cancel_order(#1) — the rest of that bid leaves", cancel: 1 },
  {
    note: "buy 500 @ 102.00 — sweeps the asks, 200 rests on top",
    place: [{ side: "buy", type: "limit", price: 102.0, quantity: 500, owner: "market" }],
  },
  {
    note: "sell 300 @ 99.00 — sweeps back down through the bids",
    place: [{ side: "sell", type: "limit", price: 99.0, quantity: 300, owner: "market" }],
  },
];

export function applyStep(book: OrderBook, step: DemoStep): { book: OrderBook; trades: Trade[] } {
  /* A reset empties the book but carries the clock, so the tape never runs
     backwards in front of someone who was already watching it. */
  let next = step.reset ? { ...createBook(), clock: book.clock } : book;
  const trades: Trade[] = [];

  for (const order of step.place ?? []) {
    const result = submit(next, order);
    next = result.book;
    trades.push(...result.trades);
  }
  if (step.cancel !== undefined) next = cancelOrder(next, step.cancel).book;

  return { book: next, trades };
}

/* ---------- a market that breathes ---------- */

/** mulberry32 — a small seeded PRNG, so "random" flow replays identically. */
export function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One plausible order for the simulated flow: mostly limits posted within a
 * few ticks of the touch, occasionally a small market order that takes. Leans
 * toward whichever side is thin so the book does not empty itself.
 */
export function nextFlowOrder(book: OrderBook, random: () => number): Submission {
  const { bid, ask, mid } = touch(book);
  const thin = book.bids.length < 3 ? "buy" : book.asks.length < 3 ? "sell" : null;
  const side: Side = thin ?? (random() < 0.5 ? "buy" : "sell");
  const quantity = (1 + Math.floor(random() * 12)) * 10;

  if (!thin && random() < 0.18) return { side, type: "market", quantity: Math.max(10, quantity >> 1), owner: "market" };

  const reference = (side === "buy" ? bid : ask) ?? mid ?? 100;
  /* Post one to three ticks behind the touch, or one tick through it. */
  const step = random() < 0.22 ? 1 : -(1 + Math.floor(random() * 3));
  const cents = toCents(reference) + (side === "buy" ? step : -step);

  return { side, type: "limit", price: fromCents(Math.max(1, cents)), quantity, owner: "market" };
}
