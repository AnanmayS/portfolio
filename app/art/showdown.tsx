/*
  ShowdownRL. Left: a battlefield. Blastoise faces the agent's Charizard;
  four turns play out, the attacker lunging and the target flinching, until
  the agent switches to Venusaur on turn three and finishes the job with
  Solar Beam on turn four. Right: the policy's seven actions (four moves,
  three bench switches) re-weighted every turn, the illegal action struck
  out by the mask, the move labels changing with the active Pokémon. Below:
  the measured win rate over the type-aware baseline.

  One 8s loop, driven entirely from app/art/showdown.css. The un-animated
  state (no `is-visible` ancestor, or reduced motion) is the finished frame:
  Blastoise fainted, Venusaur out, the result full.

  Sprites are Pokémon Showdown's own, served from public/sprites; the one
  place on the page with colour.
*/

const basePath = process.env.PAGES_BASE_PATH ?? "";
const sprite = (name: string) => `${basePath}/sprites/${name}.png`;

const AGENT = {
  a: { name: "Charizard", moves: ["Flamethrower", "Air Slash", "Dragon Pulse", "Roost"] },
  b: { name: "Venusaur", moves: ["Sludge Bomb", "Leech Seed", "Solar Beam", "Synthesis"] },
} as const;

const SWITCHES = ["switch 1", "switch 2", "switch 3"];

const TURNS = ["Flamethrower", "Air Slash", "switch → Venusaur", "Solar Beam"];

export function ShowdownArt() {
  return (
    <svg
      className="art art-sd"
      viewBox="0 0 720 188"
      role="img"
      aria-label="Four turns of a battle, Charizard against Blastoise: the agent's action probabilities re-weight each turn, one illegal action is struck out by the mask, the agent switches to Venusaur, and Blastoise faints. Below, the measured result: the PPO policy wins 79.0 percent of 1,000 simulator episodes, against 75.2 percent for the type-aware heuristic."
      fill="none"
    >
      {/* ---------- left: the battlefield ---------- */}
      <g className="sd-battle">
        {/* opponent's box, top-left */}
        <text className="sd-name" x="0" y="14">
          Blastoise
        </text>
        <rect className="sd-track" x="0.5" y="20" width="189" height="9" rx="2" />
        <rect className="sd-hp sd-hp-opp" x="1" y="20.5" width="188" height="8" rx="2" />

        {/* opponent, top-right */}
        <g className="sd-mon sd-opp-mon">
          <image className="sd-sprite" href={sprite("blastoise")} x="316" y="0" width="96" height="96" />
        </g>

        {/* the agent's two Pokémon, bottom-left; one shows at a time */}
        <g className="sd-mon sd-mon-a">
          <image className="sd-sprite" href={sprite("charizard-back")} x="36" y="30" width="96" height="96" />
        </g>
        <g className="sd-mon sd-mon-b">
          <image className="sd-sprite" href={sprite("venusaur-back")} x="36" y="30" width="96" height="96" />
        </g>

        {/* agent's box, bottom-right */}
        <text className="sd-name sd-swap-a" x="246" y="108">
          {AGENT.a.name}
        </text>
        <text className="sd-name sd-swap-b" x="246" y="108">
          {AGENT.b.name}
        </text>
        <rect className="sd-track" x="246.5" y="114" width="189" height="9" rx="2" />
        <rect className="sd-hp sd-hp-agent" x="247" y="114.5" width="188" height="8" rx="2" />

        {/* the move called each turn, mid-field */}
        {TURNS.map((name, i) => (
          <text key={name} className={`sd-move sd-move-${i + 1}`} x="224" y="66" textAnchor="middle">
            {name}
          </text>
        ))}
      </g>

      <line className="sd-rule" x1="436" y1="22" x2="436" y2="120" />

      {/* ---------- right: the policy ---------- */}
      <g className="sd-policy">
        <text className="sd-head" x="452" y="14">
          policy
        </text>
        <line className="sd-rule" x1="539.5" y1="24" x2="539.5" y2="118" />

        {[...AGENT.a.moves, ...SWITCHES].map((label, i) => {
          const cy = 30 + i * 14;
          const swap = i < 4 ? AGENT.b.moves[i] : null;

          return (
            <g key={label}>
              {swap ? (
                <>
                  <text className="sd-row sd-swap-a" x="452" y={cy + 3.8}>
                    {label}
                  </text>
                  <text className="sd-row sd-swap-b" x="452" y={cy + 3.8}>
                    {swap}
                  </text>
                </>
              ) : (
                <text className="sd-row" x="452" y={cy + 3.8}>
                  {label}
                </text>
              )}
              <rect
                className={`sd-bar sd-bar-${i + 1}`}
                x="540"
                y={cy - 3.5}
                width="176"
                height="7"
                rx="2"
              />
            </g>
          );
        })}

        {/* the mask: Roost is illegal at full health, so its weight is zero */}
        <g className="sd-mask">
          <line className="sd-strike" x1="450" y1="72" x2="486" y2="72" />
          <rect className="sd-chip" x="540.5" y="66.5" width="45" height="11" rx="2" />
          <text className="sd-chip-text" x="546" y="74.5">
            masked
          </text>
        </g>
      </g>

      <line className="sd-rule" x1="0" y1="127.5" x2="720" y2="127.5" />

      {/* ---------- below: the measured result ---------- */}
      <g className="sd-result">
        <text className="sd-res-lead sd-res-label" x="567" y="142" textAnchor="end">
          ppo v11 79.0%
        </text>
        <text className="sd-note sd-res-label" x="720" y="142" textAnchor="end">
          1,000 episodes
        </text>

        <rect className="sd-track" x="0.5" y="148" width="719" height="16" rx="2" />
        <rect className="sd-res-base" x="1" y="148.5" width="718" height="15" rx="2" />
        <rect className="sd-res-top" x="1" y="152.5" width="718" height="7" rx="2" />

        <text className="sd-note sd-res-label" x="540" y="181" textAnchor="end">
          type-aware 75.2%
        </text>
        <text className="sd-note sd-res-label" x="720" y="181" textAnchor="end">
          790-41-169
        </text>
      </g>
    </svg>
  );
}
