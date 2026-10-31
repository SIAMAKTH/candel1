"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { faNum, normalizePhone, ticketNo } from "@/lib/raffle";

export default function MyTicketsPage() {
  const { store, ready } = useStore();
  const [input, setInput] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  function search(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizePhone(input);
    setError(normalized ? null : "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
    setPhone(normalized);
  }

  const mine = phone ? store.tickets.filter((t) => t.phone === phone) : [];
  const groups = store.campaigns
    .map((c) => ({ campaign: c, tickets: mine.filter((t) => t.campaignId === c.id) }))
    .filter((g) => g.tickets.length > 0);

  return (
    <>
      <h1>بلیط‌های من</h1>
      <form className="card search-form" onSubmit={search}>
        <label>
          شماره موبایلی که با آن بلیط خریده‌اید
          <input
            id="lookup-phone"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            inputMode="tel"
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            dir="ltr"
          />
        </label>
        <button className="btn btn-primary" type="submit">
          جستجو
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>

      {phone && groups.length === 0 && (
        <p className="card empty">با این شماره بلیطی پیدا نشد.</p>
      )}

      {groups.map(({ campaign, tickets }) => {
        const won = tickets.some((t) => t.number === campaign.winnerNumber);
        const status =
          campaign.winnerNumber === null ? "در انتظار قرعه‌کشی" : won ? "🏆 برنده شدید!" : "برنده نشدید";
        return (
          <section key={campaign.id} className={`card ${won ? "card-win" : ""}`}>
            <div className="section-head">
              <h2>
                <Link href={`/draws/${campaign.id}`}>{campaign.title}</Link>
              </h2>
              <span className={`badge ${won ? "badge-win" : ""}`}>{status}</span>
            </div>
            <p className="muted">{faNum(tickets.length)} بلیط</p>
            <div className="ticket-stubs">
              {tickets.map((t) => (
                <span
                  key={t.id}
                  className={`ticket-stub ${t.number === campaign.winnerNumber ? "is-win" : ""}`}
                >
                  {ticketNo(t.number)}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
