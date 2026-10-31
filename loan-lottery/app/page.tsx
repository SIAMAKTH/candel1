"use client";

import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { useFund } from "@/components/FundProvider";
import { Wheel } from "@/components/Wheel";
import {
  eligibleEntries,
  faDate,
  faNum,
  loanAmount,
  toman,
  totalShares,
  type Entry,
  type Member,
} from "@/lib/lottery";

const demoMember: Member = { id: "demo", name: "", phone: "", shares: 12, numbers: [] };
const demoEntries: Entry[] = Array.from({ length: 12 }, (_, i) => ({
  number: i + 1,
  member: demoMember,
}));

const steps = [
  { title: "عضو شوید", text: "هر عضو به تعداد سهمش شماره قرعه ثابت می‌گیرد." },
  { title: "قسط ماهانه", text: "همه اعضا هر ماه قسط سهم خود را به صندوق می‌پردازند." },
  { title: "گردونه می‌چرخد", text: "از بین شماره‌های باقی‌مانده یکی به‌صورت کاملاً تصادفی انتخاب می‌شود." },
  { title: "دریافت وام", text: "برنده کل مبلغ آن دوره را بدون سود دریافت می‌کند." },
];

export default function HomePage() {
  const { state, ready } = useFund();
  const { members, rounds, settings } = state;
  const entries = eligibleEntries(members, rounds);
  const shares = totalShares(members);
  const finished = members.length > 0 && entries.length === 0;
  const last = rounds.at(-1);
  const recent = [...rounds].reverse().slice(0, 3);

  function showHow() {
    document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-wheel" aria-hidden>
            <Wheel
              entries={entries.length ? entries : demoEntries}
              rotation={0}
              spinning={false}
              durationMs={0}
              winnerNumber={null}
              onSpinEnd={() => {}}
              idle
            />
          </div>

          <div className="hero-copy">
            <h1 className="hero-title">
              وام خانگی
              <br />
              با گردونه شانس
            </h1>
            <p className="hero-lead">
              صندوق خانوادگی یا دوستانه‌تان را ساده اداره کنید: اعضا را ثبت کنید، قسط‌ها را
              پیگیری کنید و هر ماه برنده وام را شفاف و منصفانه با گردونه مشخص کنید.
            </p>
            <div className="hero-actions">
              <Link href="/draw" className="hero-btn hero-btn-primary">
                رفتن به قرعه‌کشی
              </Link>
              <button type="button" className="hero-btn hero-btn-ghost" onClick={showHow}>
                چطور کار می‌کند؟ ‹
              </button>
            </div>
          </div>

          <aside className="draw-card">
            {ready && members.length > 0 && !finished && (
              <div className="float-badge float-badge-gold">
                <strong>★ {faNum(entries.length)} شماره</strong>
                <span>در قرعه‌کشی</span>
              </div>
            )}
            <div className="draw-card-art">
              <span className="live-pill">
                {finished ? "پایان دوره" : `دوره ${faNum(Math.min(rounds.length + 1, shares || 1))}`}
              </span>
              <HouseIcon />
            </div>
            <div className="draw-card-body">
              <h2 className="draw-card-title">{settings.fundName}</h2>
              <p className="draw-card-text">
                قسط ماهانه هر سهم {toman(settings.contribution)} · {faNum(members.length)} عضو
              </p>
              <div className="draw-card-amount">{toman(loanAmount(state))}</div>
              {finished ? (
                <p className="countdown-note">همه سهم‌ها وام خود را گرفته‌اند.</p>
              ) : (
                <Countdown target={settings.nextDrawAt} />
              )}
              <Link
                href={members.length ? "/draw" : "/members"}
                className="draw-card-btn"
              >
                {members.length ? "مشاهده گردونه" : "افزودن اعضا"}
              </Link>
            </div>
            {last && (
              <div className="float-badge float-badge-blue">
                <strong>شماره {faNum(last.winnerNumber)} · {last.winnerName}</strong>
                <span>برنده دوره {faNum(last.number)} ✓</span>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section id="how" className="how">
        <h2>چطور کار می‌کند؟</h2>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-num">{faNum(i + 1)}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {recent.length > 0 && (
        <section className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2>آخرین برندگان</h2>
            <Link href="/history" className="btn btn-sm">
              همه سوابق
            </Link>
          </div>
          <div className="legend">
            {recent.map((r) => (
              <div key={r.id} className="legend-item">
                <span className="num-chip won">{faNum(r.winnerNumber)}</span>
                <span>
                  {r.winnerName}
                  <span className="muted"> · {faDate(r.date)}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function HouseIcon() {
  return (
    <svg className="house-icon" viewBox="0 0 120 100" aria-hidden>
      <defs>
        <linearGradient id="house-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="100%" stopColor="#c98a1e" />
        </linearGradient>
      </defs>
      <path d="M60 8 L112 50 L100 50 L100 92 L20 92 L20 50 L8 50 Z" fill="url(#house-gold)" />
      <rect x="50" y="62" width="20" height="30" rx="3" fill="#7a4a0e" />
      <rect x="30" y="58" width="13" height="13" rx="2" fill="#fff6e5" />
      <rect x="77" y="58" width="13" height="13" rx="2" fill="#fff6e5" />
      <circle cx="60" cy="38" r="8" fill="#c8102e" />
    </svg>
  );
}
