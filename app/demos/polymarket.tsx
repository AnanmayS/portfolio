"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_SETTINGS,
  MARKET_COUNT,
  REPO,
  geometry,
  money,
  runSimulation,
  signedPct,
  type RunResult,
  type RunSettings,
  type StakeRule,
} from "./polymarket-data";

/*
  The repo has no real trade history to show, so this is not a scoreboard: it
  is the risk engine itself, run by the visitor over synthetic markets. The
  markets are built from the seed alone, so changing a rule changes the
  decisions and never the games — two runs on seed 42 are the same 200 books.

  The first paint is already a finished run: the default settings and seed go
  through the same pure function on the server and on the client, so the
  prerendered HTML and the hydrated tree agree exactly.
*/

const same = (a: RunSettings, b: RunSettings) =>
  a.bankroll === b.bankroll &&
  a.rule === b.rule &&
  a.kelly === b.kelly &&
  a.maxExposure === b.maxExposure &&
  a.maxOpen === b.maxOpen &&
  a.edgeThreshold === b.edgeThreshold &&
  a.seed === b.seed;

export function PolymarketSandbox() {
  const first = useMemo(() => runSimulation(DEFAULT_SETTINGS), []);

  const [draft, setDraft] = useState<RunSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<RunResult>(first);
  const [previous, setPrevious] = useState<RunResult | null>(null);

  const set = <K extends keyof RunSettings>(key: K, value: RunSettings[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const run = () => {
    setPrevious(result);
    setResult(runSimulation(draft));
  };

  const geo = geometry(result);
  const dirty = !same(draft, result.settings);

  const change =
    previous && previous.finalEquity > 0
      ? (result.finalEquity / previous.finalEquity - 1) * 100
      : null;

  const summary =
    `Equity over ${MARKET_COUNT} settled synthetic markets. ` +
    `Starts at ${money(result.settings.bankroll)}, ends at ${money(result.finalEquity)}, ` +
    `worst drawdown ${(result.maxDrawdown * 100).toFixed(1)} percent.`;

  return (
    <div className="pm">
      <div className="pm-controls">
        <label className="pm-control">
          <span className="pm-head">
            <span>bankroll</span>
            <b>{money(draft.bankroll)}</b>
          </span>
          <input
            max={10000}
            min={500}
            onChange={(event) => set("bankroll", Number(event.target.value))}
            step={250}
            type="range"
            value={draft.bankroll}
          />
        </label>

        <label className="pm-control">
          {/* no readout here: the select already says what it is */}
          <span className="pm-head">
            <span>stake rule</span>
          </span>
          <select
            className="pm-select"
            onChange={(event) => set("rule", event.target.value as StakeRule)}
            value={draft.rule}
          >
            <option value="flat">flat 2% of bankroll</option>
            <option value="kelly">fractional Kelly</option>
          </select>
        </label>

        <label
          className={`pm-control${draft.rule === "flat" ? " pm-control-off" : ""}`}
        >
          <span className="pm-head">
            <span>kelly multiplier</span>
            <b>{draft.kelly.toFixed(2)}×</b>
          </span>
          <input
            disabled={draft.rule === "flat"}
            max={1}
            min={0.1}
            onChange={(event) => set("kelly", Number(event.target.value))}
            step={0.05}
            type="range"
            value={draft.kelly}
          />
        </label>

        <label className="pm-control">
          <span className="pm-head">
            <span>max exposure / market</span>
            <b>{Math.round(draft.maxExposure * 100)}%</b>
          </span>
          <input
            max={25}
            min={1}
            onChange={(event) => set("maxExposure", Number(event.target.value) / 100)}
            step={1}
            type="range"
            value={Math.round(draft.maxExposure * 100)}
          />
        </label>

        <label className="pm-control">
          <span className="pm-head">
            <span>max open positions</span>
            <b>{draft.maxOpen}</b>
          </span>
          <input
            max={10}
            min={1}
            onChange={(event) => set("maxOpen", Number(event.target.value))}
            step={1}
            type="range"
            value={draft.maxOpen}
          />
        </label>

        <label className="pm-control">
          <span className="pm-head">
            <span>edge threshold</span>
            <b>{(draft.edgeThreshold * 100).toFixed(1)} pts</b>
          </span>
          <input
            max={10}
            min={0}
            onChange={(event) =>
              set("edgeThreshold", Number(event.target.value) / 100)
            }
            step={0.5}
            type="range"
            value={(draft.edgeThreshold * 100).toFixed(1)}
          />
        </label>
      </div>

      <p className="pm-fixed">
        fee {REPO.feeBps} bps of stake · slippage {REPO.slippageBps} bps of price ·
        half the spread crossed · category exposure cap{" "}
        {Math.round(REPO.maxCategoryExposurePct * 100)}%
        <br />
        agent estimate σ 8 pts · market mispricing σ 6 pts — the agent has skill,
        not sight
      </p>

      <div className="pm-run">
        <button className="pm-go" onClick={run} type="button">
          run {MARKET_COUNT} markets
        </button>
        <label className="pm-seed">
          <span>seed</span>
          <input
            inputMode="numeric"
            max={999999}
            min={0}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value, 10);
              set("seed", Number.isFinite(next) ? Math.min(Math.max(next, 0), 999999) : 0);
            }}
            step={1}
            type="number"
            value={draft.seed}
          />
        </label>
        <span className="pm-dirty">{dirty ? "settings changed — run again" : ""}</span>
      </div>

      {/* The box is fluid and the strokes are not, so the curve keeps a
          usable height at 390px instead of collapsing into a sliver. */}
      <svg
        aria-label={summary}
        className="pm-curve"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${geo.width} ${geo.height}`}
      >
        {geo.drawdown ? <path className="pm-dd" d={geo.drawdown} /> : null}
        <line
          className="pm-base"
          vectorEffect="non-scaling-stroke"
          x1={10}
          x2={geo.width - 10}
          y1={geo.baseline}
          y2={geo.baseline}
        />
        <path className="pm-line" d={geo.line} vectorEffect="non-scaling-stroke" />
      </svg>

      <p className="pm-legend">
        <span className="pm-key pm-key-line">equity</span>
        <span className="pm-key pm-key-base">start {money(result.settings.bankroll)}</span>
        <span className="pm-key pm-key-dd">below the running peak</span>
      </p>

      <dl className="pm-stats">
        <div>
          <dt>final equity</dt>
          <dd className="pm-final">
            {money(result.finalEquity)}{" "}
            <span className="pm-ret">{signedPct(result.returnPct)}</span>
          </dd>
        </div>
        <div>
          <dt>max drawdown</dt>
          <dd>{(result.maxDrawdown * 100).toFixed(1)}%</dd>
        </div>
        <div>
          <dt>trades taken</dt>
          <dd>{result.trades}</dd>
        </div>
        <div>
          <dt>win rate</dt>
          <dd>{result.winRate.toFixed(1)}%</dd>
        </div>
      </dl>

      <p className="pm-blocked">
        blocked: {result.blockedEdge} by edge · {result.blockedExposure} by exposure
        · {result.blockedPositions} by position cap
      </p>

      {change === null ? null : (
        <p className="pm-delta">
          <span
            className={change >= 0 ? "pm-delta-up" : "pm-delta-down"}
          >
            {signedPct(change)}
          </span>{" "}
          vs previous run
        </p>
      )}

      <p className="pm-caption">
        A simulation using the repo&apos;s risk rules and fee model. Synthetic
        markets; the real agent paper-trades live Polymarket sports markets and
        keeps every postmortem.
      </p>
    </div>
  );
}
