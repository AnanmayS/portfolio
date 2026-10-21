/*
  Beat the Bots, as one round anyone can follow.

  Left: the order book, what the 32 bots will pay (green) and sell for
  (red), one price per row. Middle: what happened, line by line. Right:
  the price over this stretch of the round, with the hidden fair value
  that only the informed bot can see, and your account.

  The round: you buy 2 at market and a market maker fills you at 4999.25.
  A headline lands; the fair value jumps at once, the market makers pull
  their quotes, and a second later the bots digest the news and the price
  gaps up 1.50, momentum bots chasing it. You sell 2 at market to a
  momentum bot at 5000.75: 1.50 points x 2 contracts x $50, less $2 of
  fees, +$148.00 (the screenshot in the project's README). Four plain
  numbers underneath.

  One 10 s loop, driven from app/art/arena.css. The un-animated state is
  the finished frame: the book re-quoted after the news, every line of the
  story shown, the position flat at +$148.

  Numbers: beat-the-bots/README.md. 21.0M passive limit orders/s (Google
  Benchmark, Apple M2, -O3, one thread); about 0.03 ms of engine work per
  animation frame in the browser; the sum of P&L plus fees is exactly zero
  across every account, checked after each of 25 seeds x 10,000 random
  operations; the production site is about 200 KB gzipped. The bot mix
  (4 market makers, 6 momentum, 5 mean-reversion, 16 noise, 1 informed) is
  engine/include/btb/config.hpp.
*/

const r = (v: number) => Math.round(v * 10) / 10;

/* ---- the order book ---- */

type Row = { price: string; side: "ask" | "bid"; size: number };

/* Before the news: you lift the best ask, 4999.25. */
const BOOK_A: Row[] = [
  { price: "5000.25", side: "ask", size: 5 },
  { price: "5000.00", side: "ask", size: 14 },
  { price: "4999.75", side: "ask", size: 35 },
  { price: "4999.50", side: "ask", size: 43 },
  { price: "4999.25", side: "ask", size: 33 },
  { price: "4999.00", side: "bid", size: 26 },
  { price: "4998.75", side: "bid", size: 50 },
  { price: "4998.50", side: "bid", size: 37 },
  { price: "4998.25", side: "bid", size: 16 },
];

/* After it, re-quoted 1.50 higher: you hit the best bid, 5000.75. */
const BOOK_B: Row[] = [
  { price: "5001.75", side: "ask", size: 11 },
  { price: "5001.50", side: "ask", size: 24 },
  { price: "5001.25", side: "ask", size: 31 },
  { price: "5001.00", side: "ask", size: 8 },
  { price: "5000.75", side: "bid", size: 13 },
  { price: "5000.50", side: "bid", size: 26 },
  { price: "5000.25", side: "bid", size: 50 },
  { price: "5000.00", side: "bid", size: 70 },
  { price: "4999.75", side: "bid", size: 37 },
];

const ROW0 = 56;
const ROW_H = 16;
const MID = 130;
const BID_EDGE = 102;
const ASK_EDGE = 158;
const PX_PER_LOT = 1.1;
/* The row you trade on, in both books. */
const YOU = 4;
const YOU_TOP = ROW0 + YOU * ROW_H;

function Book({ rows, cls, after }: { rows: Row[]; cls: string; after: number }) {
  return (
    <g className={cls}>
      {rows.map((row, i) => {
        const top = ROW0 + i * ROW_H;
        const w = r(row.size * PX_PER_LOT);
        const ask = row.side === "ask";
        const you = i === YOU;
        const sizeX = ask ? ASK_EDGE + w + 4 : BID_EDGE - w - 4;
        const anchor = ask ? "start" : "end";
        return (
          <g key={row.price} className={`${cls}-${row.side}`}>
            <text className="mono ar-price" x={MID} y={top + 12} textAnchor="middle">
              {row.price}
            </text>
            <rect
              className={`${ask ? "ar-ask" : "ar-bid"}${you ? ` ${cls}-you-bar` : ""}`}
              x={ask ? ASK_EDGE : BID_EDGE - w}
              y={top + 3}
              width={w}
              height="10"
              rx="1"
            />
            {you ? (
              <>
                <text className={`mono art-tiny ar-size ${cls}-size-before`} x={sizeX} y={top + 12} textAnchor={anchor}>
                  {row.size}
                </text>
                <text className={`mono art-tiny ar-size ${cls}-size-after`} x={sizeX} y={top + 12} textAnchor={anchor}>
                  {after}
                </text>
              </>
            ) : (
              <text className="mono art-tiny ar-size" x={sizeX} y={top + 12} textAnchor={anchor}>
                {row.size}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ---- the price over this stretch of the round ---- */

const CX0 = 490;
const CX1 = 720;
const CY0 = 54;
const CY1 = 112;
const N = 100;
/* The chart's x runs with the loop: 72 % of it spans the chart. */
const px = (pct: number) => r(CX0 + ((CX1 - CX0) * pct) / 72);
const NEWS_X = px(36);
const GAP_X0 = px(48);
const GAP_X1 = px(52);
const BUY_I = 16; /* 12 % */
const SELL_I = 85; /* 62 % */

const yOf = (p: number) => r(CY1 - ((p - 4998.5) / 2.75) * (CY1 - CY0));
const cx = (i: number) => r(CX0 + (i * (CX1 - CX0)) / (N - 1));

/* A deterministic walk around the fair value: calm, then the gap, then calm higher. */
const TRADED = (() => {
  const ps: number[] = [];
  let p = 4999.2;
  for (let i = 0; i < N; i++) {
    const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const noise = s - Math.floor(s) - 0.5;
    const x = cx(i);
    const base = x < GAP_X0 ? 4999.2 : x < GAP_X1 ? 4999.2 + ((x - GAP_X0) / (GAP_X1 - GAP_X0)) * 1.5 : 5000.7;
    p += noise * 0.36 + (base - p) * 0.45;
    p = Math.max(base - 0.3, Math.min(base + 0.3, p));
    ps.push(p);
  }
  ps[BUY_I] = 4999.25;
  ps[SELL_I] = 5000.75;
  return ps;
})();

const PRICE_LINE = `M${TRADED.map((p, i) => `${cx(i)} ${yOf(p)}`).join("L")}`;
const FAIR_LINE = `M${CX0} ${yOf(4999.3)}H${NEWS_X}V${yOf(5000.8)}H${CX1}`;
const BUY_X = cx(BUY_I);
const BUY_Y = yOf(4999.25);
const SELL_X = cx(SELL_I);
const SELL_Y = yOf(5000.75);

/* ---- what happened, line by line ---- */

const LINES = [
  { y: 68, cls: "ar-l1 art-strong art-bold", text: "You buy 2 at market" },
  { y: 90, cls: "ar-l2 art-ok", text: "✓ filled at 4999.25 by a market maker" },
  { y: 134, cls: "ar-l4 art-muted", text: "Market makers pull their quotes" },
  { y: 156, cls: "ar-l5 art-soft", text: "Bots digest it; the price gaps up 1.50" },
  { y: 178, cls: "ar-l6 art-strong art-bold", text: "You sell 2 at market" },
  { y: 200, cls: "ar-l7 art-ok", text: "✓ sold at 5000.75 to a momentum bot" },
];

const FACTS = [
  { x: 0, big: "21M", small: "orders a second into the book" },
  { x: 180, big: "0.03 ms", small: "per frame, all in the browser tab" },
  { x: 360, big: "$0.00", small: "net of fees across 33 accounts" },
  { x: 540, big: "200 KB", small: "the whole game, exchange included" },
];

export function ArenaArt() {
  return (
    <svg
      className="art art-arena"
      viewBox="0 0 720 314"
      role="img"
      aria-label="Beat the Bots is a trading game in the browser. You get $25,000 and five minutes to trade one futures contract against 32 bots: market makers, momentum and mean-reversion traders, noise traders, and one informed trader who can see where the price is really going. In this round you buy 2 at market and a market maker fills you at 4999.25. A headline lands, the market makers pull their quotes, and a second later the price gaps up 1.50 as the bots digest the news. You sell 2 to a momentum bot at 5000.75, up $148 after fees. The exchange is C++ compiled to WebAssembly and runs inside the tab: 21 million orders a second into the book, about 0.03 milliseconds per frame, every dollar won is a dollar a bot lost, and the whole game is about 200 KB."
      fill="none"
    >
      {/* ---- the clock and the mood of the market ---- */}
      <rect className="ar-pill" x="0" y="6" width="58" height="20" rx="10" />
      <circle className="ar-live" cx="13" cy="16" r="4" />
      <text className="mono ar-clock ar-clock-1" x="22" y="20">
        0:07
      </text>
      <text className="mono ar-clock ar-clock-2" x="22" y="20">
        0:12
      </text>
      <text className="mono ar-clock ar-clock-3" x="22" y="20">
        0:14
      </text>
      <text className="art-label art-soft ar-clock-1" x="68" y="20">
        calm open
      </text>
      <text className="art-label art-bad ar-clock-2" x="68" y="20">
        headline · read fast
      </text>
      <text className="art-label art-soft ar-clock-3" x="68" y="20">
        hot
      </text>
      <text className="art-label" x="720" y="20" textAnchor="end">
        32 bots: 4 market makers · 6 momentum · 5 mean-reversion · 16 noise · 1 informed
      </text>

      {/* ---- the order book ---- */}
      <text className="art-tiny art-muted ar-head" x="0" y="46">
        ORDER BOOK
      </text>
      <rect className="ar-row" x="0" y={YOU_TOP} width="232" height={ROW_H} rx="2" />
      <Book rows={BOOK_A} cls="ar-book-a" after={31} />
      <Book rows={BOOK_B} cls="ar-book-b" after={11} />
      <text className="ar-tag ar-tag-buy" x={BID_EDGE - 4} y={YOU_TOP + 12} textAnchor="end">
        you buy 2 →
      </text>
      <text className="ar-tag ar-tag-sell" x={ASK_EDGE + 4} y={YOU_TOP + 12}>
        ← you sell 2
      </text>
      <text className="art-tiny" x="0" y="216">
        what bots will pay (green) and sell for (red)
      </text>

      {/* ---- what happened ---- */}
      <text className="art-tiny art-muted ar-head" x="250" y="46">
        WHAT HAPPENED
      </text>
      {LINES.map((line) => (
        <text key={line.y} className={`art-small ${line.cls}`} x="250" y={line.y}>
          {line.text}
        </text>
      ))}
      <g className="ar-l3">
        <rect className="ar-news-tag" x="250" y="101" width="36" height="14" rx="2" />
        <text className="ar-news-text" x="268" y="111" textAnchor="middle">
          NEWS
        </text>
        <text className="art-small art-strong" x="292" y="112">
          Fed holds rates, hints at cuts
        </text>
      </g>

      {/* ---- your account ---- */}
      <text className="art-tiny art-muted ar-head" x="490" y="46">
        YOUR ACCOUNT
      </text>
      <line className="art-hair" x1={CX0} y1={CY1} x2={CX1} y2={CY1} />
      <path className="ar-fv" d={FAIR_LINE} />
      <path className="ar-news-line" d={`M${NEWS_X} ${CY0}V${CY1}`} />
      <text className="art-tiny art-bad" x={NEWS_X + 4} y="62">
        news
      </text>
      <path className="art-line" d={PRICE_LINE} strokeWidth="1.5" />
      <path className="ar-mark-buy" d={`M${BUY_X} ${BUY_Y + 4}l-4 6h8z`} />
      <path className="ar-mark-sell" d={`M${SELL_X} ${SELL_Y - 4}l-4 -6h8z`} />
      {/* The wipe that reveals the chart as the round plays, and its playhead. */}
      <rect className="ar-cover" x={CX0} y="49" width="232" height="66" />
      <line className="ar-playhead" x1={CX0} y1={CY0} x2={CX0} y2={CY1} />
      <text className="art-tiny" x="490" y="124">
        price · dashed: the hidden value one bot sees
      </text>

      <text className="art-tiny art-muted ar-head" x="490" y="142">
        ROUND P&amp;L
      </text>
      <text className="mono ar-pnl art-soft ar-pnl-0" x="490" y="166">
        $0.00
      </text>
      <text className="mono ar-pnl art-bad ar-pnl-1" x="490" y="166">
        −$1.00
      </text>
      <text className="mono ar-pnl art-ok ar-pnl-2" x="490" y="166">
        +$149.00
      </text>
      <text className="mono ar-pnl art-ok ar-pnl-3" x="490" y="166">
        +$148.00
      </text>

      <text className="art-tiny art-muted ar-head" x="490" y="188">
        POSITION
      </text>
      <text className="art-tiny art-muted ar-head" x="570" y="188">
        AVG PRICE
      </text>
      <text className="art-tiny art-muted ar-head" x="650" y="188">
        FEES
      </text>
      <text className="mono art-label art-strong ar-pos-flat" x="490" y="204">
        flat
      </text>
      <text className="mono art-label art-ok ar-pos-long" x="490" y="204">
        +2 long
      </text>
      <text className="mono art-label art-strong ar-avg-none" x="570" y="204">
        —
      </text>
      <text className="mono art-label art-strong ar-avg-val" x="570" y="204">
        4999.25
      </text>
      <text className="mono art-label art-strong ar-fee-0" x="650" y="204">
        $0.00
      </text>
      <text className="mono art-label art-strong ar-fee-1" x="650" y="204">
        $1.00
      </text>
      <text className="mono art-label art-strong ar-fee-2" x="650" y="204">
        $2.00
      </text>
      <text className="art-small art-ok ar-l7" x="490" y="226">
        ✓ every dollar you won, a bot lost
      </text>

      {/* ---- the numbers ---- */}
      <line className="art-rule" x1="0" y1="248" x2="720" y2="248" />
      {FACTS.map((fact) => (
        <g key={fact.big}>
          <text className="art-fact" x={fact.x} y="284">
            {fact.big}
          </text>
          <text className="art-small" x={fact.x} y="302">
            {fact.small}
          </text>
        </g>
      ))}
    </svg>
  );
}
