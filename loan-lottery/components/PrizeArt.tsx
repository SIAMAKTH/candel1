import type { PrizeIcon } from "@/lib/raffle";

// Flat appliance illustrations on a 120x100 canvas. Colours are fixed artwork.
const BODY = "#f8fafc";
const EDGE = "#0f172a";
const STEEL = "#cbd5e1";
const GLASS = "#1e293b";

const shapes: Record<PrizeIcon, React.ReactNode> = {
  fridge: (
    <>
      <rect x="36" y="6" width="48" height="88" rx="6" fill={BODY} stroke={EDGE} strokeWidth="3" />
      <path d="M36 38 H84" stroke={EDGE} strokeWidth="3" />
      <rect x="42" y="16" width="4" height="14" rx="2" fill={EDGE} />
      <rect x="42" y="46" width="4" height="22" rx="2" fill={EDGE} />
      <rect x="62" y="44" width="16" height="10" rx="2" fill="#a7f3d0" />
      <rect x="40" y="94" width="8" height="4" fill={EDGE} />
      <rect x="72" y="94" width="8" height="4" fill={EDGE} />
    </>
  ),
  washer: (
    <>
      <rect x="22" y="8" width="76" height="86" rx="7" fill={BODY} stroke={EDGE} strokeWidth="3" />
      <path d="M22 26 H98" stroke={EDGE} strokeWidth="3" />
      <circle cx="34" cy="17" r="3" fill="#ea580c" />
      <rect x="64" y="14" width="26" height="6" rx="3" fill={STEEL} />
      <circle cx="60" cy="60" r="25" fill={STEEL} stroke={EDGE} strokeWidth="3" />
      <circle cx="60" cy="60" r="17" fill="#38bdf8" />
      <path d="M45 64 Q52 56 60 64 T75 62" stroke="#e0f2fe" strokeWidth="3" fill="none" />
    </>
  ),
  tv: (
    <>
      <rect x="8" y="12" width="104" height="64" rx="5" fill={GLASS} stroke={EDGE} strokeWidth="3" />
      <rect x="14" y="18" width="92" height="52" rx="2" fill="#0ea5e9" />
      <path d="M14 58 L44 34 L64 50 L80 38 L106 58 V70 H14 Z" fill="#10b981" />
      <circle cx="88" cy="30" r="6" fill="#fde047" />
      <path d="M50 76 L44 90 H76 L70 76" fill={STEEL} stroke={EDGE} strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  stove: (
    <>
      <rect x="18" y="30" width="84" height="64" rx="5" fill={BODY} stroke={EDGE} strokeWidth="3" />
      <rect x="14" y="20" width="92" height="12" rx="3" fill={STEEL} stroke={EDGE} strokeWidth="3" />
      <ellipse cx="40" cy="20" rx="14" ry="4" fill={EDGE} />
      <ellipse cx="80" cy="20" rx="14" ry="4" fill={EDGE} />
      <path d="M34 12 q6 -8 6 0 q6 -8 6 0" stroke="#ea580c" strokeWidth="3" fill="none" />
      <rect x="28" y="46" width="64" height="38" rx="3" fill={GLASS} />
      <rect x="40" y="38" width="40" height="4" rx="2" fill={EDGE} />
      <circle cx="28" cy="38" r="3" fill={EDGE} />
      <circle cx="92" cy="38" r="3" fill={EDGE} />
    </>
  ),
  vacuum: (
    <>
      <path d="M78 10 L56 70" stroke={EDGE} strokeWidth="5" strokeLinecap="round" />
      <rect x="70" y="6" width="18" height="8" rx="4" fill="#ea580c" />
      <ellipse cx="52" cy="78" rx="34" ry="16" fill={BODY} stroke={EDGE} strokeWidth="3" />
      <ellipse cx="52" cy="74" rx="20" ry="8" fill="#10b981" />
      <circle cx="28" cy="90" r="5" fill={EDGE} />
      <circle cx="76" cy="90" r="5" fill={EDGE} />
    </>
  ),
  aircon: (
    <>
      <rect x="10" y="22" width="100" height="40" rx="10" fill={BODY} stroke={EDGE} strokeWidth="3" />
      <path d="M18 50 H102" stroke={EDGE} strokeWidth="2.5" />
      <path d="M18 56 H102" stroke={STEEL} strokeWidth="2.5" />
      <circle cx="94" cy="34" r="3" fill="#10b981" />
      <path d="M30 70 q4 8 0 16 M50 70 q4 8 0 16 M70 70 q4 8 0 16 M90 70 q4 8 0 16" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
};

export function PrizeArt({ icon, className }: { icon: PrizeIcon; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden>
      {shapes[icon] ?? shapes.fridge}
    </svg>
  );
}
