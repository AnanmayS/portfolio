"use client";

import { useEffect, useState } from "react";

/*
  ShowdownRL. Left: a battlefield. The agent's Pokémon faces an opponent;
  four turns play out, the attacker lunging and the target flinching, until
  the agent switches on turn three and finishes the job on turn four. Right:
  the policy's seven actions (four moves, three bench switches) re-weighted
  every turn, the illegal action struck out by the mask, the move labels
  changing with the active Pokémon. Below: the measured win rate over the
  type-aware baseline.

  One 8s loop, driven entirely from app/art/showdown.css. Every pass of the
  loop draws a different matchup from the roster below: the swap happens at
  the seam, while the field is reset, so a new pair simply walks on. The
  un-animated state (no `is-visible` ancestor, or reduced motion) is the
  finished frame: the opponent fainted, the switch-in out, the result full.

  Sprites are Pokémon Showdown's own, served from public/sprites; the one
  place on the page with colour.
*/

type Mon = { sprite: string; name: string; moves: readonly [string, string, string, string] };

type Matchup = {
  /** Leads; uses slot 1 on turn one, slot 2 on turn two. Slot 4 is masked. */
  a: Mon;
  /** Switches in on turn three; uses slot 3 on turn four. */
  b: Mon;
  opp: Mon;
};

const ROSTER: readonly Matchup[] = [
  {
    a: { sprite: "charizard-back", name: "Charizard", moves: ["Flamethrower", "Air Slash", "Dragon Pulse", "Roost"] },
    b: { sprite: "venusaur-back", name: "Venusaur", moves: ["Sludge Bomb", "Leech Seed", "Solar Beam", "Synthesis"] },
    opp: { sprite: "blastoise", name: "Blastoise", moves: ["Surf", "Ice Beam", "Rapid Spin", "Rest"] },
  },
  {
    a: { sprite: "garchomp-back", name: "Garchomp", moves: ["Earthquake", "Dragon Claw", "Stone Edge", "Rest"] },
    b: { sprite: "heatran-back", name: "Heatran", moves: ["Earth Power", "Flash Cannon", "Magma Storm", "Taunt"] },
    opp: { sprite: "ferrothorn", name: "Ferrothorn", moves: ["Power Whip", "Gyro Ball", "Leech Seed", "Rest"] },
  },
  {
    a: { sprite: "gengar-back", name: "Gengar", moves: ["Shadow Ball", "Sludge Bomb", "Focus Blast", "Substitute"] },
    b: { sprite: "tyranitar-back", name: "Tyranitar", moves: ["Crunch", "Stone Edge", "Pursuit", "Dragon Dance"] },
    opp: { sprite: "alakazam", name: "Alakazam", moves: ["Psychic", "Focus Blast", "Shadow Ball", "Recover"] },
  },
  {
    a: { sprite: "pikachu-back", name: "Pikachu", moves: ["Thunderbolt", "Volt Tackle", "Iron Tail", "Substitute"] },
    b: { sprite: "lapras-back", name: "Lapras", moves: ["Surf", "Freeze-Dry", "Ice Beam", "Rest"] },
    opp: { sprite: "dragonite", name: "Dragonite", moves: ["Outrage", "Extreme Speed", "Fire Punch", "Roost"] },
  },
];

const SWITCHES = ["switch 1", "switch 2", "switch 3"];

function another(current: number) {
  const next = Math.floor(Math.random() * (ROSTER.length - 1));
  return next >= current ? next + 1 : next;
}

export function ShowdownArt({ basePath = "" }: { basePath?: string }) {
  const [index, setIndex] = useState(0);

  /* A random opener, chosen before the loop starts so nothing visibly swaps. */
  useEffect(() => {
    setIndex(Math.floor(Math.random() * ROSTER.length));
  }, []);

  const { a, b, opp } = ROSTER[index];
  const sprite = (name: string) => `${basePath}/sprites/${name}.png`;
  const turns = [a.moves[0], a.moves[1], `switch → ${b.name}`, b.moves[2]];

  return (
    <svg
      className="art art-sd"
      viewBox="0 0 720 230"
      role="img"
      aria-label={`Four turns of a battle, ${a.name} against ${opp.name}: the agent's action probabilities re-weight each turn, one illegal action is struck out by the mask, the agent switches to ${b.name}, and ${opp.name} faints. Below, the measured result: the PPO policy wins 79.0 percent of 1,000 simulator episodes, against 75.2 percent for the type-aware heuristic.`}
      fill="none"
      onAnimationIteration={(event) => {
        /* One element's loop is the clock for the whole scene. */
        if (event.animationName === "sd-opp") setIndex((i) => another(i));
      }}
    >
      {/* ---------- left: the battlefield ---------- */}
      <g className="sd-battle">
        {/* the agent's two Pokémon, left; one shows at a time */}
        <g className="sd-mon sd-mon-a">
          <image className="sd-sprite" href={sprite(a.sprite)} x="16" y="0" width="136" height="136" />
        </g>
        <g className="sd-mon sd-mon-b">
          <image className="sd-sprite" href={sprite(b.sprite)} x="16" y="0" width="136" height="136" />
        </g>

        {/* its name and health, directly underneath */}
        <text className="sd-name sd-swap-a" x="16" y="147">
          {a.name}
        </text>
        <text className="sd-name sd-swap-b" x="16" y="147">
          {b.name}
        </text>
        <rect className="sd-track" x="16.5" y="152" width="135" height="9" rx="2" />
        <rect className="sd-hp sd-hp-agent" x="17" y="152.5" width="134" height="8" rx="2" />

        {/* the opponent, right */}
        <g className="sd-mon sd-opp-mon">
          <image className="sd-sprite" href={sprite(opp.sprite)} x="290" y="0" width="136" height="136" />
        </g>

        {/* its name and health, directly underneath */}
        <text className="sd-name" x="290" y="147">
          {opp.name}
        </text>
        <rect className="sd-track" x="290.5" y="152" width="135" height="9" rx="2" />
        <rect className="sd-hp sd-hp-opp" x="291" y="152.5" width="134" height="8" rx="2" />

        {/* the move called each turn, mid-field */}
        {turns.map((name, i) => (
          <text key={i} className={`sd-move sd-move-${i + 1}`} x="221" y="72" textAnchor="middle">
            {name}
          </text>
        ))}
      </g>

      <line className="sd-rule" x1="436" y1="22" x2="436" y2="160" />

      {/* ---------- right: the policy ---------- */}
      <g className="sd-policy">
        <text className="sd-head" x="452" y="34">
          policy
        </text>
        <line className="sd-rule" x1="539.5" y1="44" x2="539.5" y2="138" />

        {[...a.moves, ...SWITCHES].map((label, i) => {
          const cy = 50 + i * 14;
          const swap = i < 4 ? b.moves[i] : null;

          return (
            <g key={i}>
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

        {/* the mask: slot four is illegal this turn, so its weight is zero */}
        <g className="sd-mask">
          <line className="sd-strike" x1="450" y1="92" x2="530" y2="92" />
          <rect className="sd-chip" x="540.5" y="86.5" width="45" height="11" rx="2" />
          <text className="sd-chip-text" x="546" y="94.5">
            masked
          </text>
        </g>
      </g>

      <line className="sd-rule" x1="0" y1="169.5" x2="720" y2="169.5" />

      {/* ---------- below: the measured result ---------- */}
      <g className="sd-result">
        <text className="sd-res-lead sd-res-label" x="567" y="184" textAnchor="end">
          ppo v11 79.0%
        </text>
        <text className="sd-note sd-res-label" x="720" y="184" textAnchor="end">
          1,000 episodes
        </text>

        <rect className="sd-track" x="0.5" y="190" width="719" height="16" rx="2" />
        <rect className="sd-res-base" x="1" y="190.5" width="718" height="15" rx="2" />
        <rect className="sd-res-top" x="1" y="194.5" width="718" height="7" rx="2" />

        <text className="sd-note sd-res-label" x="540" y="223" textAnchor="end">
          type-aware 75.2%
        </text>
        <text className="sd-note sd-res-label" x="720" y="223" textAnchor="end">
          790-41-169
        </text>
      </g>
    </svg>
  );
}
