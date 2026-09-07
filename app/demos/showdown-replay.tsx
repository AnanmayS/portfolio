"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ACTION_COUNT,
  BATTLE,
  BENCHMARKS,
  MOVE_ACTIONS,
  OBS_SIZE,
  actionLabel,
  actionMask,
  expectedDamage,
  featureGroups,
  maskReason,
  multiplier,
  type Turn,
} from "./showdown-replay-data";

/*
  ShowdownRL battle replay and policy viewer.

  Left panel is the board as the simulator holds it; right panel is what the
  policy actually reads (the 106-feature observation, grouped) and what it
  chose (the masked softmax over 7 actions). Everything is stepped, never
  animated: the only motion is the turn advancing, and auto-play is dropped
  entirely under prefers-reduced-motion.
*/

const STEP_MS = 1400;
const TURNS = BATTLE.turns;
const LAST = TURNS.length - 1;

/* The widest measured bar on the stat strip sets the scale for both. */
const SCALE_MAX = 100;

const CATEGORY: Record<string, string> = {
  physical: "phys",
  special: "spec",
  status: "status",
};

function pct(fraction: number) {
  return `${(fraction * 100).toFixed(1)}%`;
}

function hpText(fraction: number) {
  return `${Math.round(fraction * 100)}%`;
}

function MonChips({ types }: { types: string[] }) {
  return (
    <span className="sd-chips">
      {types.map((type) => (
        <span className="sd-chip" key={type}>
          {type}
        </span>
      ))}
    </span>
  );
}

function HpBar({ hp, small = false }: { hp: number; small?: boolean }) {
  return (
    <div className={small ? "sd-bar sd-bar-sm" : "sd-bar"} aria-hidden="true">
      <div
        className={hp > 0 && hp < 0.25 ? "sd-bar-fill is-low" : "sd-bar-fill"}
        style={{ width: `${Math.max(0, Math.min(1, hp)) * 100}%` }}
      />
    </div>
  );
}

function Side({
  role,
  mon,
}: {
  role: string;
  mon: { name: string; types: string[]; hp: number; status: string };
}) {
  return (
    <div className="sd-side">
      <p className="sd-side-role">{role}</p>
      <div className="sd-mon-head">
        <span className="sd-mon-name">{mon.name}</span>
        <MonChips types={mon.types} />
        <span className="sd-mon-hp">{hpText(mon.hp)}</span>
      </div>
      <HpBar hp={mon.hp} />
      <p className="sd-mon-status">
        status <span>{mon.status || "none"}</span>
      </p>
    </div>
  );
}

function ActionRows({ turn }: { turn: Turn }) {
  const mask = actionMask(turn);
  return (
    <ul className="sd-actions">
      {Array.from({ length: ACTION_COUNT }, (_, action) => {
        const legal = mask[action];
        const probability = turn.probs[action];
        const chosen = action === turn.chosen;
        const label = actionLabel(turn, action);
        const move = action < MOVE_ACTIONS ? turn.moves[action] : null;
        const slot = action < MOVE_ACTIONS ? null : turn.bench[action - MOVE_ACTIONS];
        const meta = move
          ? move.role === "attack"
            ? `${move.type} · ${move.power} bp · ${CATEGORY[move.category]} · ${multiplier(move).toFixed(2)}×`
            : `${move.role} · no damage`
          : `${slot!.types.join("/")} · ${hpText(slot!.hp)}`;
        const reason = maskReason(turn, action);
        return (
          <li
            key={action}
            className={`sd-action${legal ? "" : " is-masked"}${chosen ? " is-chosen" : ""}`}
          >
            <span className="sd-action-label">
              <span className="sd-action-head">
                <span className="sd-action-name">{label}</span>
                {legal ? null : <span className="sd-masked-chip">masked</span>}
              </span>
              <span className="sd-action-meta">{legal ? meta : reason}</span>
            </span>
            <span className="sd-prob-track" aria-hidden="true">
              <span
                className="sd-prob-fill"
                style={{ width: `${Math.max(probability, 0) * 100}%` }}
              />
            </span>
            <span className="sd-prob-value">{pct(probability)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function FeatureDisclosure({ turn }: { turn: Turn }) {
  const groups = useMemo(() => featureGroups(turn), [turn]);
  return (
    <details className="sd-features">
      <summary>
        {OBS_SIZE} features · the observation this turn
      </summary>
      <div className="sd-feature-body">
        {groups.map((group) => (
          <section className="sd-feature-group" key={group.name}>
            <p className="sd-feature-head">
              <span>{group.name}</span>
              <span className="sd-feature-span">
                {group.span} · {group.count}
              </span>
            </p>
            <dl className="sd-feature-grid">
              {group.rows.map((row) => (
                <div className="sd-feature-row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <p className="sd-feature-total">Σ 106 stored features</p>
      </div>
    </details>
  );
}

export function ShowdownReplay() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [still, setStill] = useState(false);
  const dots = useRef<(HTMLButtonElement | null)[]>([]);

  const turn = TURNS[index];

  /* Reduced motion removes auto-play entirely; the stepper is untouched. */
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setStill(query.matches);
      if (query.matches) setPlaying(false);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIndex((current) => Math.min(LAST, current + 1));
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (playing && index >= LAST) setPlaying(false);
  }, [playing, index]);

  const step = useCallback((next: number, moveFocus: boolean) => {
    const clamped = Math.max(0, Math.min(LAST, next));
    setIndex(clamped);
    setPlaying(false);
    if (moveFocus) {
      requestAnimationFrame(() => dots.current[clamped]?.focus());
    }
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const active = document.activeElement as HTMLElement | null;
    const onDot = active?.dataset?.sdDot !== undefined;
    step(index + (event.key === "ArrowRight" ? 1 : -1), onDot);
  };

  return (
    <div
      className="sd"
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="group"
      aria-label="ShowdownRL battle replay. Left and right arrow keys step through the turns."
    >
      <div className="sd-track" role="group" aria-label="jump to a turn">
        {TURNS.map((item, i) => (
          <button
            key={item.turn}
            type="button"
            data-sd-dot=""
            ref={(node) => {
              dots.current[i] = node;
            }}
            className={`sd-dot${i === index ? " is-current" : ""}${i < index ? " is-done" : ""}`}
            tabIndex={i === index ? 0 : -1}
            aria-label={`turn ${item.turn}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => step(i, true)}
          />
        ))}
      </div>

      <div className="sd-bar-row">
        <p className="sd-counter">
          turn <span>{turn.turn}</span> of <span>{TURNS.length}</span>
        </p>
        <div className="sd-controls">
          <button
            type="button"
            className="sd-btn"
            onClick={() => step(index - 1, false)}
            disabled={index === 0}
          >
            ← prev
          </button>
          <button
            type="button"
            className="sd-btn"
            onClick={() => step(index + 1, false)}
            disabled={index === LAST}
          >
            next →
          </button>
          {still ? null : (
            <button
              type="button"
              className="sd-btn sd-btn-primary"
              aria-pressed={playing}
              onClick={() => {
                if (!playing && index >= LAST) setIndex(0);
                setPlaying(!playing);
              }}
            >
              {playing ? "pause" : "auto-play"}
            </button>
          )}
        </div>
      </div>

      <div className="sd-panels">
        <div className="sd-panel">
          <p className="sd-panel-title">the board</p>
          <Side role="opponent · type-aware" mon={turn.opponent} />
          <Side role="agent · maskable ppo v11" mon={turn.agent} />

          <div className="sd-bench">
            <p className="sd-bench-title">bench</p>
            <ul>
              {turn.bench.map((slot) => (
                <li
                  className={`sd-bench-item${slot.hp <= 0 ? " is-out" : ""}`}
                  key={slot.name}
                >
                  <span className="sd-bench-id">
                    <span className="sd-bench-name">{slot.name}</span>
                    <MonChips types={slot.types} />
                  </span>
                  <HpBar hp={slot.hp} small />
                  <span className="sd-bench-hp">{hpText(slot.hp)}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="sd-log" aria-live="polite">
            <span className="sd-log-turn">t{turn.turn}</span> {turn.log}
          </p>
          <p className="sd-why">{turn.why}</p>
        </div>

        <div className="sd-panel">
          <p className="sd-panel-title">what the policy saw and chose</p>
          <ActionRows turn={turn} />
          <p className="sd-chosen-note">
            chose <span>{actionLabel(turn, turn.chosen)}</span>
            {turn.chosen < MOVE_ACTIONS &&
            turn.moves[turn.chosen].role === "attack" ? (
              <>
                {" · "}
                {(expectedDamage(turn.moves[turn.chosen], turn.agentBoost) * 100).toFixed(
                  0,
                )}
                % expected damage
              </>
            ) : null}
          </p>
          <FeatureDisclosure turn={turn} />
        </div>
      </div>

      <div className="sd-stats">
        {BENCHMARKS.map((row) => (
          <div className="sd-stat" key={row.name}>
            <span className="sd-stat-name">{row.name}</span>
            <span className="sd-stat-track" aria-hidden="true">
              <span
                className={`sd-stat-fill${row.tone === "ppo" ? " is-ppo" : " is-base"}`}
                style={{ width: `${(row.winRate / SCALE_MAX) * 100}%` }}
              />
              {row.tone === "ppo" ? (
                <span
                  className="sd-stat-mark"
                  style={{ left: `${(BENCHMARKS[1].winRate / SCALE_MAX) * 100}%` }}
                />
              ) : null}
            </span>
            <span className="sd-stat-value">{row.winRate.toFixed(1)}%</span>
          </div>
        ))}
        <p className="sd-stat-note">
          PPO v11 · 79.0% over 1,000 episodes ·
          790-41-169 · +3.8 points over the type-aware baseline
        </p>
      </div>

      <p className="sd-caption">
        Illustrative battle in ShowdownRL&rsquo;s log format. Measured: Maskable PPO
        v11 wins 79.0% of 1,000 simulator episodes against the type-aware opponent
        (seed 42), 78.8% at seed 99.
      </p>
    </div>
  );
}
