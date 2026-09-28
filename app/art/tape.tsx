/*
  Tape, as a DVR for the market.

  A price line draws left to right while REC blinks: that is the live feed
  being recorded. Partway, the connection drops; instead of quietly joining
  the line up, the hole is shaded and labelled with how many trades are
  missing. Then the whole window plays back twice, small and fast, and the
  two playbacks are the same bytes, so a backtest gives the same answer every
  run. Four plain numbers underneath.

  One 9 s loop, driven from app/art/tape.css. The un-animated state is the
  finished frame: recording done, both playbacks shown.

  Numbers: docs/results.md (526 missing sequences in one severed span, 2,790x
  wall clock on replay, 5.2x columnar compression, 49.8k msg/s sustained, 3 of
  3 injected gaps caught). "About 31 seconds" is 24 h / 2,790.
*/

const X0 = 40;
const X1 = 700;
const POINTS = 100;
/* The connection is down between these two samples. */
const GAP_FROM = 44;
const GAP_TO = 51;

/* A deterministic price walk: the same line on every render. */
const PRICES = (() => {
  const ys: number[] = [];
  let y = 78;
  for (let i = 0; i < POINTS; i++) {
    const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const noise = s - Math.floor(s);
    y += (noise - 0.5) * 6.4 + (78 - y) * 0.06;
    y = Math.max(46, Math.min(106, y));
    ys.push(Math.round(y * 10) / 10);
  }
  return ys;
})();

const r = (v: number) => Math.round(v * 10) / 10;
const x = (i: number) => r(X0 + (i * (X1 - X0)) / (POINTS - 1));

function line(from: number, to: number, px: (i: number) => number, py: (i: number) => number) {
  const pts: string[] = [];
  for (let i = from; i <= to; i++) pts.push(`${px(i)} ${py(i)}`);
  return `M${pts.join("L")}`;
}

const LIVE_BEFORE = line(0, GAP_FROM, x, (i) => PRICES[i]);
const LIVE_AFTER = line(GAP_TO, POINTS - 1, x, (i) => PRICES[i]);
const GAP_X0 = x(GAP_FROM) + 3;
const GAP_X1 = x(GAP_TO) - 3;
const GAP_MID = r((x(GAP_FROM) + x(GAP_TO)) / 2);
/* Every third trade as a dot, except inside the gap. */
const DOTS = PRICES.map((y, i) => ({ i, y })).filter(({ i }) => i % 3 === 0 && (i <= GAP_FROM || i >= GAP_TO));

/* The same window, drawn small for a playback row starting at `top`. */
function Playback({ top }: { top: number }) {
  const px = (i: number) => r(96 + (i * 160) / (POINTS - 1));
  const py = (i: number) => r(top + ((PRICES[i] - 44) / 64) * 30);
  return (
    <>
      <path
        className="art-line"
        d={line(0, GAP_FROM, px, py) + line(GAP_TO, POINTS - 1, px, py)}
        strokeWidth="1.4"
      />
      <rect className="tp-gap-fill" x={px(GAP_FROM)} y={top} width={r(px(GAP_TO) - px(GAP_FROM))} height="32" />
    </>
  );
}

const FACTS = [
  { x: 0, big: "5×", small: "smaller than the raw feed" },
  { x: 180, big: "2,790×", small: "faster than real time" },
  { x: 360, big: "3 of 3", small: "dropped connections caught" },
  { x: 540, big: "49,800/s", small: "messages, keeping up at full load" },
];

export function TapeArt() {
  return (
    <svg
      className="art art-tape"
      viewBox="0 0 720 314"
      role="img"
      aria-label="Tape works like a DVR for the market. It records every live Bitcoin trade from the exchange as it happens. When the connection drops, it marks the hole in the recording, here 526 missing trades, instead of hiding it. It can then play a whole day back in about 31 seconds, 2,790 times faster than real time, and every playback is exactly the same, byte for byte, so testing a trading idea gives the same answer every run. It stores data 5 times smaller than the raw feed, caught 3 of 3 dropped connections, and keeps up with 49,800 messages a second."
      fill="none"
    >
      {/* ---- recording ---- */}
      <rect className="tp-rec-pill" x="0" y="6" width="50" height="20" rx="10" />
      <circle className="tp-rec" cx="13" cy="16" r="4" />
      <text className="art-small art-bad art-bold" x="22" y="20">
        REC
      </text>
      <text className="art-label art-soft" x="62" y="20">
        Recording live Bitcoin trades from the exchange, as they happen
      </text>

      <line className="art-hair" x1={X0} y1="112" x2={X1} y2="112" />
      <path className="art-line" d={LIVE_BEFORE} strokeWidth="1.6" />
      <path className="art-line" d={LIVE_AFTER} strokeWidth="1.6" />
      {DOTS.map(({ i, y }) => (
        <circle key={i} className="tp-dot" cx={x(i)} cy={y} r="1.8" />
      ))}
      <rect className="tp-gap-fill" x={GAP_X0} y="38" width={r(GAP_X1 - GAP_X0)} height="74" />
      <path className="tp-gap-edge" d={`M${GAP_X0} 38V112M${GAP_X1} 38V112`} />
      <text className="art-small art-bad" x={GAP_MID} y="52" textAnchor="middle">
        ?
      </text>
      {/* The wipe that reveals the line as it is "recorded", and its playhead. */}
      <rect className="tp-cover tp-live" x={X0} y="34" width="668" height="80" />
      <line className="tp-head tp-live" x1={X0} y1="34" x2={X0} y2="112" />
      <text className="art-label art-bad tp-gaplbl" x={GAP_MID} y="130" textAnchor="middle">
        connection dropped · 526 trades missing, marked in the recording, never hidden
      </text>

      {/* ---- playing it back, twice ---- */}
      <text className="art-label art-soft" x="0" y="168">
        ▶ play back
      </text>
      <text className="art-label art-soft" x="0" y="218">
        ▶ again
      </text>
      <Playback top={146} />
      <rect className="tp-cover tp-r1" x="94" y="142" width="166" height="40" />
      <Playback top={196} />
      <rect className="tp-cover tp-r2" x="94" y="192" width="166" height="40" />
      <text className="art-label art-bold tp-t1" x="276" y="162">
        A whole day replays in about 31 seconds
      </text>
      <text className="art-small tp-t1" x="276" y="178">
        2,790× faster than it happened, gaps and all
      </text>
      <text className="art-label art-ok art-bold tp-t2" x="276" y="212">
        ✓ Exactly the same, byte for byte, every time
      </text>
      <text className="art-small tp-t2" x="276" y="228">
        so testing a trading idea on last Tuesday gives the same answer every run
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
