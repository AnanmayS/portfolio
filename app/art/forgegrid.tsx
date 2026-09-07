/*
  ForgeGrid: the same seven-task build, drawn twice against one clock.

  The graph is real: six independent tasks (compile-scripts, compile-shaders,
  process-textures, process-audio, package-level, generate-navigation) all feed
  one bundle-game. So the top lane is that whole graph run end to end on a
  single worker (2.5 s), and the three lanes below are the same seven tasks
  claimed greedily by three workers (1.0 s, 59% less). The second run kills
  worker 2 mid-task; the coordinator requeues its work, another worker picks it
  up, and the build still lands — 1.4 s. The last line is the rebuild, where
  seven of seven tasks come back from cache and nothing runs at all.

  Everything is to scale on one axis: x = 86 + 192 * seconds.

  Class names carry the `fg-` prefix but avoid the ones the ForgeGrid sandbox
  demo already owns (`fg-bar`, `fg-lane`, `fg-axis`, `fg-tick`, …), so the two
  stylesheets can sit in the same page without touching each other.
*/

type Block = { x: number; w: number };

const X0 = 86; // 0 s
const PPS = 192; // pixels per second: 2.5 s spans 480px, ending at x = 566
const H = 12; // bar height
const GAP = 2; // so seven tasks in a row stay seven countable things

const at = (t: number) => X0 + PPS * t;
const span = (d: number) => Math.max(8, PPS * d - GAP);
const block = (t: number, d: number): Block => ({ x: at(t), w: span(d) });

/* Task durations taken off the one-worker run; they sum to 2.5 s. */
const D = {
  scripts: 0.56,
  shaders: 0.7,
  textures: 0.34,
  audio: 0.52,
  level: 0.1,
  nav: 0.14,
  bundle: 0.14,
};

/* One worker: seven tasks nose to tail. */
const BASELINE: Block[] = [
  block(0, D.scripts),
  block(0.56, D.shaders),
  block(1.26, D.textures),
  block(1.6, D.audio),
  block(2.12, D.level),
  block(2.22, D.nav),
  block(2.36, D.bundle),
];

/* Three workers claiming tasks as they free up. Worker 3 frees first, so it
   takes the bundle once the last leaf lands at 0.86 s. Finish: 1.00 s. */
const RUN1: { y: number; b: Block }[] = [
  { y: 56, b: block(0, D.textures) },
  { y: 56, b: block(0.34, D.audio) },
  { y: 80, b: block(0, D.shaders) },
  { y: 80, b: block(0.7, D.level) },
  { y: 104, b: block(0, D.scripts) },
  { y: 104, b: block(0.56, D.nav) },
  { y: 104, b: block(0.86, D.bundle) },
];

/* Same graph, but worker 2 dies 0.40 s into the shaders task. The queue hands
   the shaders back out; worker 3 takes it when it frees at 0.56 s, worker 1
   mops up navigation and the level, then bundles. Finish: 1.40 s. */
const RUN2: { y: number; b: Block }[] = [
  { y: 56, b: block(0, D.textures) },
  { y: 56, b: block(0.34, D.audio) },
  { y: 56, b: block(0.86, D.nav) },
  { y: 56, b: block(1.0, D.level) },
  { y: 56, b: block(1.26, D.bundle) },
];

const KILLED = block(0, 0.4); // what worker 2 got through before it went
const REASSIGNED = block(0.56, D.shaders); // the same task, run again elsewhere

/* The two readouts are odometers: a strip of values behind a one-line window,
   so the clock ticks rather than slides. Rows are ROW apart. */
const ROW = 22;
const CLOCK1 = ["0.0 s", "0.2 s", "0.4 s", "0.6 s", "0.8 s", "1.0 s"];
const CLOCK2 = [
  "0.0 s",
  "0.2 s",
  "0.4 s",
  "0.6 s",
  "0.8 s",
  "1.0 s",
  "1.2 s",
  "1.4 s",
];

export function ForgeGridArt() {
  return (
    <svg
      className="art art-fg"
      viewBox="0 0 720 184"
      role="img"
      aria-label="The same seven-task build measured twice. One worker takes 2.5 seconds; three workers finish it in 1.0 second, 59 percent less time. In the second run worker 2 dies mid-task, its task is reassigned to worker 3, and the build still completes in 1.4 seconds. An identical rebuild returns 7 of 7 tasks from cache in 0.02 seconds."
      fill="none"
    >
      <defs>
        <clipPath id="fg-clip-a">
          <rect x="574" y="46" width="80" height="22" />
        </clipPath>
        <clipPath id="fg-clip-b">
          <rect x="574" y="94" width="80" height="22" />
        </clipPath>
      </defs>

      {/* ---- lane labels. The narrow pair is swapped in below 40rem, where
              the type has to grow back to stay readable. ---- */}
      <text className="fg-label fg-wide" x="64" y="30" textAnchor="end">
        1 worker
      </text>
      <text className="fg-label fg-wide" x="64" y="66" textAnchor="end">
        worker 1
      </text>
      <text className="fg-label fg-wide" x="64" y="90" textAnchor="end">
        worker 2
      </text>
      <text className="fg-label fg-wide" x="64" y="114" textAnchor="end">
        worker 3
      </text>
      <text className="fg-label fg-narrow" x="64" y="30" textAnchor="end">
        1 wkr
      </text>
      <text className="fg-label fg-narrow" x="64" y="66" textAnchor="end">
        wkr 1
      </text>
      <text className="fg-label fg-narrow" x="64" y="90" textAnchor="end">
        wkr 2
      </text>
      <text className="fg-label fg-narrow" x="64" y="114" textAnchor="end">
        wkr 3
      </text>
      <text className="fg-label fg-x" x="68" y="90">
        ×
      </text>

      {/* ---- one worker: the whole graph, nose to tail ---- */}
      {BASELINE.map((b, i) => (
        <rect
          key={`b${i}`}
          className={`fg-blk fg-base fg-b${i + 1}`}
          x={b.x}
          y={20}
          width={b.w}
          height={H}
          rx="2"
        />
      ))}

      {/* ---- run titles ---- */}
      <text className="fg-label fg-title1" x="86" y="47">
        3 workers
      </text>
      <text className="fg-label fg-title2" x="86" y="47">
        worker 2 dies
      </text>

      {/* ---- run 1: six leaves in parallel, then the bundle ---- */}
      {RUN1.map((r, i) => (
        <rect
          key={`p${i}`}
          className={`fg-blk fg-p${i + 1}`}
          x={r.b.x}
          y={r.y}
          width={r.b.w}
          height={H}
          rx="2"
        />
      ))}

      {/* ---- run 2: worker 1 picks up the slack ---- */}
      {RUN2.map((r, i) => (
        <rect
          key={`q${i}`}
          className={`fg-blk fg-q${i + 1}`}
          x={r.b.x}
          y={r.y}
          width={r.b.w}
          height={H}
          rx="2"
        />
      ))}

      {/* worker 2's task: solid while it runs, a dashed stub once it dies */}
      <rect
        className="fg-blk fg-q6"
        x={KILLED.x}
        y={80}
        width={KILLED.w}
        height={H}
        rx="2"
      />
      <rect
        className="fg-dead"
        x={KILLED.x}
        y={80}
        width={KILLED.w}
        height={H}
        rx="2"
      />

      {/* requeued, then run again from the top on worker 3 */}
      <rect
        className="fg-token"
        x={REASSIGNED.x}
        y={104}
        width="20"
        height={H}
        rx="2"
      />
      <rect
        className="fg-blk fg-q7"
        x={at(0)}
        y={104}
        width={span(D.scripts)}
        height={H}
        rx="2"
      />
      <rect
        className="fg-blk fg-q8"
        x={REASSIGNED.x}
        y={104}
        width={REASSIGNED.w}
        height={H}
        rx="2"
      />

      {/* ---- finish marks ---- */}
      <line className="fg-mark1" x1={at(1)} y1="16" x2={at(1)} y2="138" />
      <line className="fg-mark2" x1={at(1.4)} y1="16" x2={at(1.4)} y2="138" />

      {/* ---- axis ---- */}
      <line className="fg-rule" x1={X0} y1="134" x2={at(2.5)} y2="134" />
      {[0, 0.5, 1, 1.5, 2, 2.5].map((t) => (
        <line
          key={t}
          className="fg-rule"
          x1={at(t)}
          y1="134"
          x2={at(t)}
          y2="139"
        />
      ))}
      <text className="fg-label" x={X0} y="155">
        0 s
      </text>
      <text className="fg-label" x={at(1)} y="155" textAnchor="middle">
        1.0
      </text>
      <text className="fg-label fg-in-b" x={at(1.4)} y="155" textAnchor="middle">
        1.4
      </text>
      <text className="fg-label" x={at(2.5)} y="155" textAnchor="end">
        2.5 s
      </text>

      {/* ---- readout ---- */}
      <text className="fg-label fg-base-out" x="580" y="30">
        2.5 s
      </text>

      <g className="fg-run1-out" clipPath="url(#fg-clip-a)">
        <g className="fg-clock1">
          {CLOCK1.map((v, i) => (
            <text key={v} className="fg-num" x="580" y={62 + i * ROW}>
              {v}
            </text>
          ))}
        </g>
      </g>
      <text className="fg-label fg-in-a" x="580" y="82">
        59% less
      </text>

      <g className="fg-run2-out" clipPath="url(#fg-clip-b)">
        <g className="fg-clock2">
          {CLOCK2.map((v, i) => (
            <text key={v} className="fg-num" x="580" y={110 + i * ROW}>
              {v}
            </text>
          ))}
        </g>
      </g>
      <text className="fg-label fg-in-b" x="580" y="130">
        reassigned
      </text>
      <text className="fg-label fg-in-b" x="580" y="146">
        completed
      </text>

      {/* ---- the rebuild: seven cache hits, no work ---- */}
      <g className="fg-cache">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            className="fg-hit"
            x={X0 + i * 14}
            y="165"
            width="10"
            height="10"
            rx="2"
          />
        ))}
        <text className="fg-label" x="192" y="174">
          rebuild · 7 of 7 from cache · 0.02 s
        </text>
      </g>
    </svg>
  );
}
