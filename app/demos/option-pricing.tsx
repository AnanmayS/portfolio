"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  greeks,
  parity,
  payoff,
  price,
  type Greeks,
  type OptionKind,
  type Params,
} from "./black-scholes";

/*
  The Streamlit dashboard, turned into something you can actually turn. Five
  sliders drive one closed-form model; the readout is the measured result and
  the chart is the same model evaluated at every spot from 50 to 150, so moving
  an input moves a whole curve rather than a single number.

  Everything is derived synchronously from state — one build of the chart is
  about 250 Black-Scholes evaluations, roughly 40us, so an input event can
  afford to do it. The one exception is the time-decay run, which repaints the
  DOM directly from an rAF loop instead of pushing 150 renders through React.
*/

const SPOT_MIN = 50;
const SPOT_MAX = 150;
const DAYS_MIN = 1;
const DAYS_MAX = 730;
const YEAR = 365;
const DECAY_MS = 2500;

const VB_W = 720;
const VB_H = 220;
const PAD_L = 46;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 28;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;
const BASE_Y = VB_H - PAD_B;

/* One sample every 0.83 of a point of spot: smooth at 720 units wide, and
   small enough that the prerendered polyline stays under 2 KB. */
const SAMPLES = 120;
const SPOTS = Array.from(
  { length: SAMPLES + 1 },
  (_, i) => SPOT_MIN + (i / SAMPLES) * (SPOT_MAX - SPOT_MIN),
);

const X_TICKS = [50, 75, 100, 125, 150];

function xOf(spot: number): number {
  return PAD_L + ((spot - SPOT_MIN) / (SPOT_MAX - SPOT_MIN)) * PLOT_W;
}

function spotAt(x: number): number {
  return SPOT_MIN + ((x - PAD_L) / PLOT_W) * (SPOT_MAX - SPOT_MIN);
}

function yOf(value: number, yMax: number): number {
  const y = BASE_Y - (value / yMax) * PLOT_H;
  return y < PAD_T ? PAD_T : y > BASE_Y ? BASE_Y : y;
}

const SPOT_X = SPOTS.map(xOf);

/** A 1/2/2.5/5 x 10^n tick step that lands four or five gridlines under `top`. */
function scaleFor(top: number): { max: number; step: number } {
  const raw = Math.max(top, 1) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  return { max: Math.ceil(top / step) * step, step };
}

type View = {
  read: Greeks;
  lhs: number;
  rhs: number;
  curve: string;
  expiry: string;
  yMax: number;
  yTicks: number[];
  dotY: number;
};

/*
  The vertical scale is deliberately taken from the payoff and from the price
  at the LONGEST expiry the slider allows, never from the current T. Both of
  those are independent of T, so the axis holds still while time decays and the
  curve is seen to collapse onto the payoff instead of the frame closing in
  around it. (Value is monotone in T for a call, and for a put the maximum over
  T sits at one of the two endpoints, which are exactly these two curves.)
*/
function buildView(kind: OptionKind, p: Params): View {
  const longest = { ...p, time: DAYS_MAX / YEAR };
  let peak = 0;

  for (let i = 0; i <= SAMPLES; i++) {
    longest.spot = SPOTS[i];
    const at = payoff(kind, longest.spot, p.strike);
    if (at > peak) peak = at;
    const long = price(kind, longest);
    if (long > peak) peak = long;
  }

  const { max: yMax, step } = scaleFor(peak);

  const now = { ...p };
  let curve = "";
  for (let i = 0; i <= SAMPLES; i++) {
    now.spot = SPOTS[i];
    curve += `${SPOT_X[i].toFixed(1)},${yOf(price(kind, now), yMax).toFixed(1)} `;
  }

  /* The payoff is two straight segments meeting at the strike, so it is drawn
     from its three vertices rather than sampled — the kink stays sharp. */
  const kink = Math.min(Math.max(p.strike, SPOT_MIN), SPOT_MAX);
  const expiry = [SPOT_MIN, kink, SPOT_MAX]
    .map((s) => `${xOf(s).toFixed(1)},${yOf(payoff(kind, s, p.strike), yMax).toFixed(1)}`)
    .join(" ");

  const yTicks: number[] = [];
  for (let v = 0; v <= yMax + step * 1e-9; v += step) yTicks.push(v);

  const read = greeks(kind, p);
  const balance = parity(p);

  return {
    read,
    lhs: balance.lhs,
    rhs: balance.rhs,
    curve: curve.trimEnd(),
    expiry,
    yMax,
    yTicks,
    dotY: yOf(read.price, yMax),
  };
}

function tick(v: number): string {
  return String(Number(v.toFixed(2)));
}

function spanOf(days: number): string {
  return days < 90 ? `${days} d` : `${(days / YEAR).toFixed(2)} y`;
}

function words(days: number): string {
  return days < 90
    ? `${days} day${days === 1 ? "" : "s"}`
    : `${(days / YEAR).toFixed(2)} years`;
}

export function OptionPricing() {
  const [kind, setKind] = useState<OptionKind>("call");
  const [spot, setSpot] = useState(100);
  const [strike, setStrike] = useState(100);
  const [volPct, setVolPct] = useState(20);
  const [ratePct, setRatePct] = useState(5);
  const [days, setDays] = useState(YEAR);
  /* Spot the pointer or the S slider is interrogating, if any. */
  const [probeSpot, setProbeSpot] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  /* Read from matchMedia in an effect, so the first client render matches the
     prerendered HTML. */
  const [still, setStill] = useState(false);

  const params = useMemo<Params>(
    () => ({
      spot,
      strike,
      sigma: volPct / 100,
      rate: ratePct / 100,
      time: days / YEAR,
    }),
    [spot, strike, volPct, ratePct, days],
  );

  const view = useMemo(() => buildView(kind, params), [kind, params]);
  const probe = useMemo(
    () => (probeSpot === null ? null : greeks(kind, { ...params, spot: probeSpot })),
    [kind, params, probeSpot],
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const curveRef = useRef<SVGPolylineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const capRef = useRef<HTMLSpanElement>(null);
  const deltaRef = useRef<HTMLSpanElement>(null);
  const gammaRef = useRef<HTMLSpanElement>(null);
  const vegaRef = useRef<HTMLSpanElement>(null);
  const thetaRef = useRef<HTMLSpanElement>(null);
  const rhoRef = useRef<HTMLSpanElement>(null);
  const lhsRef = useRef<HTMLSpanElement>(null);
  const rhsRef = useRef<HTMLSpanElement>(null);
  const daysInputRef = useRef<HTMLInputElement>(null);
  const daysLabelRef = useRef<HTMLSpanElement>(null);

  const frameRef = useRef(0);
  const playingRef = useRef(false);
  const decayedRef = useRef(days);
  const spotFocusRef = useRef(false);

  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    setStill(query.matches);
    const onChange = () => setStill(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  /* Writes one frame of the decay straight to the DOM. Only T moves, so the
     axis, the payoff and the hairline are all untouched. */
  const paint = useCallback(
    (atDays: number) => {
      const next = buildView(kind, { ...params, time: atDays / YEAR });
      curveRef.current?.setAttribute("points", next.curve);
      dotRef.current?.setAttribute("cy", next.dotY.toFixed(1));
      if (priceRef.current) priceRef.current.textContent = next.read.price.toFixed(2);
      if (capRef.current) capRef.current.textContent = next.read.price.toFixed(2);
      if (deltaRef.current) deltaRef.current.textContent = next.read.delta.toFixed(3);
      if (gammaRef.current) gammaRef.current.textContent = next.read.gamma.toFixed(4);
      if (vegaRef.current) vegaRef.current.textContent = (next.read.vega / 100).toFixed(3);
      if (thetaRef.current)
        thetaRef.current.textContent = (next.read.theta / YEAR).toFixed(4);
      if (rhoRef.current) rhoRef.current.textContent = (next.read.rho / 100).toFixed(3);
      if (lhsRef.current) lhsRef.current.textContent = next.lhs.toFixed(2);
      if (rhsRef.current) rhsRef.current.textContent = next.rhs.toFixed(2);
      if (daysLabelRef.current) daysLabelRef.current.textContent = spanOf(atDays);
      if (daysInputRef.current) daysInputRef.current.value = String(atDays);
    },
    [kind, params],
  );

  /* Hands the animated value back to React so a re-render lands where the last
     frame left off rather than snapping back to the pre-run T. */
  const settle = useCallback(() => {
    if (!playingRef.current) return;
    cancelAnimationFrame(frameRef.current);
    playingRef.current = false;
    setPlaying(false);
    setDays(decayedRef.current);
  }, []);

  const runDecay = useCallback(() => {
    if (still || playingRef.current || days <= DAYS_MIN) return;

    setProbeSpot(null);
    playingRef.current = true;
    setPlaying(true);

    const from = days;
    const started = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - started) / DECAY_MS, 1);
      /* Premium runs roughly with the square root of T, so a linear ramp would
         do almost nothing then collapse at the end. Squaring the remaining
         fraction makes the collapse look even. */
      const left = (1 - t) * (1 - t);
      const at = Math.max(DAYS_MIN, Math.round(DAYS_MIN + (from - DAYS_MIN) * left));
      decayedRef.current = at;
      paint(at);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      playingRef.current = false;
      setPlaying(false);
      setDays(DAYS_MIN);
    };

    frameRef.current = requestAnimationFrame(step);
  }, [days, paint, still]);

  const readProbe = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    if (box.width === 0) return;
    const x = ((event.clientX - box.left) / box.width) * VB_W;
    const at = Math.round(spotAt(x));
    setProbeSpot(at < SPOT_MIN ? SPOT_MIN : at > SPOT_MAX ? SPOT_MAX : at);
  }, []);

  const money = view.read.price.toFixed(2);
  const probeX = probeSpot === null ? 0 : xOf(probeSpot);
  const label =
    `${kind === "call" ? "Call" : "Put"} value against spot price, 50 to 150. ` +
    `The straight line is value at expiry; the curve is the Black-Scholes ` +
    `price with ${words(days)} to run, ${money} at the current spot of ${spot}.`;

  return (
    <div className="opt">
      <div className="opt-head">
        <div className="opt-seg" role="group" aria-label="Option type">
          {(["call", "put"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              onClick={() => {
                settle();
                setKind(option);
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="opt-legend">
          <span className="opt-key opt-key--slow">at expiry</span>
          <span className="opt-key opt-key--ink">priced now</span>
        </div>
      </div>

      <div className="opt-grid">
        <label className="opt-field">
          <span className="opt-field-head">
            <span className="opt-field-name">spot S</span>
            <span className="opt-field-val">{spot}</span>
          </span>
          <input
            type="range"
            aria-label="Spot price"
            min={SPOT_MIN}
            max={SPOT_MAX}
            step={1}
            value={spot}
            onFocus={() => {
              spotFocusRef.current = true;
              setProbeSpot(spot);
            }}
            onBlur={() => {
              spotFocusRef.current = false;
              setProbeSpot(null);
            }}
            onChange={(event) => {
              settle();
              const next = Number(event.target.value);
              setSpot(next);
              if (spotFocusRef.current) setProbeSpot(next);
            }}
          />
        </label>

        <label className="opt-field">
          <span className="opt-field-head">
            <span className="opt-field-name">strike K</span>
            <span className="opt-field-val">{strike}</span>
          </span>
          <input
            type="range"
            aria-label="Strike price"
            min={SPOT_MIN}
            max={SPOT_MAX}
            step={1}
            value={strike}
            onChange={(event) => {
              settle();
              setStrike(Number(event.target.value));
            }}
          />
        </label>

        <label className="opt-field">
          <span className="opt-field-head">
            <span className="opt-field-name">volatility σ</span>
            <span className="opt-field-val">{volPct.toFixed(1)}%</span>
          </span>
          <input
            type="range"
            aria-label="Volatility, percent a year"
            min={5}
            max={100}
            step={0.5}
            value={volPct}
            onChange={(event) => {
              settle();
              setVolPct(Number(event.target.value));
            }}
          />
        </label>

        <label className="opt-field">
          <span className="opt-field-head">
            <span className="opt-field-name">rate r</span>
            <span className="opt-field-val">{ratePct.toFixed(1)}%</span>
          </span>
          <input
            type="range"
            aria-label="Risk-free rate, percent a year"
            min={0}
            max={10}
            step={0.1}
            value={ratePct}
            onChange={(event) => {
              settle();
              setRatePct(Number(event.target.value));
            }}
          />
        </label>

        <label className="opt-field">
          <span className="opt-field-head">
            <span className="opt-field-name">expiry T</span>
            <span className="opt-field-val" ref={daysLabelRef}>
              {spanOf(days)}
            </span>
          </span>
          <input
            type="range"
            ref={daysInputRef}
            aria-label="Time to expiry, in days"
            min={DAYS_MIN}
            max={DAYS_MAX}
            step={1}
            value={days}
            onChange={(event) => {
              settle();
              setDays(Number(event.target.value));
            }}
          />
        </label>
      </div>

      <div className="opt-read">
        <span className="opt-price">
          <span className="opt-price-k">{kind}</span>
          <span className="opt-price-v" ref={priceRef}>
            {money}
          </span>
        </span>
        <span className="opt-greeks">
          <span className="opt-greek">
            <span className="opt-greek-k" aria-hidden="true">
              Δ
            </span>
            <span className="opt-sr">delta</span>
            <span className="opt-greek-v" ref={deltaRef}>
              {view.read.delta.toFixed(3)}
            </span>
          </span>
          <span className="opt-greek">
            <span className="opt-greek-k" aria-hidden="true">
              Γ
            </span>
            <span className="opt-sr">gamma</span>
            <span className="opt-greek-v" ref={gammaRef}>
              {view.read.gamma.toFixed(4)}
            </span>
          </span>
          <span className="opt-greek">
            <span className="opt-greek-k" aria-hidden="true">
              ν
            </span>
            <span className="opt-sr">vega per point of volatility</span>
            <span className="opt-greek-v" ref={vegaRef}>
              {(view.read.vega / 100).toFixed(3)}
            </span>
          </span>
          <span className="opt-greek">
            <span className="opt-greek-k" aria-hidden="true">
              Θ/d
            </span>
            <span className="opt-sr">theta a day</span>
            <span className="opt-greek-v" ref={thetaRef}>
              {(view.read.theta / YEAR).toFixed(4)}
            </span>
          </span>
          <span className="opt-greek">
            <span className="opt-greek-k" aria-hidden="true">
              ρ
            </span>
            <span className="opt-sr">rho per point of rate</span>
            <span className="opt-greek-v" ref={rhoRef}>
              {(view.read.rho / 100).toFixed(3)}
            </span>
          </span>
        </span>
      </div>

      <p className="opt-parity">
        C − P = <span ref={lhsRef}>{view.lhs.toFixed(2)}</span>
        {" · "}S − K·e^(−rT) = <span ref={rhsRef}>{view.rhs.toFixed(2)}</span>
      </p>

      <div className="opt-chartwrap">
        <svg
          className="opt-chart"
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={label}
          fill="none"
          onPointerMove={readProbe}
          onPointerDown={readProbe}
          onPointerLeave={() => setProbeSpot(spotFocusRef.current ? spot : null)}
          onPointerUp={(event) => {
            if (event.pointerType === "mouse") return;
            setProbeSpot(spotFocusRef.current ? spot : null);
          }}
        >
          {view.yTicks.map((v) => (
            <g key={v}>
              <line
                x1={PAD_L}
                y1={yOf(v, view.yMax)}
                x2={VB_W - PAD_R}
                y2={yOf(v, view.yMax)}
                stroke="var(--rule)"
              />
              <text
                className="opt-tick"
                x={PAD_L - 8}
                y={yOf(v, view.yMax) + 3.5}
                textAnchor="end"
              >
                {tick(v)}
              </text>
            </g>
          ))}

          {X_TICKS.map((s) => (
            <text
              key={s}
              className="opt-tick"
              x={xOf(s)}
              y={BASE_Y + 16}
              textAnchor="middle"
            >
              {s}
            </text>
          ))}

          <line
            x1={xOf(strike)}
            y1={PAD_T}
            x2={xOf(strike)}
            y2={BASE_Y}
            stroke="var(--rule)"
            strokeDasharray="3 4"
          />
          <text
            className="opt-tick"
            x={Math.min(Math.max(xOf(strike) + 6, PAD_L + 6), VB_W - PAD_R - 12)}
            y={PAD_T + 22}
            textAnchor="start"
          >
            K
          </text>

          <polyline points={view.expiry} stroke="var(--slow)" strokeWidth="1.5" />
          <polyline
            ref={curveRef}
            points={view.curve}
            stroke="var(--ink)"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          <line
            x1={xOf(spot)}
            y1={PAD_T}
            x2={xOf(spot)}
            y2={BASE_Y}
            stroke="var(--faint)"
          />
          <circle ref={dotRef} cx={xOf(spot)} cy={view.dotY} r="3.5" fill="var(--accent)" />

          {probe !== null && probeSpot !== null ? (
            <g>
              <line
                x1={probeX}
                y1={PAD_T}
                x2={probeX}
                y2={BASE_Y}
                stroke="var(--muted)"
                strokeDasharray="2 3"
              />
              <circle
                cx={probeX}
                cy={yOf(probe.price, view.yMax)}
                r="3"
                fill="var(--ground)"
                stroke="var(--ink)"
                strokeWidth="1.5"
              />
            </g>
          ) : null}
        </svg>

        {probe !== null && probeSpot !== null ? (
          <span
            className="opt-flag"
            style={{
              left: `${Math.min(Math.max((probeX / VB_W) * 100, 9), 91)}%`,
            }}
          >
            S {probeSpot} · price{" "}
            <span className="opt-flag-v">{probe.price.toFixed(2)}</span> · Δ{" "}
            {probe.delta.toFixed(2)}
          </span>
        ) : null}
      </div>

      <div className="opt-foot">
        <button
          className="opt-play"
          type="button"
          onClick={runDecay}
          disabled={still || playing || days <= DAYS_MIN}
        >
          {playing ? "decaying…" : "▶ time decay"}
        </button>
        <span className="opt-note">
          {still
            ? "step T with the slider"
            : days <= DAYS_MIN
              ? "T is at one day — raise it to run again"
              : "runs T down to one day, so the curve falls onto the payoff"}
        </span>
      </div>

      <p className="opt-caption">
        Black-Scholes, evaluated live in your browser — this European {kind} is worth{" "}
        <span ref={capRef}>{money}</span>. Move any input and the curve moves with it.
      </p>
    </div>
  );
}
