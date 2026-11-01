"use client";

import Link from "next/link";
import { CampaignCard } from "@/components/CampaignCard";
import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { isOpen, prizeIcons, type PrizeIcon } from "@/lib/raffle";

export default function DrawsPage() {
  const { store, ready } = useStore();
  const [filter, setFilter] = useState<PrizeIcon | "all">("all");
  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const shown = store.campaigns.filter((c) => filter === "all" || c.icon === filter);
  const live = shown.filter(isOpen);
  const done = shown.filter((c) => !isOpen(c));
  const used = prizeIcons.filter((p) => store.campaigns.some((c) => c.icon === p.value));

  return (
    <>
      <h1>قرعه‌کشی‌ها</h1>
      {used.length > 1 && (
        <div className="chips" role="group" aria-label="فیلتر بر اساس نوع جایزه">
          {[{ value: "all" as const, label: "همه" }, ...used].map((p) => (
            <button
              key={p.value}
              type="button"
              className="chip"
              aria-pressed={filter === p.value}
              onClick={() => setFilter(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      {store.campaigns.length > 0 && shown.length === 0 && (
        <p className="card empty">قرعه‌کشی‌ای از این نوع وجود ندارد.</p>
      )}
      {store.campaigns.length === 0 && (
        <div className="card empty">
          هنوز قرعه‌کشی‌ای ساخته نشده است.
          <div style={{ marginTop: 12 }}>
            <Link href="/admin" className="btn btn-primary">
              ساخت قرعه‌کشی
            </Link>
          </div>
        </div>
      )}
      {live.length > 0 && (
        <section className="section">
          <h2>در حال فروش</h2>
          <div className="campaign-grid">
            {live.map((c) => (
              <CampaignCard key={c.id} store={store} campaign={c} />
            ))}
          </div>
        </section>
      )}
      {done.length > 0 && (
        <section className="section">
          <h2>پایان‌یافته</h2>
          <div className="campaign-grid">
            {done.map((c) => (
              <CampaignCard key={c.id} store={store} campaign={c} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
