/*
  The paper trader's risk rules and fill model, lifted out of the repo and run
  over synthetic markets so a visitor can turn the knobs.

  Everything here is pure and seeded: the same seed and the same settings give
  the same run on the server and in the browser, which is what lets the first
  paint already show a finished run.

  Sources, all from AnanmayS/polymarket-papertrade-agent:
    backend/app/core/config.py            the defaults in REPO below
    backend/app/services/risk_service.py  order of checks, sizing, blocking
    backend/app/services/execution_service.py  fill price, quantity, fees
    backend/app/services/settlement_service.py realised pnl on resolution
    backend/app/utils/math.py             kelly_fraction, clamp, max_drawdown
    backend/app/data/demo_markets.json    the market shapes below
*/

/** Defaults read straight out of backend/app/core/config.py. */
export const REPO = {
  initialBankroll: 10_000,
  /** min_edge_to_trade, as a probability */
  minEdgeToTrade: 0.025,
  /** max_market_exposure_pct */
  maxMarketExposurePct: 0.06,
  /** max_open_trades */
  maxOpenTrades: 10,
  /** fractional_kelly */
  fractionalKelly: 0.25,
  /** max_category_exposure_pct — every market here is `category: "sports"`,
      so this is the cap on total open exposure. */
  maxCategoryExposurePct: 0.2,
  /** fee_bps, charged on the stake */
  feeBps: 20,
  /** slippage_bps, charged on the reference price */
  slippageBps: 50,
} as const;

/*
  How wrong each side is allowed to be. The market is mispriced by 6 points of
  probability on average and the agent's estimate is off by 8, so the agent has
  a real but small edge and is nowhere near omniscient. These are the two
  numbers that decide whether this demo flatters the project, so they are shown
  on the page rather than buried here.
*/
export const MARKET_SIGMA = 0.06;
export const AGENT_SIGMA = 0.08;

/** Shapes taken from backend/app/data/demo_markets.json. */
const SHAPES: { league: string; price: number; spread: number; liquidity: number }[] = [
  { league: "NBA", price: 0.595, spread: 0.03, liquidity: 145_000 },
  { league: "NBA", price: 0.495, spread: 0.03, liquidity: 190_000 },
  { league: "MLB", price: 0.54, spread: 0.02, liquidity: 86_000 },
  { league: "NHL", price: 0.65, spread: 0.04, liquidity: 72_000 },
  { league: "NFL", price: 0.58, spread: 0.04, liquidity: 310_000 },
  { league: "MLB", price: 0.705, spread: 0.03, liquidity: 105_000 },
  { league: "EPL", price: 0.455, spread: 0.03, liquidity: 132_000 },
  { league: "ELECT", price: 0.455, spread: 0.03, liquidity: 520_000 },
  { league: "POLICY", price: 0.4, spread: 0.04, liquidity: 340_000 },
  { league: "ELECT", price: 0.36, spread: 0.04, liquidity: 280_000 },
];

export const MARKET_COUNT = 200;

export type StakeRule = "kelly" | "flat";

export type RunSettings = {
  bankroll: number;
  rule: StakeRule;
  /** Kelly multiplier, 0.1 to 1.0. Ignored when rule is "flat". */
  kelly: number;
  /** Max exposure in one market, as a fraction of bankroll. */
  maxExposure: number;
  maxOpen: number;
  /** Edge threshold as a fraction (0.025 = 2.5 points). */
  edgeThreshold: number;
  seed: number;
};

/*
  The repo's default sizing path is `size_position(use_kelly=False)`:
  `bankroll * max_position_size_pct(3%) * conviction`, which for a typical
  signal lands near 2% of bankroll. "flat 2%" is that path; "fractional Kelly"
  is the `use_kelly=True` branch, whose repo setting is 0.25x.
*/
export const DEFAULT_SETTINGS: RunSettings = {
  bankroll: REPO.initialBankroll,
  rule: "flat",
  kelly: REPO.fractionalKelly,
  maxExposure: REPO.maxMarketExposurePct,
  maxOpen: REPO.maxOpenTrades,
  edgeThreshold: REPO.minEdgeToTrade,
  seed: 42,
};

export type RunResult = {
  settings: RunSettings;
  /** Equity after each settlement, plus the starting point at market 0. */
  points: { at: number; equity: number }[];
  finalEquity: number;
  returnPct: number;
  /** Worst peak-to-trough fall, as a fraction. */
  maxDrawdown: number;
  trades: number;
  wins: number;
  winRate: number;
  blockedEdge: number;
  blockedExposure: number;
  blockedPositions: number;
};

/* ---------- seeded randomness ---------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function gaussian(rand: () => number) {
  /* Box-Muller. u is nudged off zero so the log never blows up. */
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ---------- the repo's math ---------- */

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** backend/app/utils/math.py :: kelly_fraction */
export function kellyFraction(fair: number, price: number) {
  const p = clamp(price, 0.01, 0.99);
  const f = clamp(fair, 0.01, 0.99);
  const b = (1 - p) / p;
  const q = 1 - f;
  return clamp((b * f - q) / Math.max(b, 1e-9), 0, 1);
}

/* ---------- the synthetic book ---------- */

export type SynthMarket = {
  league: string;
  /** The probability the world actually runs on. */
  trueProbability: number;
  /** What the book shows: truth plus the market's own error. */
  price: number;
  spread: number;
  liquidity: number;
  /** What the agent thinks: truth plus the agent's error. */
  fair: number;
  /** How many markets later this one resolves. */
  holds: number;
  resolvesYes: boolean;
};

/*
  The world is built from the seed alone, before any risk setting is read, so
  changing a slider changes the decisions and never the markets. Two runs on
  seed 42 are the same 200 games.
*/
export function buildMarkets(seed: number, count = MARKET_COUNT): SynthMarket[] {
  const rand = mulberry32(seed);
  const markets: SynthMarket[] = [];

  for (let i = 0; i < count; i += 1) {
    const shape = SHAPES[i % SHAPES.length];
    const trueProbability = clamp(shape.price + gaussian(rand) * 0.1, 0.05, 0.95);
    const price = clamp(trueProbability + gaussian(rand) * MARKET_SIGMA, 0.02, 0.98);
    const fair = clamp(trueProbability + gaussian(rand) * AGENT_SIGMA, 0.01, 0.99);
    const spread = clamp(shape.spread + gaussian(rand) * 0.008, 0.01, 0.06);
    const liquidity = Math.round(shape.liquidity * (0.6 + rand() * 0.9));
    const holds = 2 + Math.floor(rand() * 8);
    const resolvesYes = rand() < trueProbability;

    markets.push({
      league: shape.league,
      trueProbability,
      price,
      spread,
      liquidity,
      fair,
      holds,
      resolvesYes,
    });
  }

  return markets;
}

/* ---------- the run ---------- */

type OpenTrade = {
  settlesAt: number;
  side: "yes" | "no";
  stake: number;
  quantity: number;
  fillPrice: number;
  fees: number;
  resolvesYes: boolean;
};

export function runSimulation(settings: RunSettings): RunResult {
  const markets = buildMarkets(settings.seed);

  let cash = settings.bankroll;
  let exposure = 0;
  let equity = settings.bankroll;

  const open: OpenTrade[] = [];
  const points: { at: number; equity: number }[] = [{ at: 0, equity }];

  let trades = 0;
  let wins = 0;
  let blockedEdge = 0;
  let blockedExposure = 0;
  let blockedPositions = 0;

  /* backend/app/services/settlement_service.py :: settle_trade */
  const settle = (trade: OpenTrade, at: number) => {
    const resolution =
      (trade.side === "yes" && trade.resolvesYes) ||
      (trade.side === "no" && !trade.resolvesYes)
        ? 1
        : 0;
    const realized = trade.quantity * (resolution - trade.fillPrice) - trade.fees;
    cash += trade.stake + realized;
    exposure -= trade.stake;
    equity = cash + exposure;
    if (realized > 0) wins += 1;
    points.push({ at, equity });
  };

  const settleDue = (at: number) => {
    for (let i = open.length - 1; i >= 0; i -= 1) {
      if (open[i].settlesAt <= at) {
        settle(open[i], at);
        open.splice(i, 1);
      }
    }
  };

  for (let i = 0; i < markets.length; i += 1) {
    settleDue(i);

    const market = markets[i];
    const rawEdge = market.fair - market.price;
    const side: "yes" | "no" = rawEdge >= 0 ? "yes" : "no";

    /* 1. edge check — risk_service.py, min_edge_to_trade */
    if (Math.abs(rawEdge) < settings.edgeThreshold) {
      blockedEdge += 1;
      continue;
    }

    const reference = clamp(side === "yes" ? market.price : 1 - market.price, 0.01, 0.99);
    const sideFair = side === "yes" ? market.fair : 1 - market.fair;

    /* 2. sizing — risk_service.py :: size_position */
    const stake =
      settings.rule === "kelly"
        ? Math.round(equity * kellyFraction(sideFair, reference) * settings.kelly * 100) / 100
        : Math.round(equity * 0.02 * 100) / 100;

    if (stake <= 0) {
      blockedEdge += 1;
      continue;
    }

    /* 3. exposure caps — market_exposure_cap_exceeded, then the repo's
       category cap on total open exposure, then insufficient_cash. The repo
       blocks the trade rather than trimming it, so this does too. */
    if (
      stake > equity * settings.maxExposure ||
      exposure + stake > equity * REPO.maxCategoryExposurePct ||
      stake > cash
    ) {
      blockedExposure += 1;
      continue;
    }

    /* 4. open-position cap — max_open_trades_reached */
    if (open.length >= settings.maxOpen) {
      blockedPositions += 1;
      continue;
    }

    /* 5. fill — execution_service.py :: execute_trade */
    const slippage = reference * (REPO.slippageBps / 10_000);
    const fillPrice = clamp(reference + market.spread / 2 + slippage, 0.01, 0.99);
    const quantity = stake / fillPrice;
    const fees = stake * (REPO.feeBps / 10_000);

    cash -= stake;
    exposure += stake;
    trades += 1;

    open.push({
      settlesAt: i + market.holds,
      side,
      stake,
      quantity,
      fillPrice,
      fees,
      resolvesYes: market.resolvesYes,
    });
  }

  /* Anything still open when the book runs out is settled at the end so the
     curve finishes on a real number rather than on unrealised marks. */
  open
    .slice()
    .sort((a, b) => a.settlesAt - b.settlesAt)
    .forEach((trade) => settle(trade, Math.min(trade.settlesAt, markets.length)));
  open.length = 0;

  /* backend/app/utils/math.py :: max_drawdown */
  let peak = points[0].equity;
  let maxDrawdown = 0;
  for (const point of points) {
    peak = Math.max(peak, point.equity);
    if (peak > 0) maxDrawdown = Math.max(maxDrawdown, (peak - point.equity) / peak);
  }

  return {
    settings,
    points,
    finalEquity: equity,
    returnPct: (equity / settings.bankroll - 1) * 100,
    maxDrawdown,
    trades,
    wins,
    winRate: trades > 0 ? (wins / trades) * 100 : 0,
    blockedEdge,
    blockedExposure,
    blockedPositions,
  };
}

/* ---------- drawing ---------- */

export type Geometry = {
  line: string;
  /** Peak line down to equity; zero-height wherever the run is at a new high. */
  drawdown: string;
  baseline: number;
  width: number;
  height: number;
};

export function geometry(result: RunResult, width = 720, height = 200): Geometry {
  const pad = 10;
  const points = result.points;
  const span = Math.max(points[points.length - 1].at, 1);

  const peaks: number[] = [];
  let peak = points[0].equity;
  for (const point of points) {
    peak = Math.max(peak, point.equity);
    peaks.push(peak);
  }

  const values = [
    ...points.map((point) => point.equity),
    ...peaks,
    result.settings.bankroll,
  ];
  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = Math.max(high - low, 1);

  const x = (at: number) => (at / span) * (width - pad * 2) + pad;
  const y = (value: number) => height - pad - ((value - low) / range) * (height - pad * 2);

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(point.at).toFixed(1)} ${y(point.equity).toFixed(1)}`)
    .join(" ");

  const forward = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(point.at).toFixed(1)} ${y(peaks[index]).toFixed(1)}`)
    .join(" ");
  const back = points
    .map((point, index) => `L${x(point.at).toFixed(1)} ${y(point.equity).toFixed(1)}`)
    .reverse()
    .join(" ");

  return {
    line,
    drawdown: points.length > 1 ? `${forward} ${back} Z` : "",
    baseline: y(result.settings.bankroll),
    width,
    height,
  };
}

/* ---------- formatting ---------- */

/* Written by hand rather than through toLocaleString: the server and the
   browser must produce byte-identical text or hydration complains. */
export function money(value: number) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits[i];
  }
  return `${sign}$${out}`;
}

export function signedPct(value: number, places = 1) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(places)}%`;
}
