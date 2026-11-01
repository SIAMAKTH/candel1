"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Countdown } from "@/components/Countdown";
import { CheckIcon, ChevronIcon, TrophyIcon } from "@/components/Icons";
import { useDialog } from "@/components/DialogProvider";
import { PrizeArt } from "@/components/PrizeArt";
import { useStore } from "@/components/StoreProvider";
import { targetRotation, Wheel } from "@/components/Wheel";
import {
  buyTickets,
  drawWinner,
  faDateTime,
  faNum,
  isOpen,
  maskPhone,
  MAX_PER_PURCHASE,
  parseNumber,
  remaining,
  ticketNo,
  ticketsOf,
  toman,
  wheelSample,
  winnerTicket,
  type Store,
  type Ticket,
} from "@/lib/raffle";

const SPIN_MS = 7000;
const WHEEL_MAX = 24;
const LIST_MAX = 20;

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { store, ready, update } = useStore();
  const { ask } = useDialog();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [bought, setBought] = useState<Ticket[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [frozen, setFrozen] = useState<number[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const pending = useRef<Store | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (fallback.current) clearTimeout(fallback.current);
  }, []);

  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const campaign = store.campaigns.find((c) => c.id === id);
  if (!campaign) {
    return (
      <div className="card empty">
        این قرعه‌کشی پیدا نشد.
        <div style={{ marginTop: 12 }}>
          <Link href="/draws" className="btn">
            همه قرعه‌کشی‌ها
          </Link>
        </div>
      </div>
    );
  }

  const tickets = ticketsOf(store, campaign.id);
  const numbers = tickets.map((t) => t.number);
  const open = isOpen(campaign);
  const left = remaining(store, campaign);
  const winner = winnerTicket(store, campaign);
  const wheelNumbers =
    frozen ?? wheelSample(numbers, WHEEL_MAX, campaign.winnerNumber ?? undefined);
  const showWinner = !open && !spinning && (revealed || frozen === null);
  // After a reload, rest the wheel on the winning slice.
  const restRotation =
    frozen === null && campaign.winnerNumber !== null
      ? targetRotation(0, wheelNumbers.indexOf(campaign.winnerNumber), wheelNumbers.length, false) % 360
      : rotation;

  function buy(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = buyTickets(store, campaign!.id, { buyerName: name, phone, quantity });
      update(() => result.store);
      setBought(result.tickets);
      setError(null);
      setQuantity(1);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function finishSpin() {
    const next = pending.current;
    if (!next) return;
    pending.current = null;
    if (fallback.current) clearTimeout(fallback.current);
    setSpinning(false);
    setRevealed(true);
    update(() => next);
  }

  async function startDraw() {
    const ok = await ask(
      `قرعه‌کشی «${campaign!.title}» بین ${faNum(tickets.length)} بلیط انجام شود؟ بعد از آن فروش بلیط بسته می‌شود.`,
      { confirmLabel: "بچرخون" },
    );
    if (!ok) return;
    const result = drawWinner(store, campaign!.id);
    const sample = wheelSample(numbers, WHEEL_MAX, result.ticket.number);
    pending.current = result.store;
    setFrozen(sample);
    setRevealed(false);
    setSpinning(false);
    setRotation(0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setSpinning(true);
        setRotation(targetRotation(0, sample.indexOf(result.ticket.number), sample.length));
      }),
    );
    // In case transitionend never fires (hidden tab).
    fallback.current = setTimeout(finishSpin, SPIN_MS + 800);
  }

  const total = quantity * campaign.ticketPrice;
  const recentTickets = [...tickets].reverse().slice(0, showAll ? undefined : LIST_MAX);

  return (
    <>
      <p className="crumbs">
        <Link href="/draws">قرعه‌کشی‌ها</Link>
        <ChevronIcon size={14} />
        <span>{campaign.title}</span>
      </p>

      <section className="detail-head card">
        <div className={`detail-art art-${campaign.icon}`}>
          <PrizeArt icon={campaign.icon} className="detail-art-svg" />
        </div>
        <div className="detail-info">
          <span className={`status-pill ${open ? "is-live" : "is-done"}`}>
            {open ? (
              <>
                <span className="live-dot" /> در حال فروش
              </>
            ) : (
              "قرعه‌کشی شد"
            )}
          </span>
          <h1>{campaign.title}</h1>
          <p className="muted">{campaign.prize}</p>
          <div className="detail-stats">
            <div>
              <span className="stat-label">قیمت هر بلیط</span>
              <strong>{toman(campaign.ticketPrice)}</strong>
            </div>
            <div>
              <span className="stat-label">بلیط فروخته شده</span>
              <strong>
                {faNum(tickets.length)}
                {campaign.maxTickets ? ` از ${faNum(campaign.maxTickets)}` : ""}
              </strong>
            </div>
          </div>
          {open && <Countdown target={campaign.drawAt} />}
        </div>
      </section>

      <div className="detail-grid">
        {open && (
          <section className="card buy-card">
            {bought ? (
              <div className="bought">
                <h2>
                  <CheckIcon size={22} /> خرید انجام شد
                </h2>
                <p>
                  {bought[0].buyerName} عزیز، {faNum(bought.length)} بلیط به نام شما ثبت شد. شماره
                  بلیط‌ها را نگه دارید:
                </p>
                <div className="ticket-stubs">
                  {bought.map((t) => (
                    <span key={t.id} className="ticket-stub">
                      {ticketNo(t.number)}
                    </span>
                  ))}
                </div>
                <div className="row">
                  <button className="btn btn-primary" onClick={() => setBought(null)}>
                    خرید بلیط بیشتر
                  </button>
                  <Link href="/my-tickets" className="btn">
                    بلیط‌های من
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={buy} className="buy-form">
                <h2>خرید بلیط</h2>
                {left === 0 ? (
                  <p className="countdown-note">بلیط‌های این قرعه‌کشی تمام شده است.</p>
                ) : (
                  <>
                    <label>
                      نام و نام خانوادگی
                      <input
                        id="buyer-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </label>
                    <label>
                      شماره موبایل
                      <input
                        id="buyer-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                        dir="ltr"
                      />
                    </label>
                    <div>
                      <span className="stat-label">تعداد بلیط</span>
                      <div className="qty">
                        <button
                          type="button"
                          className="btn"
                          aria-label="کم کردن"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        >
                          −
                        </button>
                        <input
                          id="ticket-qty"
                          aria-label="تعداد بلیط"
                          value={faNum(quantity)}
                          onChange={(e) =>
                            setQuantity(
                              Math.min(MAX_PER_PURCHASE, Math.max(1, parseNumber(e.target.value))),
                            )
                          }
                          inputMode="numeric"
                        />
                        <button
                          type="button"
                          className="btn"
                          aria-label="زیاد کردن"
                          onClick={() =>
                            setQuantity((q) => Math.min(MAX_PER_PURCHASE, Math.min(left, q + 1)))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="total">
                      <span>مبلغ قابل پرداخت</span>
                      <strong>{toman(total)}</strong>
                    </div>
                    {error && (
                      <p className="form-error" role="alert">
                        {error}
                      </p>
                    )}
                    <button className="btn btn-cta btn-lg" type="submit">
                      پرداخت و دریافت بلیط
                    </button>
                  </>
                )}
              </form>
            )}
          </section>
        )}

        <section className="card wheel-stage">
          {tickets.length === 0 ? (
            <p className="wheel-hint">بعد از فروش اولین بلیط، شماره‌ها روی گردونه می‌آیند.</p>
          ) : (
            <>
              <Wheel
                entries={wheelNumbers.map((number) => ({ number }))}
                rotation={frozen === null ? restRotation : rotation}
                spinning={spinning}
                durationMs={SPIN_MS}
                winnerNumber={showWinner ? campaign.winnerNumber : null}
                onSpinEnd={finishSpin}
              />
              <div aria-live="polite">
                {showWinner && campaign.winnerNumber !== null && (
                  <div className="winner-card">
                    <div className="winner-num">{ticketNo(campaign.winnerNumber)}</div>
                    <div>
                      <div className="winner-name">
                        <TrophyIcon size={24} /> {winner?.buyerName ?? "—"}
                      </div>
                      <div>
                        برنده {campaign.title}
                        {winner && (
                          <>
                            {" "}
                            · <bdi dir="ltr">{maskPhone(winner.phone)}</bdi>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {open && (
                <button
                  className="btn btn-lg btn-spin"
                  onClick={startDraw}
                  disabled={spinning || pending.current !== null}
                >
                  {spinning ? "در حال چرخش…" : "انجام قرعه‌کشی"}
                </button>
              )}
              <p className="wheel-hint">
                {numbers.length > WHEEL_MAX
                  ? `${faNum(WHEEL_MAX)} شماره از ${faNum(numbers.length)} بلیط روی گردونه نمایش داده می‌شود؛ برنده از بین همه بلیط‌ها انتخاب می‌شود.`
                  : `${faNum(numbers.length)} بلیط روی گردونه`}
              </p>
            </>
          )}
        </section>
      </div>

      <section className="card">
        <h2>
          بلیط‌های فروخته شده <span className="muted">({faNum(tickets.length)})</span>
        </h2>
        {tickets.length === 0 ? (
          <p className="empty">هنوز بلیطی فروخته نشده است. اولین نفر باشید!</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>شماره بلیط</th>
                  <th>خریدار</th>
                  <th>موبایل</th>
                  <th>زمان خرید</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr key={t.id} className={t.number === campaign.winnerNumber && showWinner ? "row-win" : undefined}>
                    <td>
                      <span className="num-chip">{ticketNo(t.number)}</span>
                    </td>
                    <td>{t.buyerName}</td>
                    <td>
                      <bdi dir="ltr">{maskPhone(t.phone)}</bdi>
                    </td>
                    <td className="muted">{faDateTime(t.purchasedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tickets.length > LIST_MAX && !showAll && (
              <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAll(true)}>
                نمایش همه {faNum(tickets.length)} بلیط
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
