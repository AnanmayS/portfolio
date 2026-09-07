"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/*
  ForgeGrid's scheduler, run in the browser.

  The graph is the real one from server/task-definitions.js: six independent
  tasks and a `bundle-game` that depends on all six. The scheduler is the real
  one from server/coordinator.js in miniature — a FIFO queue of ready tasks,
  each claimed by the first worker that frees up, and a dead worker's running
  task pushed back onto the queue for someone else to pick up.

  Durations are set so the simulation reproduces the measured run rather than
  illustrating it: one worker finishes in 2500 ms, three in 1025 ms, which is
  the 59% and 2.44x in the README. The floor is the critical path — the longest
  leaf (compile-scripts, 750 ms) plus the bundle (275 ms) — so the total stops
  improving at three workers no matter how many more are added.
*/

type Task = { id: string; short: string; ms: number; deps: string[] };

const LEAVES: Task[] = [
  { id: "compile-scripts", short: "scripts", ms: 750, deps: [] },
  { id: "compile-shaders", short: "shaders", ms: 350, deps: [] },
  { id: "process-textures", short: "textures", ms: 250, deps: [] },
  { id: "process-audio", short: "audio", ms: 250, deps: [] },
  { id: "package-level", short: "level", ms: 400, deps: [] },
  { id: "generate-navigation", short: "nav", ms: 225, deps: [] },
];

const TASKS: Task[] = [
  ...LEAVES,
  {
    id: "bundle-game",
    short: "bundle",
    ms: 275,
    deps: LEAVES.map((task) => task.id),
  },
];

/* One cache lookup. Real hits report a zero duration; this is the read. */
const CACHE_MS = 6;

const SOLO = TASKS.reduce((sum, task) => sum + task.ms, 0); /* 2500 */
const CRITICAL =
  LEAVES.reduce((longest, task) => Math.max(longest, task.ms), 0) + 275; /* 1025 */

/* Where the recovery demo pulls the plug: mid-build, on a worker still busy. */
const KILL_AT_FRACTION = 0.585;

type Bar = {
  task: Task;
  lane: number;
  slot: number;
  start: number;
  end: number;
  killed: boolean;
};

type Sim = {
  bars: Bar[];
  total: number;
  lanes: number;
  cached: boolean;
  victim: number | null;
  killAt: number;
  reassigned: number;
};

/*
  List scheduling. Each ready task goes to the worker that can start it
  soonest; ties go to the lowest-numbered worker, which is what a FIFO claim
  queue does. A victim worker is alive only up to killAt: anything it starts
  that would run past that moment is cut short and returned to the queue.
*/
function schedule(
  lanes: number,
  duration: (task: Task) => number,
  victim: number | null,
  killAt: number,
) {
  const bars: Bar[] = [];
  const done = new Map<string, number>();
  const freeAt = new Array<number>(lanes).fill(0);
  const slots = new Array<number>(lanes).fill(0);
  const pending = TASKS.slice();

  for (let guard = 0; pending.length > 0 && guard < 64; guard += 1) {
    let index = -1;
    let ready = 0;
    for (let i = 0; i < pending.length; i += 1) {
      const deps = pending[i].deps;
      if (deps.every((dep) => done.has(dep))) {
        index = i;
        ready = deps.reduce((at, dep) => Math.max(at, done.get(dep) ?? 0), 0);
        break;
      }
    }
    if (index < 0) break;

    const task = pending[index];
    let lane = -1;
    let start = Number.POSITIVE_INFINITY;
    for (let worker = 0; worker < lanes; worker += 1) {
      const at = Math.max(freeAt[worker], ready);
      if (victim !== null && worker === victim && at >= killAt) continue;
      if (at < start) {
        start = at;
        lane = worker;
      }
    }
    if (lane < 0) break;

    const end = start + duration(task);
    if (victim !== null && lane === victim && end > killAt) {
      /* The worker dies holding it; the work done so far is lost. */
      bars.push({ task, lane, slot: slots[lane], start, end: killAt, killed: true });
      slots[lane] += 1;
      freeAt[lane] = killAt;
      continue;
    }

    bars.push({ task, lane, slot: slots[lane], start, end, killed: false });
    slots[lane] += 1;
    done.set(task.id, end);
    freeAt[lane] = end;
    pending.splice(index, 1);
  }

  const total = bars.reduce(
    (last, bar) => (bar.killed ? last : Math.max(last, bar.end)),
    0,
  );
  return { bars, total };
}

/* The busiest worker: the one holding the most unfinished work at that moment. */
function busiest(bars: Bar[], lanes: number, killAt: number) {
  let victim: number | null = null;
  let most = -1;
  for (let lane = 0; lane < lanes; lane += 1) {
    const mine = bars.filter((bar) => bar.lane === lane);
    if (!mine.some((bar) => bar.start <= killAt && bar.end > killAt)) continue;
    const left = mine.reduce(
      (sum, bar) => sum + Math.max(0, bar.end - Math.max(bar.start, killAt)),
      0,
    );
    if (left > most) {
      most = left;
      victim = lane;
    }
  }
  return victim;
}

function simulate(lanes: number, cached: boolean, kill: boolean): Sim {
  const duration = (task: Task) => (cached ? CACHE_MS : task.ms);
  const base = schedule(lanes, duration, null, Number.POSITIVE_INFINITY);

  if (kill && !cached && lanes > 1) {
    const killAt = Math.round(base.total * KILL_AT_FRACTION);
    const victim = busiest(base.bars, lanes, killAt);
    if (victim !== null) {
      const run = schedule(lanes, duration, victim, killAt);
      const reassigned =
        run.bars.filter((bar) => bar.killed).length +
        base.bars.filter((bar) => bar.lane === victim && bar.start >= killAt)
          .length;
      return { ...run, lanes, cached, victim, killAt, reassigned };
    }
  }

  return { ...base, lanes, cached, victim: null, killAt: 0, reassigned: 0 };
}

/* ---------- geometry ---------- */

const VIEW_W = 720;
const PLOT_X = 82;
const PLOT_W = 618;
const DOMAIN = 2500; /* the one-worker run fills the axis */
const PX = PLOT_W / DOMAIN;
const BASE_Y = 6;
const BASE_H = 20;
const SPLIT_Y = 36;
const LANE_Y = 46;
const LANE_H = 22;
const LANE_PITCH = 30;
const CACHE_PITCH = 66;
const CACHE_W = 60;

const xOf = (ms: number) => PLOT_X + Math.min(ms, DOMAIN) * PX;
const laneY = (lane: number) => LANE_Y + lane * LANE_PITCH;

function barX(bar: Bar, cached: boolean) {
  return cached ? PLOT_X + bar.slot * CACHE_PITCH : xOf(bar.start);
}

function barW(bar: Bar, cached: boolean, grown: number) {
  const span = Math.max(bar.end - bar.start, 1);
  return cached ? (CACHE_W * grown) / span : grown * PX;
}

const seconds = (ms: number) => (ms / 1000).toFixed(2);
const percentLess = (ms: number) => Math.round((1 - ms / SOLO) * 100);

/* Only label a bar when the word actually fits inside it. */
function fits(label: string, width: number) {
  return width >= label.length * 6.6 + 8;
}

export function ForgeGridSandbox() {
  const [lanes, setLanes] = useState(3);
  const [cached, setCached] = useState(false);
  const [dead, setDead] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [runId, setRunId] = useState(0);

  const canKill = lanes > 1 && !cached;
  const sim = useMemo(
    () => simulate(lanes, cached, dead && canKill),
    [lanes, cached, dead, canKill],
  );

  const rects = useRef<(SVGRectElement | null)[]>([]);
  const labels = useRef<(SVGTextElement | null)[]>([]);
  const clock = useRef<HTMLSpanElement>(null);
  const still = useRef(false);

  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    still.current = query.matches;
    const onChange = () => {
      still.current = query.matches;
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* One paint of the whole chart at simulated time `at`, written to the DOM. */
  const paint = useCallback(
    (at: number) => {
      sim.bars.forEach((bar, i) => {
        const span = bar.end - bar.start;
        const grown = Math.min(Math.max(at - bar.start, 0), span);
        const rect = rects.current[i];
        /* width 0 stops the rect rendering, so a task that has not
           started yet is absent rather than a hairline */
        if (rect) {
          rect.setAttribute(
            "width",
            String(Math.max(0, barW(bar, sim.cached, grown))),
          );
        }
        const label = labels.current[i];
        if (label) label.style.opacity = grown >= span ? "1" : "0";
      });
      if (clock.current) {
        clock.current.textContent = `${seconds(Math.min(at, sim.total))} s`;
      }
    },
    [sim],
  );

  /* Whenever nothing is running, the chart shows the finished schedule. */
  useEffect(() => {
    if (phase === "running") return;
    paint(sim.total);
  }, [phase, sim, paint]);

  useEffect(() => {
    if (phase !== "running") return;
    if (still.current) {
      paint(sim.total);
      setPhase("done");
      return;
    }
    /* About 1.5 s for the three-worker build, scaled by the wall clock. */
    const span = Math.min(2400, Math.max(420, (1500 * sim.total) / CRITICAL));
    const started = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const done = Math.min(1, (now - started) / span);
      paint(done * sim.total);
      if (done < 1) frame = requestAnimationFrame(step);
      else setPhase("done");
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, sim, runId, paint]);

  const start = (next: { cached: boolean; dead: boolean }) => {
    setCached(next.cached);
    setDead(next.dead);
    setRunId((n) => n + 1);
    setPhase("running");
  };

  const onLanes = (value: number) => {
    setLanes(value);
    if (phase === "running") setPhase("done");
  };

  const axisY = LANE_Y + lanes * LANE_PITCH - (LANE_PITCH - LANE_H) + 12;
  const height = axisY + 38;
  const ticks = [0, 500, 1000, 1500, 2000, 2500];
  const workerWord = lanes === 1 ? "worker" : "workers";

  const summary = sim.cached
    ? `Rebuild with a warm cache: 7 of 7 tasks reused, ${seconds(sim.total)} seconds on ${lanes} ${workerWord}.`
    : `Build schedule on ${lanes} ${workerWord}: seven tasks finish in ${seconds(sim.total)} seconds, against ${seconds(SOLO)} seconds on one worker. The critical path floor is ${seconds(CRITICAL)} seconds.` +
      (sim.victim === null
        ? ""
        : ` Worker ${sim.victim + 1} was killed at ${seconds(sim.killAt)} seconds and ${sim.reassigned} tasks were reassigned.`);

  return (
    <div className="fg">
      <div className="fg-controls">
        <label className="fg-field" htmlFor="fg-workers">
          <span className="fg-field-name">workers</span>
          <input
            id="fg-workers"
            className="fg-range"
            type="range"
            min={1}
            max={8}
            step={1}
            value={lanes}
            onChange={(event) => onLanes(Number(event.target.value))}
          />
          <output className="fg-field-value" htmlFor="fg-workers">
            {lanes}
          </output>
        </label>

        <div className="fg-buttons">
          <button
            type="button"
            className="fg-btn fg-btn-primary"
            onClick={() => start({ cached: false, dead: false })}
          >
            run build
          </button>
          <button
            type="button"
            className="fg-btn"
            onClick={() => start({ cached: false, dead: true })}
            disabled={!canKill}
            aria-label="kill the busiest worker mid-build"
          >
            kill a worker
          </button>
          <button
            type="button"
            className="fg-btn"
            onClick={() => start({ cached: true, dead: false })}
            aria-pressed={cached}
          >
            rebuild (cached)
          </button>
        </div>
      </div>

      <div className="fg-head">
        <span className="fg-what">
          {sim.cached ? "warm rebuild" : "cold build"} · {lanes} {workerWord}
        </span>
        <span className="fg-wall" ref={clock}>
          {seconds(sim.total)} s
        </span>
      </div>

      <div className="fg-scroll">
        <svg
          className="fg-chart"
          viewBox={`0 0 ${VIEW_W} ${height}`}
          role="img"
          aria-label={summary}
        >
          {/* the un-improved side of the comparison */}
          <text className="fg-lane" x={PLOT_X - 10} y={BASE_Y + 14} textAnchor="end">
            baseline
          </text>
          <rect
            className="fg-baseline"
            x={PLOT_X}
            y={BASE_Y}
            width={PLOT_W}
            height={BASE_H}
            rx={2}
          />
          <text className="fg-baseline-text" x={PLOT_X + 8} y={BASE_Y + 14}>
            one worker · seven tasks in order · 2.50 s
          </text>
          <line
            x1={0}
            y1={SPLIT_Y}
            x2={VIEW_W}
            y2={SPLIT_Y}
            className="fg-split"
          />

          {/* lanes */}
          {Array.from({ length: lanes }, (_, lane) => {
            const y = laneY(lane);
            const isDead = sim.victim === lane;
            return (
              <g key={`lane-${lane}`}>
                <text
                  className={`fg-lane${isDead ? " is-dead" : ""}`}
                  x={PLOT_X - 10}
                  y={y + 15}
                  textAnchor="end"
                >
                  {isDead ? `worker ${lane + 1} ✕` : `worker ${lane + 1}`}
                </text>
                <line
                  className="fg-track"
                  x1={PLOT_X}
                  y1={y + LANE_H / 2}
                  x2={isDead ? xOf(sim.killAt) : PLOT_X + PLOT_W}
                  y2={y + LANE_H / 2}
                />
                {isDead ? (
                  <line
                    className="fg-track is-dead"
                    x1={xOf(sim.killAt)}
                    y1={y + LANE_H / 2}
                    x2={PLOT_X + PLOT_W}
                    y2={y + LANE_H / 2}
                  />
                ) : null}
              </g>
            );
          })}

          {/* the floor: no number of workers beats the longest chain */}
          {sim.cached ? null : (
            <>
              <line
                className="fg-critical"
                x1={xOf(CRITICAL)}
                y1={LANE_Y - 6}
                x2={xOf(CRITICAL)}
                y2={axisY}
              />
              <line
                className="fg-finish"
                x1={xOf(sim.total)}
                y1={LANE_Y - 6}
                x2={xOf(sim.total)}
                y2={axisY}
              />
            </>
          )}

          {/* one bar per task */}
          {sim.bars.map((bar, i) => {
            const y = laneY(bar.lane);
            const x = barX(bar, sim.cached);
            const w = barW(bar, sim.cached, bar.end - bar.start);
            const label = sim.cached ? "cache" : bar.task.short;
            return (
              <g key={`bar-${i}`}>
                <rect
                  ref={(el) => {
                    rects.current[i] = el;
                  }}
                  className={
                    sim.cached
                      ? "fg-bar is-cache"
                      : bar.killed
                        ? "fg-bar is-dead"
                        : bar.task.deps.length > 0
                          ? "fg-bar is-final"
                          : "fg-bar"
                  }
                  x={x}
                  y={y}
                  width={w}
                  height={LANE_H}
                  rx={2}
                />
                {fits(label, w) ? (
                  <text
                    ref={(el) => {
                      labels.current[i] = el;
                    }}
                    className={`fg-bar-text${bar.killed ? " is-dead" : ""}${sim.cached ? " is-cache" : ""}`}
                    x={x + w / 2}
                    y={y + 15}
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* time axis */}
          <line
            className="fg-axis"
            x1={PLOT_X}
            y1={axisY}
            x2={PLOT_X + PLOT_W}
            y2={axisY}
          />
          {ticks.map((tick) => (
            <g key={`tick-${tick}`}>
              <line
                className="fg-axis"
                x1={xOf(tick)}
                y1={axisY}
                x2={xOf(tick)}
                y2={axisY + 4}
              />
              <text
                className="fg-tick"
                x={xOf(tick)}
                y={axisY + 16}
                textAnchor={tick === 2500 ? "end" : "middle"}
              >
                {tick === 0 ? "0 s" : `${(tick / 1000).toFixed(1)} s`}
              </text>
            </g>
          ))}
          {sim.cached ? (
            <text className="fg-tick" x={PLOT_X} y={axisY + 32}>
              no work ran · cache hits are drawn at a fixed width, each lookup under 10 ms
            </text>
          ) : (
            <text
              className="fg-tick"
              x={xOf(CRITICAL)}
              y={axisY + 32}
              textAnchor="middle"
            >
              critical path {seconds(CRITICAL)} s
            </text>
          )}
        </svg>
      </div>

      <p className="fg-read" role="status">
        <span className="fg-read-slow">1 worker {seconds(SOLO)} s</span>
        <span className="fg-dot"> · </span>
        {lanes === 1 && !sim.cached ? (
          <span>the baseline · add a worker to split the six leaf tasks</span>
        ) : (
          <>
            <span>
              {lanes} {workerWord}
              {sim.cached ? " cached" : ""} {seconds(sim.total)} s
            </span>
            <span className="fg-dot"> · </span>
            <span className="fg-read-win">{percentLess(sim.total)}% less</span>
            {sim.cached ? null : (
              <>
                <span className="fg-dot"> · </span>
                <span>{(SOLO / Math.max(sim.total, 1)).toFixed(2)}× faster</span>
              </>
            )}
          </>
        )}
      </p>

      {sim.victim !== null ? (
        <p className="fg-note is-dead">
          worker {sim.victim + 1} died at {seconds(sim.killAt)} s ·{" "}
          {sim.reassigned} tasks reassigned · build completed
        </p>
      ) : null}

      {sim.cached ? (
        <p className="fg-note">
          7 of 7 tasks reused from cache · nothing was recompiled
        </p>
      ) : null}

      <p className="fg-caption">
        Same seven-task build the real ForgeGrid runs. Measured: 2.5 s → 1.0 s
        on three workers, 59% less.
      </p>
    </div>
  );
}
