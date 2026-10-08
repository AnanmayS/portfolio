/*
  Pit Wall, told as one what-if anyone can follow.

  Left: the 2025 Hungarian Grand Prix replayed lap by lap, the four leaders
  as position lines, until lap 45. There the real Piastri, leading, stops
  for a second time and comes home second to Norris (the dashed lines). The
  what-if: he stays out. From that lap 10,000 possible finishes fan out in
  green; most of them end first. Right: where he finishes across those
  10,000 runs, as bars. Underneath, four plain numbers.

  The positions are the real race, read from the project's ClickHouse laps
  table. The what-if is a real run of the simulator:

    ScenarioSpec(season=2025, round=14, branch_lap=45,
                 changes=[Change(type="skip_stop", driver="PIA", stop=1)])

  on 2026-10-08: 10,000 runs in 567 ms; Piastri P1 84.7 %, P2 1.8 %,
  P3 4.0 %, P4 3.8 %, P5 1.5 %, further back 0.5 % (the seed follows the
  scenario id, so a rerun moves these by a few tenths). The bottom row is
  RESULTS.md: 32,359,729 telemetry rows for the 2025 season, a 10,000-run
  scenario in 0.57–1.05 s, a cached scenario answered in 9 ms over HTTP, and
  the backtest's 62 % winner hit rate from the grid across all 24 races.

  One 10 s loop, driven from app/art/pitwall.css. The un-animated state is
  the finished frame: the race replayed, the futures drawn, the bars full.
*/

/* Position after each lap, laps 1–70, from the laps table. */
const REAL = {
  PIA: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,5,4,4,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,1,1,1,1,1,1,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  NOR: [5,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,1,1,1,1,1,1,1,1,1,1,1,2,4,4,4,4,4,4,4,4,4,3,3,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  LEC: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,2,4,4,4,3,3,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4],
  RUS: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,5,5,5,5,5,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,2,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3],
} as const;

const LAPS = 70;
/* Piastri's second stop; the what-if branches here. */
const BRANCH = 45;

const X0 = 40;
const X1 = 432;
const Y0 = 46;
const ROW = 22;

const r = (v: number) => Math.round(v * 10) / 10;
const x = (lap: number) => r(X0 + ((lap - 1) * (X1 - X0)) / (LAPS - 1));
const y = (pos: number) => Y0 + (pos - 1) * ROW;

function trace(positions: readonly number[], from: number, to: number) {
  const pts: string[] = [];
  for (let lap = from; lap <= to; lap++) pts.push(`${x(lap)} ${y(positions[lap - 1])}`);
  return `M${pts.join("L")}`;
}

const BX = x(BRANCH);
const BY = y(REAL.PIA[BRANCH - 1]);

/*
  Fourteen of the 10,000 futures, in the measured proportion: eleven end
  first, one each second, third and fourth. The curve and the jitter are
  only so the bundle reads as many lines rather than one.
*/
const FUTURES = (() => {
  const ends = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4];
  return ends.map((pos, i) => {
    const wobble = ((i * 7) % 5) - 2;
    const ey = y(pos) + (pos === 1 ? wobble * 1.6 : wobble * 0.6);
    const c1 = r(BX + 36 + ((i * 11) % 7) * 4);
    const c2 = r(X1 - 44 - ((i * 5) % 7) * 4);
    return { d: `M${BX} ${BY}C${c1} ${r(BY + wobble * 3)},${c2} ${r(ey)},${X1} ${r(ey)}`, group: 1 + (i % 4) };
  });
})();

const OUTCOMES = [
  { place: "1st", pct: 84.7, label: "85%", mine: true },
  { place: "2nd", pct: 1.8, label: "2%", mine: false },
  { place: "3rd", pct: 4.0, label: "4%", mine: false },
  { place: "4th", pct: 3.8, label: "4%", mine: false },
  { place: "5th", pct: 1.5, label: "1.5%", mine: false },
  { place: "6th+", pct: 0.5, label: "<1%", mine: false },
];
const BAR_X = 506;
const BAR_W = 150;
const rowY = (i: number) => 58 + i * 18;

const FACTS = [
  { x: 0, big: "32 M", small: "readings from one F1 season" },
  { x: 180, big: "10,000", small: "finishes simulated in a second" },
  { x: 360, big: "9 ms", small: "to answer a repeat question" },
  { x: 540, big: "62%", small: "of 2025 winners called pre-race" },
];

export function PitwallArt() {
  return (
    <svg
      className="art art-pw"
      viewBox="0 0 720 314"
      role="img"
      aria-label="Pit Wall replays a real Formula 1 race and asks what if. The 2025 Hungarian Grand Prix plays lap by lap: Piastri leads at lap 45, stops for new tyres a second time, and finishes second behind Norris. Change that one decision so he stays out, and the simulator plays the rest of the race 10,000 times from that lap in about half a second. He wins 85 of every 100 of them. It holds 32 million telemetry readings from one season, simulates 10,000 finishes in about a second, answers a question it has seen before in 9 milliseconds, and in a backtest called 62 percent of 2025 race winners from the starting grid."
      fill="none"
    >
      <defs>
        <clipPath id="pw-chart">
          <rect x={X0} y="34" width={X1 - X0 + 8} height="138" />
        </clipPath>
      </defs>

      {/* ---- the real race, replayed ---- */}
      <text className="art-label art-soft" x="0" y="20">
        Hungary 2025, replayed lap by lap
      </text>
      <g className="pw-legend">
        <line className="pw-trace-pia" x1="230" y1="16" x2="246" y2="16" />
        <text className="art-small" x="251" y="20">
          Piastri
        </text>
        <line className="pw-trace-nor" x1="300" y1="16" x2="316" y2="16" />
        <text className="art-small" x="321" y="20">
          Norris
        </text>
        <line className="pw-trace-dim" x1="364" y1="16" x2="380" y2="16" />
        <text className="art-small" x="385" y="20">
          others
        </text>
      </g>

      {["1st", "2nd", "3rd", "4th", "5th", "6th"].map((label, i) => (
        <text key={label} className="art-tiny" x={X0 - 8} y={y(i + 1) + 3.5} textAnchor="end">
          {label}
        </text>
      ))}
      <line className="art-hair" x1={X0} y1="166" x2={X1} y2="166" />
      <text className="art-tiny" x={x(1)} y="180">
        lap 1
      </text>
      <text className="art-tiny" x={BX} y="180" textAnchor="middle">
        lap 45
      </text>
      <text className="art-tiny" x={x(LAPS)} y="180" textAnchor="end">
        lap 70
      </text>

      <path className="pw-trace-dim" d={trace(REAL.LEC, 1, BRANCH)} />
      <path className="pw-trace-dim" d={trace(REAL.RUS, 1, BRANCH)} />
      <path className="pw-trace-nor" d={trace(REAL.NOR, 1, BRANCH)} />
      <path className="pw-trace-pia" d={trace(REAL.PIA, 1, BRANCH)} />

      {/* The wipe that replays the race, and the lap it is on. */}
      <g clipPath="url(#pw-chart)">
        <rect className="pw-cover pw-live" x={X0} y="34" width={X1 - X0 + 8} height="138" />
        <line className="pw-head pw-live" x1={X0} y1="34" x2={X0} y2="170" />
      </g>

      {/* ---- what really happened after lap 45 ---- */}
      <g className="pw-real">
        <path className="pw-trace-dim pw-dashed" d={trace(REAL.LEC, BRANCH, LAPS)} />
        <path className="pw-trace-dim pw-dashed" d={trace(REAL.RUS, BRANCH, LAPS)} />
        <path className="pw-trace-nor pw-dashed" d={trace(REAL.NOR, BRANCH, LAPS)} />
        <path className="pw-trace-pia pw-dashed" d={trace(REAL.PIA, BRANCH, LAPS)} />
        <circle className="pw-branch" cx={BX} cy={BY} r="3.5" />
      </g>
      <text className="art-label art-soft pw-cap pw-cap-real" x={X0} y="200">
        Lap 45: leading, Piastri pits a second time and finishes 2nd.
      </text>

      {/* ---- the what-if: 10,000 futures ---- */}
      <text className="art-label art-ok art-bold pw-cap pw-cap-ask" x={X0} y="200">
        What if he stays out?
      </text>
      {FUTURES.map((f, i) => (
        <path key={i} className={`pw-future pw-f${f.group}`} d={f.d} />
      ))}
      <text className="art-label art-soft pw-cap pw-cap-ran" x={X0} y="200">
        10,000 possible finishes from lap 45, simulated in 0.57 s
      </text>

      {/* ---- where he finishes ---- */}
      <line className="art-hair" x1="470" y1="12" x2="470" y2="200" />
      <text className="art-small pw-head-txt" x="486" y="24">
        WHERE HE FINISHES, STAYING OUT
      </text>
      <text className="art-tiny" x="486" y="38">
        out of 10,000 simulated finishes
      </text>
      {OUTCOMES.map((o, i) => (
        <g key={o.place}>
          <text className={`art-small ${o.mine ? "art-strong art-bold" : "art-soft"}`} x="486" y={rowY(i) + 4}>
            {o.place}
          </text>
          <rect className="art-track" x={BAR_X + 10} y={rowY(i) - 4} width={BAR_W} height="8" rx="2" />
          <rect
            className={`pw-bar ${o.mine ? "art-bar-after" : "art-bar-before"}`}
            x={BAR_X + 10}
            y={rowY(i) - 4}
            width={r(Math.max(2, (BAR_W * o.pct) / 100))}
            height="8"
            rx="2"
          />
          <text className={`art-small pw-pct ${o.mine ? "art-strong art-bold" : ""}`} x={BAR_X + 10 + BAR_W + 8} y={rowY(i) + 4}>
            {o.label}
          </text>
        </g>
      ))}
      <text className="art-label art-ok art-bold pw-verdict" x="486" y="182">
        ✓ Wins 85 times in 100
      </text>
      <text className="art-small pw-verdict" x="486" y="198">
        in the real race he finished 2nd
      </text>

      {/* ---- the numbers ---- */}
      <line className="art-rule" x1="0" y1="226" x2="720" y2="226" />
      {FACTS.map((fact) => (
        <g key={fact.big}>
          <text className="art-fact" x={fact.x} y="262">
            {fact.big}
          </text>
          <text className="art-small" x={fact.x} y="280">
            {fact.small}
          </text>
        </g>
      ))}
      <text className="art-tiny" x="0" y="306">
        Replay any real race to any lap, change one decision, and see how the rest would have gone.
      </text>
    </svg>
  );
}
