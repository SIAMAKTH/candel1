"use client";

import Link from "next/link";
import { CampaignCard } from "@/components/CampaignCard";
import { Countdown } from "@/components/Countdown";
import {
  CheckIcon,
  MegaphoneIcon,
  PhoneIcon,
  ShieldIcon,
  TicketIcon,
  TrophyIcon,
} from "@/components/Icons";
import { PrizeArt } from "@/components/PrizeArt";
import { useStore } from "@/components/StoreProvider";
import {
  faDate,
  faNum,
  isOpen,
  prizeIcons,
  ticketNo,
  ticketsOf,
  toman,
  winnerTicket,
  type Campaign,
} from "@/lib/raffle";

const steps = [
  { title: "جایزه‌ات را انتخاب کن", text: "یخچال، لباسشویی، تلویزیون یا هر قرعه‌کشی فعال دیگر." },
  { title: "بلیط بخر", text: "با نام و موبایل، چند ثانیه‌ای بلیط با شماره اختصاصی بگیر." },
  { title: "گردونه می‌چرخد", text: "در زمان اعلام‌شده، یکی از همه بلیط‌ها تصادفی انتخاب می‌شود." },
  { title: "جایزه را تحویل بگیر", text: "شماره و نام برنده در صفحه برندگان اعلام می‌شود." },
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
  const minPrice = live.length ? Math.min(...live.map((c) => c.ticketPrice)) : 0;

  const benefits = [
    { Icon: ShieldIcon, title: "شفاف و تصادفی", text: "برنده با تولید عدد تصادفی امن از بین همه بلیط‌ها انتخاب می‌شود." },
    { Icon: PhoneIcon, title: "پیگیری با موبایل", text: "با شماره موبایل، همه بلیط‌ها و نتیجه‌هایت را ببین." },
    { Icon: MegaphoneIcon, title: "اعلام عمومی برنده", text: "شماره بلیط برنده برای همه شرکت‌کننده‌ها نمایش داده می‌شود." },
    {
      Icon: TicketIcon,
      title: minPrice ? `بلیط از ${toman(minPrice)}` : "بلیط ارزان",
      text: "با هزینه‌ای کم، شانس بردن لوازم خانگی نو را داشته باش.",
    },
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">قرعه‌کشی لوازم خانگی</span>
            <h1 className="hero-title">
              با یک بلیط،
              <br />
              <span className="hero-highlight">خانه‌ات را نو کن!</span>
            </h1>
            <p className="hero-lead">
              در قرعه‌کشی یخچال، ماشین لباسشویی، تلویزیون و ده‌ها وسیله دیگر شرکت کن. بلیط
              بخر، شماره‌ات را بگیر و چرخش گردونه را زنده ببین.
            </p>
            <div className="hero-actions">
              <Link
                href={featured ? `/draws/${featured.id}` : "/draws"}
                className="btn btn-cta btn-lg"
              >
                <TicketIcon size={20} /> خرید بلیط
              </Link>
              <Link href="/draws" className="btn btn-ghost-light btn-lg">
                همه قرعه‌کشی‌ها
              </Link>
            </div>
            <dl className="hero-stats">
              <div>
                <dt>قرعه‌کشی فعال</dt>
                <dd>{faNum(live.length)}</dd>
              </div>
              <div>
                <dt>بلیط فروخته‌شده</dt>
                <dd>{faNum(store.tickets.length)}</dd>
              </div>
              <div>
                <dt>برنده تا امروز</dt>
                <dd>{faNum(drawn.length)}</dd>
              </div>
            </dl>
          </div>

          <div className="hero-visual">
            <span className="shape shape-circle" aria-hidden />
            <span className="shape shape-square" aria-hidden />
            {featured ? (
              <aside className="draw-card">
                <div className="float-badge float-badge-sun">
                  <TicketIcon size={16} />
                  <span>
                    <strong>{faNum(ticketsOf(store, featured.id).length)} بلیط</strong> در این قرعه‌کشی
                  </span>
                </div>
                <div className="draw-card-art">
                  <span className="live-pill">
                    <span className="live-dot" /> زنده
                  </span>
                  <PrizeArt icon={featured.icon} className="draw-card-svg" />
                </div>
                <div className="draw-card-body">
                  <h2 className="draw-card-title">{featured.title}</h2>
                  <p className="draw-card-text">
                    {featured.prize} · بلیط {toman(featured.ticketPrice)}
                  </p>
                  <Countdown target={featured.drawAt} />
                  <Link href={`/draws/${featured.id}`} className="btn btn-cta btn-block">
                    همین حالا بلیط بخر
                  </Link>
                </div>
                {latestTicket && (
                  <div className="float-badge float-badge-mint">
                    <CheckIcon size={16} />
                    <span>
                      بلیط <strong>{ticketNo(latestTicket.number)}</strong> ثبت شد
                    </span>
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
                  <Link href="/admin" className="btn btn-cta btn-block">
                    ساخت قرعه‌کشی
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="cats-title">
        <h2 id="cats-title" className="section-title">
          چه جایزه‌ای می‌خواهی؟
        </h2>
        <div className="cat-grid">
          {prizeIcons.map((p) => {
            const first = live.find((c) => c.icon === p.value);
            const count = live.filter((c) => c.icon === p.value).length;
            return (
              <Link
                key={p.value}
                href={first ? `/draws/${first.id}` : "/draws"}
                className="cat-tile"
              >
                <PrizeArt icon={p.value} className="cat-art" />
                <strong>{p.label}</strong>
                <span>{count ? `${faNum(count)} قرعه‌کشی فعال` : "به‌زودی"}</span>
              </Link>
            );
          })}
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

      <section className="section benefits" aria-label="چرا خانه شانس">
        {benefits.map(({ Icon, title, text }) => (
          <div key={title} className="benefit">
            <span className="benefit-icon">
              <Icon size={24} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

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
          <div className="winner-strip">
            {drawn.slice(0, 4).map((c) => {
              const w = winnerTicket(store, c);
              return (
                <Link key={c.id} href={`/draws/${c.id}`} className="winner-chip">
                  <PrizeArt icon={c.icon} className="winner-chip-art" />
                  <span className="winner-chip-text">
                    <strong>{w?.buyerName}</strong>
                    <span>
                      {c.title} · {faDate(c.drawnAt!)}
                    </span>
                  </span>
                  <span className="num-chip won">
                    <TrophyIcon size={14} /> {ticketNo(c.winnerNumber!)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="cta-band">
        <div>
          <h2>نوبت توست که برنده شوی</h2>
          <p>قرعه‌کشی بعدی نزدیک است. همین حالا بلیط بخر.</p>
        </div>
        <Link href={featured ? `/draws/${featured.id}` : "/draws"} className="btn btn-dark btn-lg">
          <TicketIcon size={20} /> شرکت در قرعه‌کشی
        </Link>
      </section>
    </>
  );
}
