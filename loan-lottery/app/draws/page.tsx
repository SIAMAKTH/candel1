"use client";

import Link from "next/link";
import { CampaignCard } from "@/components/CampaignCard";
import { useStore } from "@/components/StoreProvider";
import { isOpen } from "@/lib/raffle";

export default function DrawsPage() {
  const { store, ready } = useStore();
  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const live = store.campaigns.filter(isOpen);
  const done = store.campaigns.filter((c) => !isOpen(c));

  return (
    <>
      <h1>قرعه‌کشی‌ها</h1>
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
