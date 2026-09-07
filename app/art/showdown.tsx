/*
  ShowdownRL. Left: four turns of a battle, the opponent's health falling to
  zero. Right: the policy's seven actions (four moves, three bench switches)
  re-weighted every turn, with the illegal action struck out by the mask.
  Below: the measured win rate over the type-aware baseline.

  One 8s loop, driven entirely from app/art/showdown.css. The un-animated
  state (no `is-visible` ancestor, or reduced motion) is the finished frame.
*/

const ACTIONS = [
  "Ice Beam",
  "Earthquake",
  "Thunderbolt",
  "Recover",
  "switch 1",
  "switch 2",
  "switch 3",
];

const TURNS = ["Ice Beam", "Earthquake", "switch → Ferrothorn", "Thunderbolt"];

export function ShowdownArt() {
  return (
    <svg
      className="art art-sd"
      viewBox="0 0 720 188"
      role="img"
      aria-label="Four turns of a battle: the agent's action probabilities re-weight each turn, one illegal action is struck out by the mask, and the opponent's health falls to zero. Below, the measured result: the PPO policy wins 79.0 percent of 1,000 simulator episodes, against 75.2 percent for the type-aware heuristic."
      fill="none"
    >
      {/* ---------- left: the battle ---------- */}
      <g className="sd-battle">
        <text className="sd-head" x="0" y="14">
          battle
        </text>

        <text className="sd-side" x="0" y="48">
          opponent
        </text>
        <rect className="sd-track" x="76.5" y="38" width="347" height="13" rx="2" />
        <rect className="sd-hp sd-hp-opp" x="77" y="38.5" width="346" height="12" rx="2" />

        <text className="sd-side" x="0" y="82">
          agent
        </text>
        <rect className="sd-track" x="76.5" y="72" width="347" height="13" rx="2" />
        <rect className="sd-hp sd-hp-agent" x="77" y="72.5" width="346" height="12" rx="2" />

        {TURNS.map((name, i) => (
          <text key={name} className={`sd-move sd-move-${i + 1}`} x="76" y="106">
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

        {ACTIONS.map((label, i) => {
          const cy = 30 + i * 14;

          return (
            <g key={label}>
              <text className="sd-row" x="452" y={cy + 3.8}>
                {label}
              </text>
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

        {/* the mask: Recover is illegal at full health, so its weight is zero */}
        <g className="sd-mask">
          <line className="sd-strike" x1="450" y1="72" x2="500" y2="72" />
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
