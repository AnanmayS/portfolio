/*
  Tape — one window of the live feed, recorded and played back.

  The top track fills left to right in real time as messages land, and twice the
  connection is severed: the ticks stop, and the hole is drawn into the data as a
  dashed span rather than passed over in silence. Then the whole window is read
  back onto the second track a quarter as wide — 2,790x the wall-clock time it
  took to record — gaps and all, and the digest at the end is the same one CI
  checks on every push.

  Numbers: docs/results.md M2 (gaps of 649, 526 and 3,240 missing sequences under
  fault injection) and M3 (89,844 events/sec on a live 3m20s capture, 2,790x
  wall clock; sha256 ee9576...fb7a21 on two replays of the golden fixture).
*/

/* ---- geometry ---- */

const X0 = 80; /* left edge of both tracks; the label column sits before it */
const CAP_W = 616;
const CAP_Y = 50;
const REP_W = 154; /* a quarter of the capture width — that is the whole point */
const REP_Y = 124;

const TICKS = 107;

/* The two severed spans, as fractions of the window, so both tracks agree. */
const GAPS: readonly (readonly [number, number])[] = [
  [0.4, 0.453125],
  [0.7, 0.753125],
];

const round = (v: number) => Math.round(v * 100) / 100;
const inGap = (f: number) => GAPS.some(([a, b]) => f >= a && f < b);

/*
  Message density, held in one array so the replay track redraws the same
  window rather than a second, different-looking one. Deterministic: it must
  render identically on the server and in the browser.
*/
const HEIGHTS = Array.from({ length: TICKS }, (_, i) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const noise = s - Math.floor(s);
  const swell = 0.5 + 0.5 * Math.sin(i / 8.5 + 0.6);
  return Math.round(6 + noise * 11 + swell * 7);
});

function tickPath(span: number, base: number, scale: number) {
  let d = "";
  for (let i = 0; i < TICKS; i++) {
    const f = i / TICKS;
    if (inGap(f)) continue;
    const h = Math.max(2, Math.round(HEIGHTS[i] * scale));
    d += `M${round(X0 + f * span)} ${base}V${base - h}`;
  }
  return d;
}

/* The baseline, drawn only where the feed was actually connected. */
function rulePath(span: number, y: number) {
  const runs: [number, number][] = [
    [0, GAPS[0][0]],
    [GAPS[0][1], GAPS[1][0]],
    [GAPS[1][1], 1],
  ];
  return runs
    .map(([a, b]) => `M${round(X0 + a * span)} ${y}H${round(X0 + b * span)}`)
    .join("");
}

function gapPath(gap: readonly [number, number], span: number, y: number) {
  return `M${round(X0 + gap[0] * span)} ${y}H${round(X0 + gap[1] * span)}`;
}

const GAP_1_MID = round(X0 + ((GAPS[0][0] + GAPS[0][1]) / 2) * CAP_W);

export function TapeArt() {
  return (
    <svg
      className="art art-tape"
      viewBox="0 0 720 160"
      role="img"
      width="100%"
      aria-label="A window of market data captured in real time, with two severed spans marked as gaps — one of 526 missing sequence numbers — then replayed a quarter as wide at 2,790 times real time, byte-identical to the capture."
    >
      {/* ---- capture ---- */}
      <text className="tape-label" x="0" y={CAP_Y}>
        capture
      </text>

      <g className="tape-capture">
        <path className="tape-rule" d={rulePath(CAP_W, CAP_Y)} />
        <path className="tape-tick" d={tickPath(CAP_W, CAP_Y, 1)} />
      </g>

      <path
        className="tape-gap tape-gap-1"
        d={gapPath(GAPS[0], CAP_W, CAP_Y)}
      />
      <path
        className="tape-gap tape-gap-2"
        d={gapPath(GAPS[1], CAP_W, CAP_Y)}
      />

      <text
        className="tape-label tape-note"
        x={GAP_1_MID}
        y={CAP_Y + 16}
        textAnchor="middle"
      >
        gap · 526 missing
      </text>

      {/* ---- read back ---- */}
      <rect className="tape-sweep" x={X0} y={CAP_Y - 0.5} width={CAP_W} height="1" />

      {/* ---- replay ---- */}
      <text className="tape-label" x="0" y={REP_Y}>
        replay
      </text>

      <g className="tape-replay">
        <path className="tape-rule" d={rulePath(REP_W, REP_Y)} />
        <path className="tape-tick tape-tick-fine" d={tickPath(REP_W, REP_Y, 0.45)} />
        <path className="tape-gap tape-gap-fine" d={gapPath(GAPS[0], REP_W, REP_Y)} />
        <path className="tape-gap tape-gap-fine" d={gapPath(GAPS[1], REP_W, REP_Y)} />
      </g>

      <text className="tape-num tape-rate" x={X0 + REP_W + 12} y={REP_Y}>
        2,790×
      </text>

      {/* ---- and the bytes match ---- */}
      <text className="tape-label tape-digest" x="316" y={REP_Y}>
        =
      </text>
      <text className="tape-num tape-digest" x="340" y={REP_Y}>
        ee9576…fb7a21
      </text>
      <text className="tape-label tape-verdict" x="340" y={REP_Y + 16}>
        byte-identical
      </text>
    </svg>
  );
}
