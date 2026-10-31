"use client";

import { faNum, type Entry } from "@/lib/lottery";

const SIZE = 400;
const C = SIZE / 2;
const R_RIM = 196;
const R_FACE = 168;
const BULBS = 24;

type WheelProps = {
  entries: Entry[];
  rotation: number;
  spinning: boolean;
  durationMs: number;
  winnerNumber: number | null;
  onSpinEnd: () => void;
};

function polar(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
}

function slicePath(start: number, end: number): string {
  const [x1, y1] = polar(R_FACE, start);
  const [x2, y2] = polar(R_FACE, end);
  const large = end - start > 180 ? 1 : 0;
  return `M${C},${C} L${x1},${y1} A${R_FACE},${R_FACE} 0 ${large} 1 ${x2},${y2} Z`;
}

export function Wheel({
  entries,
  rotation,
  spinning,
  durationMs,
  winnerNumber,
  onSpinEnd,
}: WheelProps) {
  const n = Math.max(entries.length, 1);
  const seg = 360 / n;
  const fontSize = Math.max(9, Math.min(30, 300 / n + 6));

  return (
    <svg
      className={`wheel ${spinning ? "is-spinning" : ""}`}
      viewBox={`0 0 ${SIZE} ${SIZE + 70}`}
      role="img"
      aria-label="گردونه شانس"
    >
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="30%" stopColor="#e2a93b" />
          <stop offset="55%" stopColor="#fbe08a" />
          <stop offset="80%" stopColor="#b9771c" />
          <stop offset="100%" stopColor="#f6d37a" />
        </linearGradient>
        <radialGradient id="hub" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff6cf" />
          <stop offset="45%" stopColor="#e0a73a" />
          <stop offset="100%" stopColor="#8a5410" />
        </radialGradient>
        <linearGradient id="stand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Stand */}
      <path
        d={`M${C - 40},${C + 150} L${C + 40},${C + 150} L${C + 70},${SIZE + 40} L${C - 70},${SIZE + 40} Z`}
        fill="url(#stand)"
      />
      <rect x={C - 120} y={SIZE + 36} width={240} height={26} rx={8} fill="url(#stand)" />

      {/* Rim */}
      <circle cx={C} cy={C} r={R_RIM} fill="url(#gold)" filter="url(#shadow)" />
      <circle cx={C} cy={C} r={R_FACE + 6} fill="#7a4a0e" />
      {Array.from({ length: BULBS }, (_, i) => {
        const [x, y] = polar((R_RIM + R_FACE + 6) / 2, (i * 360) / BULBS);
        return (
          <circle
            key={i}
            className={`bulb ${i % 2 ? "odd" : "even"}`}
            cx={x}
            cy={y}
            r={5}
          />
        );
      })}

      {/* Spinning face */}
      <g
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${C}px ${C}px`,
          transition: spinning
            ? `transform ${durationMs}ms cubic-bezier(0.12, 0.6, 0.1, 1)`
            : "none",
        }}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === "transform") onSpinEnd();
        }}
      >
        {entries.length === 0 ? (
          <circle cx={C} cy={C} r={R_FACE} fill="#fff6e5" />
        ) : (
          entries.map((entry, i) => {
            const start = i * seg;
            const red = i % 2 === 0;
            const won = entry.number === winnerNumber;
            const [tx, ty] = polar(R_FACE * 0.72, start + seg / 2);
            return (
              <g key={entry.number}>
                {n === 1 ? (
                  <circle cx={C} cy={C} r={R_FACE} fill={red ? "#c8102e" : "#fff6e5"} />
                ) : (
                  <path
                    d={slicePath(start, start + seg)}
                    fill={red ? "#c8102e" : "#fff6e5"}
                    stroke="#d9a440"
                    strokeWidth={1.5}
                  />
                )}
                {won && !spinning && (
                  <path
                    className="win-slice"
                    d={n === 1 ? `M${C - R_FACE},${C} a${R_FACE},${R_FACE} 0 1,0 ${R_FACE * 2},0 a${R_FACE},${R_FACE} 0 1,0 ${-R_FACE * 2},0` : slicePath(start, start + seg)}
                  />
                )}
                <text
                  x={tx}
                  y={ty}
                  transform={`rotate(${start + seg / 2} ${tx} ${ty})`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={800}
                  fill={red ? "#fff6e5" : "#c8102e"}
                >
                  {faNum(entry.number)}
                </text>
                {n > 1 && (() => {
                  const [dx, dy] = polar(R_FACE - 8, start);
                  return <circle cx={dx} cy={dy} r={2.5} fill="#e9bb55" />;
                })()}
              </g>
            );
          })
        )}
      </g>

      {/* Hub */}
      <circle cx={C} cy={C} r={30} fill="url(#hub)" stroke="#7a4a0e" strokeWidth={2} />
      <circle cx={C} cy={C} r={14} fill="url(#gold)" stroke="#9b6316" strokeWidth={1} />

      {/* Pointer */}
      <path
        d={`M${C - 16},4 L${C + 16},4 L${C + 10},22 L${C},44 L${C - 10},22 Z`}
        fill="url(#gold)"
        stroke="#7a4a0e"
        strokeWidth={1.5}
        filter="url(#shadow)"
      />
      <circle cx={C} cy={14} r={4} fill="#7a4a0e" />
    </svg>
  );
}

// Rotation (degrees, clockwise) that lands the centre of slice `index` under the top pointer.
export function targetRotation(current: number, index: number, count: number): number {
  const seg = 360 / count;
  // Random offset inside the slice so it doesn't always stop dead centre.
  const jitter = (Math.random() - 0.5) * seg * 0.6;
  const target = (360 - (index + 0.5) * seg + jitter + 360) % 360;
  const base = current - (current % 360);
  return base + 360 * 6 + target;
}
