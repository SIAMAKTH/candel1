"use client";

import Link from "next/link";
import { PrizeArt } from "@/components/PrizeArt";
import { useStore } from "@/components/StoreProvider";
import { faDate, faNum, isOpen, maskPhone, ticketNo, ticketsOf, winnerTicket } from "@/lib/raffle";

export default function WinnersPage() {
  const { store, ready } = useStore();
  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const drawn = store.campaigns
    .filter((c) => !isOpen(c))
    .sort((a, b) => (b.drawnAt ?? "").localeCompare(a.drawnAt ?? ""));

  return (
    <>
      <h1>برندگان</h1>
      {drawn.length === 0 ? (
        <p className="card empty">هنوز هیچ قرعه‌کشی‌ای انجام نشده است.</p>
      ) : (
        <div className="winners">
          {drawn.map((c) => {
            const w = winnerTicket(store, c);
            return (
              <Link key={c.id} href={`/draws/${c.id}`} className="winner-row card">
                <div className={`winner-row-art art-${c.icon}`}>
                  <PrizeArt icon={c.icon} />
                </div>
                <div className="winner-row-info">
                  <strong>{c.title}</strong>
                  <span className="muted">
                    {faDate(c.drawnAt!)} · بین {faNum(ticketsOf(store, c.id).length)} بلیط
                  </span>
                </div>
                <div className="winner-row-who">
                  <span className="num-chip won">{ticketNo(c.winnerNumber!)}</span>
                  <span>
                    <strong>{w?.buyerName}</strong>
                    {w && (
                      <span className="muted">
                        {" "}
                        <bdi dir="ltr">{maskPhone(w.phone)}</bdi>
                      </span>
                    )}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
