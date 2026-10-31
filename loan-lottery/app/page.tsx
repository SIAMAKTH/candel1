"use client";

import Link from "next/link";
import { CampaignCard } from "@/components/CampaignCard";
import { Countdown } from "@/components/Countdown";
import { PrizeArt } from "@/components/PrizeArt";
import { useStore } from "@/components/StoreProvider";
import { Wheel } from "@/components/Wheel";
import {
  faDate,
  faNum,
  isOpen,
  ticketNo,
  ticketsOf,
  toman,
  winnerTicket,
  type Campaign,
} from "@/lib/raffle";

const demoWheel = [500, 900, 100, 300, 700, 200, 400, 800, 600, 1000].map((number) => ({
  number,
}));

const steps = [
  { title: "انتخاب قرعه‌کشی", text: "از بین قرعه‌کشی‌های فعال، جایزه دلخواهتان را انتخاب کنید." },
  { title: "خرید بلیط", text: "با نام و شماره موبایل بلیط بخرید و شماره بلیط اختصاصی بگیرید." },
  { title: "چرخش گردونه", text: "در زمان اعلام‌شده، گردونه بین همه بلیط‌ها کاملاً تصادفی می‌چرخد." },
  { title: "اعلام برنده", text: "شماره و نام برنده در صفحه برندگان برای همه نمایش داده می‌شود." },
];

function byDrawTime(a: Campaign, b: Campaign) {
  return (new Date(a.drawAt).getTime() || Infinity) - (new Date(b.drawAt).getTime() || Infinity);
}

export default function HomePage() {
  const { store, ready } = useStore();
  const live = store.campaigns.filter(isOpen).sort(byDrawTime);
  const featured = live[0];
  const drawn = store.campaigns
    .filter((c) => !isOpen(c))
    .sort((a, b) => (b.drawnAt ?? "").localeCompare(a.drawnAt ?? ""));
  const latestTicket = [...store.tickets].sort((a, b) =>
    b.purchasedAt.localeCompare(a.purchasedAt),
  )[0];

  function showHow() {
    document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-wheel" aria-hidden>
            <Wheel
              entries={demoWheel}
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
              با بلیط شانس
              <br />
              برنده جوایز بزرگ شو!
            </h1>
            <p className="hero-lead">
              در قرعه‌کشی‌های زنده شرکت کنید، بلیط بخرید، وضعیت بلیط‌هایتان را دنبال کنید و
              برندگان را با شفافیت کامل ببینید.
            </p>
            <div className="hero-actions">
              <Link href="/draws" className="hero-btn hero-btn-primary">
                قرعه‌کشی‌های فعال
              </Link>
              <button type="button" className="hero-btn hero-btn-ghost" onClick={showHow}>
                چطور شرکت کنم؟ ‹
              </button>
            </div>
          </div>

          {featured ? (
            <aside className="draw-card">
              <div className="float-badge float-badge-gold">
                <strong>★ {faNum(ticketsOf(store, featured.id).length)} بلیط</strong>
                <span>در این قرعه‌کشی</span>
              </div>
              <div className={`draw-card-art art-${featured.icon}`}>
                <span className="live-pill">● زنده</span>
                <PrizeArt icon={featured.icon} className="draw-card-svg" />
              </div>
              <div className="draw-card-body">
                <h2 className="draw-card-title">{featured.title}</h2>
                <p className="draw-card-text">
                  {featured.prize} · قیمت بلیط {toman(featured.ticketPrice)}
                </p>
                <Countdown target={featured.drawAt} />
                <Link href={`/draws/${featured.id}`} className="draw-card-btn">
                  همین حالا بلیط بخرید!
                </Link>
              </div>
              {latestTicket && (
                <div className="float-badge float-badge-blue">
                  <strong>🎟 بلیط {ticketNo(latestTicket.number)}</strong>
                  <span>ثبت شد ✓</span>
                </div>
              )}
            </aside>
          ) : (
            <aside className="draw-card">
              <div className="draw-card-body">
                <h2 className="draw-card-title">به‌زودی…</h2>
                <p className="draw-card-text">
                  {ready ? "در حال حاضر قرعه‌کشی فعالی وجود ندارد." : "در حال بارگذاری…"}
                </p>
                <Link href="/admin" className="draw-card-btn">
                  ساخت قرعه‌کشی
                </Link>
              </div>
            </aside>
          )}
        </div>
      </section>

      {live.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>قرعه‌کشی‌های فعال</h2>
            <Link href="/draws" className="btn btn-sm">
              مشاهده همه
            </Link>
          </div>
          <div className="campaign-grid">
            {live.slice(0, 3).map((c) => (
              <CampaignCard key={c.id} store={store} campaign={c} />
            ))}
          </div>
        </section>
      )}

      <section id="how" className="section">
        <h2 className="section-title">چطور شرکت کنم؟</h2>
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

      {drawn.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>آخرین برندگان</h2>
            <Link href="/winners" className="btn btn-sm">
              همه برندگان
            </Link>
          </div>
          <div className="legend">
            {drawn.slice(0, 4).map((c) => {
              const w = winnerTicket(store, c);
              return (
                <div key={c.id} className="legend-item">
                  <span className="num-chip won">{ticketNo(c.winnerNumber!)}</span>
                  <span>
                    <strong>{w?.buyerName}</strong>
                    <span className="muted">
                      {" "}
                      · {c.title} · {faDate(c.drawnAt!)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
