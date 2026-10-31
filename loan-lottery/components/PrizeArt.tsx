import type { PrizeIcon } from "@/lib/raffle";

const GOLD = "url(#prize-gold)";

const shapes: Record<PrizeIcon, React.ReactNode> = {
  car: (
    <>
      <path d="M14 66 L22 46 Q26 38 36 38 L84 38 Q94 38 98 46 L106 66 Q112 68 112 76 L112 84 L8 84 L8 76 Q8 68 14 66 Z" fill={GOLD} />
      <path d="M28 64 L34 48 Q36 44 41 44 L79 44 Q84 44 86 48 L92 64 Z" fill="#3a2a10" opacity="0.75" />
      <rect x="57" y="44" width="4" height="20" fill={GOLD} />
      <circle cx="32" cy="84" r="11" fill="#1b1206" />
      <circle cx="32" cy="84" r="5" fill="#d9a440" />
      <circle cx="88" cy="84" r="11" fill="#1b1206" />
      <circle cx="88" cy="84" r="5" fill="#d9a440" />
      <rect x="10" y="70" width="12" height="5" rx="2" fill="#fff6cf" />
      <rect x="98" y="70" width="12" height="5" rx="2" fill="#ff8a65" />
    </>
  ),
  gold: (
    <>
      <circle cx="46" cy="58" r="30" fill={GOLD} stroke="#8a5410" strokeWidth="3" />
      <circle cx="46" cy="58" r="22" fill="none" stroke="#8a5410" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="78" cy="50" r="26" fill={GOLD} stroke="#8a5410" strokeWidth="3" />
      <path d="M78 36 L82 46 L92 47 L84 54 L87 64 L78 58 L69 64 L72 54 L64 47 L74 46 Z" fill="#8a5410" />
    </>
  ),
  phone: (
    <>
      <rect x="38" y="12" width="44" height="80" rx="9" fill="#1b1206" />
      <rect x="41" y="15" width="38" height="74" rx="7" fill={GOLD} />
      <rect x="44" y="24" width="32" height="54" rx="3" fill="#3a2a10" />
      <circle cx="60" cy="84" r="2.5" fill="#1b1206" />
      <rect x="54" y="18" width="12" height="3" rx="1.5" fill="#1b1206" />
    </>
  ),
  home: (
    <>
      <path d="M60 10 L110 50 L98 50 L98 90 L22 90 L22 50 L10 50 Z" fill={GOLD} />
      <rect x="51" y="62" width="18" height="28" rx="3" fill="#7a4a0e" />
      <rect x="31" y="58" width="12" height="12" rx="2" fill="#fff6e5" />
      <rect x="77" y="58" width="12" height="12" rx="2" fill="#fff6e5" />
      <circle cx="60" cy="38" r="7" fill="#c8102e" />
    </>
  ),
  cash: (
    <>
      <rect x="14" y="40" width="80" height="44" rx="5" fill="#2f7d3a" transform="rotate(-8 54 62)" />
      <rect x="24" y="34" width="80" height="44" rx="5" fill="#3f9a4b" />
      <circle cx="64" cy="56" r="12" fill="none" stroke="#d8f5d0" strokeWidth="3" />
      <rect x="30" y="40" width="68" height="32" rx="3" fill="none" stroke="#d8f5d0" strokeWidth="1.5" />
      <circle cx="30" cy="88" r="12" fill={GOLD} stroke="#8a5410" strokeWidth="2" />
      <circle cx="98" cy="90" r="9" fill={GOLD} stroke="#8a5410" strokeWidth="2" />
    </>
  ),
};

export function PrizeArt({ icon, className }: { icon: PrizeIcon; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden>
      <defs>
        <linearGradient id="prize-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="55%" stopColor="#e2a93b" />
          <stop offset="100%" stopColor="#a8661a" />
        </linearGradient>
      </defs>
      {shapes[icon]}
    </svg>
  );
}
