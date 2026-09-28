/*
  ShowdownRL, told as one short battle anyone can follow.

  Left: the AI's Garchomp against Ferrothorn, four turns of 2 s. Garchomp
  attacks, Ferrothorn hits back hard, the AI swaps in Heatran (Grass moves
  barely hurt it), and Heatran's Magma Storm finishes the job. Right: "what
  the AI is weighing", its seven options as bars that re-weight every turn,
  a ▸ on the one it picks, and one option greyed out as not allowed (the
  action mask). Below: how it learned, and the benchmark in plain words.

  The battle is an illustration, not a logged game. The win rates are the
  README's seed-42 benchmark: 1,000 simulator battles each against the
  type-aware bot (PPO 79.0%, type-aware 75.2%, max damage 54.2%, random
  31.9%).

  One 8 s loop, driven from app/art/showdown.css. The un-animated state is
  the finished frame: Heatran in, Magma Storm landed. Sprites are Pokémon
  Showdown's own, served from public/sprites.
*/

const CALLS = [
  { cls: "sd-c1", big: "Earthquake!", small: "Garchomp attacks", dir: "r" },
  { cls: "sd-c2", big: "Power Whip!", small: "Ferrothorn hits back hard", dir: "l" },
  { cls: "sd-c3", big: "Swap in Heatran", small: "Grass moves barely hurt him", dir: null },
  { cls: "sd-c4", big: "Magma Storm!", small: "super effective!", dir: "r" },
] as const;

const BENCH = ["swap → Tyranitar", "swap → Lapras"];
const OPTIONS_A = ["Earthquake", "Fire Fang", "Stone Edge", "Rest", "swap → Heatran", ...BENCH];
const OPTIONS_B = ["Magma Storm", "Earth Power", "Flash Cannon", "Taunt", "swap → Garchomp", ...BENCH];
/* Row 4 (index 3) is the masked one; it has no bar. */
const BARS = [0, 1, 2, 4, 5, 6];
const rowY = (i: number) => 50 + i * 16;

const SCORES = [
  { label: "This AI", pct: 79.0, mine: true },
  { label: "bot that plays type matchups", pct: 75.2, mine: false },
  { label: "bot that always hits hardest", pct: 54.2, mine: false },
  { label: "picking at random", pct: 31.9, mine: false },
];

export function ShowdownArt({ basePath = "" }: { basePath?: string }) {
  const sprite = (name: string) => `${basePath}/sprites/${name}.png`;

  return (
    <svg
      className="art art-sd"
      viewBox="0 0 720 314"
      role="img"
      aria-label="An AI plays a Pokémon battle. Garchomp attacks Ferrothorn with Earthquake; Ferrothorn hits back hard with Power Whip. The AI's options shift toward swapping, and it swaps in Heatran, who Grass moves barely hurt. Heatran's Magma Storm is super effective and Ferrothorn faints. One option is greyed out as not allowed. It learned by practising in a battle simulator, and out of 1,000 battles against a rule-following bot it won 79 percent, more than a bot that plays type matchups (75), a bot that always hits as hard as it can (54) or picking at random (32). It plays real battles on the Pokémon Showdown website, clicking the moves itself."
      fill="none"
    >
      {/* ---------- the battle ---------- */}
      <g className="sd-a">
        <image className="sd-sprite" href={sprite("garchomp-back")} x="20" y="4" width="120" height="120" />
      </g>
      <g className="sd-b">
        <image className="sd-sprite" href={sprite("heatran-back")} x="20" y="4" width="120" height="120" />
      </g>
      <g className="sd-opp">
        <image className="sd-sprite" href={sprite("ferrothorn")} x="290" y="4" width="120" height="120" />
      </g>

      <text className="art-label art-soft sd-name-a" x="20" y="142">
        Garchomp · the AI
      </text>
      <text className="art-label art-soft sd-name-b" x="20" y="142">
        Heatran · the AI
      </text>
      <text className="art-label art-soft" x="290" y="142">
        Ferrothorn · opponent
      </text>
      <rect className="art-track" x="20" y="149" width="120" height="7" rx="2" />
      <rect className="art-bar-after sd-hp sd-hp-agent" x="20" y="149" width="120" height="7" rx="2" />
      <rect className="art-track" x="290" y="149" width="120" height="7" rx="2" />
      <rect className="art-bar-ink sd-hp sd-hp-opp" x="290" y="149" width="120" height="7" rx="2" />

      {CALLS.map((call) => (
        <g key={call.cls} className={call.cls}>
          <text className={`sd-call ${call.dir ? "" : "art-ok"}`} x="215" y="58" textAnchor="middle">
            {call.big}
          </text>
          <text className="art-label art-muted" x="215" y="74" textAnchor="middle">
            {call.small}
          </text>
          {call.dir === "r" && <path className="art-arrow" d="M190 88H240M234 83l6 5-6 5" />}
          {call.dir === "l" && <path className="art-arrow" d="M240 88H190M196 83l-6 5 6 5" />}
        </g>
      ))}

      {/* ---------- what the AI is weighing ---------- */}
      <line className="art-hair" x1="436" y1="16" x2="436" y2="166" />
      <text className="art-small sd-head" x="452" y="28">
        WHAT THE AI IS WEIGHING
      </text>
      {[
        { cls: "sd-rows-a", labels: OPTIONS_A },
        { cls: "sd-rows-b", labels: OPTIONS_B },
      ].map(({ cls, labels }) => (
        <g key={cls} className={cls}>
          {labels.map((label, i) => (
            <text key={i} className={`art-small ${i === 3 ? "" : "art-soft"}`} x="452" y={rowY(i)}>
              {label}
            </text>
          ))}
        </g>
      ))}
      <text className="art-small art-ok sd-pick sd-pick1" x="441" y={rowY(0)}>
        ▸
      </text>
      <text className="art-small art-ok sd-pick sd-pick5" x="441" y={rowY(4)}>
        ▸
      </text>
      <text className="art-small art-ok sd-pick sd-pick1b" x="441" y={rowY(0)}>
        ▸
      </text>
      {BARS.map((i) => (
        <g key={i}>
          <rect className="art-track" x="548" y={rowY(i) - 7.5} width="168" height="7" rx="2" />
          <rect
            className={`sd-bar sd-bar-${i + 1} ${i === 0 || i === 4 ? "art-bar-after" : "art-bar-ink"}`}
            x="548"
            y={rowY(i) - 7.5}
            width="168"
            height="7"
            rx="2"
          />
        </g>
      ))}
      <line className="art-hair-strong" x1="450" y1="94" x2="500" y2="94" />
      <rect className="sd-chip" x="548.5" y="88.5" width="64" height="11" rx="2" />
      <text className="sd-chip-text" x="554" y="97">
        not allowed
      </text>
      <text className="art-tiny" x="452" y="164">
        longer bar = more sure · ▸ = what it picks
      </text>

      {/* ---------- how it learned, and how it does ---------- */}
      <line className="art-rule" x1="0" y1="176" x2="720" y2="176" />
      <text className="art-label art-soft" x="0" y="198">
        It taught itself by playing practice battles in a simulator, rewarded each time it won.
      </text>
      <text className="art-label" x="0" y="220">
        Out of 1,000 battles against a rule-following bot, how often each player won:
      </text>
      {SCORES.map(({ label, pct, mine }, i) => {
        const y = 228 + i * 18;
        const w = Math.round(420 * pct) / 100;
        return (
          <g key={label}>
            <text className={`art-small ${mine ? "art-strong art-bold" : "art-soft"}`} x="0" y={y + 9}>
              {label}
            </text>
            <rect className="art-track" x="200" y={y} width="420" height="10" rx="2" />
            <rect className={mine ? "art-bar-after" : "art-bar-before"} x="200" y={y} width={w} height="10" rx="2" />
            <text className={`art-small ${mine ? "art-strong art-bold" : "art-soft"}`} x={200 + w + 8} y={y + 9}>
              {Math.round(pct)}%
            </text>
          </g>
        );
      })}
      <text className="art-small" x="0" y="310">
        Then it plays real battles on the Pokémon Showdown website, clicking the moves itself in a browser.
      </text>
    </svg>
  );
}
