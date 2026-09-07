/*
  Black-Scholes for a European option on a non-dividend-paying asset, written
  as pure functions so the demo can call them a few hundred times a frame
  (one price per pixel of the curve) without allocating anything clever.

  The only approximation is the standard normal CDF. It uses Abramowitz &
  Stegun 26.2.17, whose error is bounded by 7.5e-8 — three orders of magnitude
  finer than the cent the readout prints, and enough that put-call parity
  closes to the last decimal shown.
*/

export type OptionKind = "call" | "put";

export type Params = {
  /** Spot price of the underlying. */
  spot: number;
  /** Strike. */
  strike: number;
  /** Volatility, as a fraction per year (0.2 is 20%). */
  sigma: number;
  /** Continuously compounded risk-free rate, as a fraction (0.05 is 5%). */
  rate: number;
  /** Time to expiry in years. */
  time: number;
};

/**
 * All five first- and second-order sensitivities, in their raw analytic
 * units: vega and rho are per one unit of vol/rate (divide by 100 to quote
 * them per percentage point) and theta is per year (divide by 365 for a day).
 */
export type Greeks = {
  price: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
};

const INV_SQRT_2PI = 0.3989422804014327;

/* Abramowitz & Stegun 26.2.17, |error| < 7.5e-8. */
const P = 0.2316419;
const B1 = 0.319381530;
const B2 = -0.356563782;
const B3 = 1.781477937;
const B4 = -1.821255978;
const B5 = 1.330274429;

/** Standard normal probability density. */
export function normalPdf(x: number): number {
  return INV_SQRT_2PI * Math.exp(-0.5 * x * x);
}

/** Standard normal cumulative distribution. */
export function normalCdf(x: number): number {
  if (Number.isNaN(x)) return Number.NaN;
  if (x === Infinity) return 1;
  if (x === -Infinity) return 0;

  const ax = Math.abs(x);
  const t = 1 / (1 + P * ax);
  /* Horner, so the fifth-order polynomial costs four multiplies. */
  const poly = t * (B1 + t * (B2 + t * (B3 + t * (B4 + t * B5))));
  const upperTail = normalPdf(ax) * poly;

  return x >= 0 ? 1 - upperTail : upperTail;
}

/**
 * True when the diffusion term has collapsed — expiry has arrived or vol is
 * zero — and the option is worth exactly its discounted forward intrinsic.
 * Guarded rather than assumed: d1 divides by sigma*sqrt(T).
 */
function degenerate(p: Params): boolean {
  return !(p.time > 0) || !(p.sigma > 0) || !(p.spot > 0) || !(p.strike > 0);
}

function intrinsic(kind: OptionKind, p: Params): Greeks {
  const discounted = p.strike * Math.exp(-p.rate * Math.max(p.time, 0));
  const forward = p.spot - discounted;
  const value = kind === "call" ? Math.max(forward, 0) : Math.max(-forward, 0);
  const live = kind === "call" ? (forward > 0 ? 1 : 0) : forward < 0 ? -1 : 0;

  return {
    price: value,
    delta: live === -1 ? -1 : live,
    gamma: 0,
    vega: 0,
    theta: 0,
    rho: live === 0 ? 0 : (kind === "call" ? 1 : -1) * p.time * discounted,
  };
}

/** Price and all five greeks in one pass; d1 and d2 are computed once. */
export function greeks(kind: OptionKind, p: Params): Greeks {
  if (degenerate(p)) return intrinsic(kind, p);

  const sqrtT = Math.sqrt(p.time);
  const vol = p.sigma * sqrtT;
  const discount = Math.exp(-p.rate * p.time);

  const d1 =
    (Math.log(p.spot / p.strike) + (p.rate + 0.5 * p.sigma * p.sigma) * p.time) / vol;
  const d2 = d1 - vol;

  const pdf1 = normalPdf(d1);
  const nd1 = normalCdf(d1);
  const nd2 = normalCdf(d2);
  /* N(-x) = 1 - N(x); taking it this way keeps both branches on one CDF call. */
  const nmd1 = 1 - nd1;
  const nmd2 = 1 - nd2;

  const gamma = pdf1 / (p.spot * vol);
  const vega = p.spot * pdf1 * sqrtT;
  const decay = -(p.spot * pdf1 * p.sigma) / (2 * sqrtT);

  if (kind === "call") {
    return {
      price: p.spot * nd1 - p.strike * discount * nd2,
      delta: nd1,
      gamma,
      vega,
      theta: decay - p.rate * p.strike * discount * nd2,
      rho: p.strike * p.time * discount * nd2,
    };
  }

  return {
    price: p.strike * discount * nmd2 - p.spot * nmd1,
    delta: nd1 - 1,
    gamma,
    vega,
    theta: decay + p.rate * p.strike * discount * nmd2,
    rho: -p.strike * p.time * discount * nmd2,
  };
}

/** Just the premium, for the hundred-odd samples that draw the curve. */
export function price(kind: OptionKind, p: Params): number {
  if (degenerate(p)) return intrinsic(kind, p).price;

  const vol = p.sigma * Math.sqrt(p.time);
  const discount = Math.exp(-p.rate * p.time);
  const d1 =
    (Math.log(p.spot / p.strike) + (p.rate + 0.5 * p.sigma * p.sigma) * p.time) / vol;
  const d2 = d1 - vol;

  return kind === "call"
    ? p.spot * normalCdf(d1) - p.strike * discount * normalCdf(d2)
    : p.strike * discount * normalCdf(-d2) - p.spot * normalCdf(-d1);
}

/** Value at expiry: the hockey stick the price curve collapses onto. */
export function payoff(kind: OptionKind, spot: number, strike: number): number {
  return kind === "call" ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0);
}

/**
 * Left and right sides of put-call parity, C - P = S - K*e^(-rT). They are
 * derived independently (two prices vs. a closed form) so printing both is a
 * live check that the pricing above has not drifted.
 */
export function parity(p: Params): { lhs: number; rhs: number } {
  return {
    lhs: price("call", p) - price("put", p),
    rhs: p.spot - p.strike * Math.exp(-p.rate * p.time),
  };
}
