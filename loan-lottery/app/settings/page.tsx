"use client";

import { useEffect, useState } from "react";
import { useFund } from "@/components/FundProvider";
import { emptyState, faNum, isFundState, parseNumber } from "@/lib/lottery";

export default function SettingsPage() {
  const { state, ready, update, replace } = useFund();
  const [fundName, setFundName] = useState("");
  const [contribution, setContribution] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setFundName(state.settings.fundName);
    setContribution(faNum(state.settings.contribution));
  }, [ready, state.settings]);

  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  function save(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseNumber(contribution);
    if (amount <= 0) {
      alert("مبلغ قسط معتبر نیست.");
      return;
    }
    update((s) => ({
      ...s,
      settings: { fundName: fundName.trim() || emptyState.settings.fundName, contribution: amount },
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loan-lottery-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isFundState(parsed)) throw new Error("invalid");
      if (!confirm("اطلاعات فعلی با فایل پشتیبان جایگزین شود؟")) return;
      replace(parsed);
    } catch {
      alert("فایل پشتیبان معتبر نیست.");
    }
  }

  function reset() {
    if (!confirm("همه اعضا و سوابق حذف شوند؟ این کار قابل بازگشت نیست.")) return;
    replace(emptyState);
  }

  return (
    <>
      <h1>تنظیمات</h1>

      <form className="card" onSubmit={save}>
        <h2>مشخصات صندوق</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <label>
            نام صندوق
            <input value={fundName} onChange={(e) => setFundName(e.target.value)} />
          </label>
          <label>
            قسط ماهانه هر سهم (تومان)
            <input
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              onBlur={() => setContribution(faNum(parseNumber(contribution)))}
              inputMode="numeric"
            />
          </label>
          <div className="row">
            <button className="btn btn-primary" type="submit">
              ذخیره
            </button>
            {saved && <span className="muted">ذخیره شد ✓</span>}
          </div>
        </div>
      </form>

      <section className="card">
        <h2>پشتیبان‌گیری</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          اطلاعات فقط در این مرورگر ذخیره می‌شود. برای انتقال به دستگاه دیگر یا جلوگیری
          از گم شدن اطلاعات، فایل پشتیبان بگیرید.
        </p>
        <div className="row">
          <button className="btn" onClick={exportBackup}>
            دریافت فایل پشتیبان
          </button>
          <label className="btn" style={{ flexDirection: "row", color: "var(--text)" }}>
            بازیابی از فایل
            <input
              type="file"
              accept="application/json"
              onChange={importBackup}
              hidden
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>شروع دوباره</h2>
        <button className="btn btn-danger" onClick={reset}>
          حذف همه اطلاعات
        </button>
      </section>
    </>
  );
}
