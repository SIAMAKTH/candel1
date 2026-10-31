"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDialog } from "@/components/DialogProvider";
import { useStore } from "@/components/StoreProvider";
import {
  emptyStore,
  faDateTime,
  faNum,
  isOpen,
  isStore,
  newId,
  parseNumber,
  prizeIcons,
  ticketsOf,
  toman,
  type PrizeIcon,
} from "@/lib/raffle";

const blankForm = {
  title: "",
  prize: "",
  ticketPrice: "",
  maxTickets: "",
  drawAt: "",
  icon: "car" as PrizeIcon,
};

export default function AdminPage() {
  const { store, ready, update, replace } = useStore();
  const { ask, notify } = useDialog();
  const [form, setForm] = useState(blankForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("");

  useEffect(() => {
    if (ready) setSiteName(store.siteName);
  }, [ready, store.siteName]);

  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const set = (key: keyof typeof blankForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function create(e: React.FormEvent) {
    e.preventDefault();
    const ticketPrice = parseNumber(form.ticketPrice);
    if (!form.title.trim()) return setFormError("عنوان قرعه‌کشی را وارد کنید.");
    if (ticketPrice <= 0) return setFormError("قیمت بلیط را وارد کنید.");
    if (!form.drawAt) return setFormError("زمان قرعه‌کشی را تعیین کنید.");
    update((s) => ({
      ...s,
      campaigns: [
        ...s.campaigns,
        {
          id: newId(),
          title: form.title.trim(),
          prize: form.prize.trim(),
          ticketPrice,
          maxTickets: parseNumber(form.maxTickets),
          drawAt: form.drawAt,
          icon: form.icon,
          createdAt: new Date().toISOString(),
          winnerNumber: null,
          drawnAt: null,
        },
      ],
    }));
    setForm(blankForm);
    setFormError(null);
  }

  async function remove(id: string, title: string) {
    const sold = ticketsOf(store, id).length;
    const ok = await ask(
      sold
        ? `«${title}» و ${faNum(sold)} بلیط فروخته‌شده آن حذف شوند؟`
        : `«${title}» حذف شود؟`,
      { confirmLabel: "حذف", danger: true },
    );
    if (!ok) return;
    update((s) => ({
      ...s,
      campaigns: s.campaigns.filter((c) => c.id !== id),
      tickets: s.tickets.filter((t) => t.campaignId !== id),
    }));
  }

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    update((s) => ({ ...s, siteName: siteName.trim() || emptyStore.siteName }));
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lucky-ticket-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isStore(parsed)) throw new Error("invalid");
      if (!(await ask("اطلاعات فعلی با فایل پشتیبان جایگزین شود؟"))) return;
      replace(parsed);
    } catch {
      notify("فایل پشتیبان معتبر نیست.");
    }
  }

  async function reset() {
    const ok = await ask("همه قرعه‌کشی‌ها و بلیط‌ها حذف شوند؟ این کار قابل بازگشت نیست.", {
      confirmLabel: "حذف همه",
      danger: true,
    });
    if (ok) replace(emptyStore);
  }

  return (
    <>
      <h1>مدیریت</h1>

      <form className="card" onSubmit={create}>
        <h2>قرعه‌کشی جدید</h2>
        <div className="admin-form">
          <label>
            عنوان
            <input id="c-title" value={form.title} onChange={set("title")} placeholder="مثلاً: قرعه‌کشی پژو ۲۰۷" />
          </label>
          <label>
            توضیح جایزه
            <input id="c-prize" value={form.prize} onChange={set("prize")} placeholder="مثلاً: یک دستگاه پژو ۲۰۷ صفر کیلومتر" />
          </label>
          <label>
            قیمت هر بلیط (تومان)
            <input id="c-price" value={form.ticketPrice} onChange={set("ticketPrice")} inputMode="numeric" />
          </label>
          <label>
            حداکثر تعداد بلیط (خالی = نامحدود)
            <input id="c-max" value={form.maxTickets} onChange={set("maxTickets")} inputMode="numeric" />
          </label>
          <label>
            زمان قرعه‌کشی
            <input id="c-draw-at" type="datetime-local" value={form.drawAt} onChange={set("drawAt")} dir="ltr" />
          </label>
          <label>
            نوع جایزه
            <select id="c-icon" value={form.icon} onChange={set("icon")}>
              {prizeIcons.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button className="btn btn-primary" type="submit">
          ساخت قرعه‌کشی
        </button>
      </form>

      <section className="card">
        <h2>قرعه‌کشی‌ها</h2>
        {store.campaigns.length === 0 ? (
          <p className="empty">هنوز قرعه‌کشی‌ای ساخته نشده است.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>قیمت بلیط</th>
                  <th>فروش</th>
                  <th>درآمد</th>
                  <th>زمان قرعه‌کشی</th>
                  <th>وضعیت</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {store.campaigns.map((c) => {
                  const sold = ticketsOf(store, c.id).length;
                  return (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/draws/${c.id}`}>
                          <strong>{c.title}</strong>
                        </Link>
                      </td>
                      <td>{toman(c.ticketPrice)}</td>
                      <td>
                        {faNum(sold)}
                        {c.maxTickets ? ` / ${faNum(c.maxTickets)}` : ""}
                      </td>
                      <td>{toman(sold * c.ticketPrice)}</td>
                      <td className="muted">{c.drawAt ? faDateTime(c.drawAt) : "—"}</td>
                      <td>
                        <span className={`badge ${isOpen(c) ? "" : "badge-win"}`}>
                          {isOpen(c) ? "در حال فروش" : "قرعه‌کشی شد"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(c.id, c.title)}>
                          حذف
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <form className="card" onSubmit={saveName}>
        <h2>نام سایت</h2>
        <div className="row">
          <input
            id="site-name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <button className="btn btn-primary" type="submit">
            ذخیره
          </button>
        </div>
      </form>

      <section className="card">
        <h2>پشتیبان‌گیری</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          اطلاعات فقط در این مرورگر ذخیره می‌شود. برای انتقال یا جلوگیری از گم شدن اطلاعات،
          فایل پشتیبان بگیرید.
        </p>
        <div className="row">
          <button className="btn" onClick={exportBackup}>
            دریافت فایل پشتیبان
          </button>
          <label className="btn" style={{ flexDirection: "row", color: "var(--text)" }}>
            بازیابی از فایل
            <input id="restore-file" type="file" accept="application/json" onChange={importBackup} hidden />
          </label>
          <button className="btn btn-danger" onClick={reset}>
            حذف همه اطلاعات
          </button>
        </div>
      </section>
    </>
  );
}
