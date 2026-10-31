"use client";

import { useState } from "react";
import { useFund } from "@/components/FundProvider";
import { faNum, newId, nextNumbers, parseNumber, toman, winsOf } from "@/lib/lottery";

export default function MembersPage() {
  const { state, ready, update } = useFund();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shares, setShares] = useState("1");

  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const started = state.rounds.length > 0;

  function addMember(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const count = Math.max(1, parseNumber(shares));
    update((s) => ({
      ...s,
      members: [
        ...s.members,
        {
          id: newId(),
          name: trimmed,
          phone: phone.trim(),
          shares: count,
          numbers: nextNumbers(s.members, count),
        },
      ],
    }));
    setName("");
    setPhone("");
    setShares("1");
  }

  function removeMember(id: string, memberName: string) {
    if (winsOf(id, state.rounds) > 0) {
      alert("این عضو قبلاً وام گرفته و قابل حذف نیست.");
      return;
    }
    if (!confirm(`«${memberName}» حذف شود؟`)) return;
    update((s) => ({
      ...s,
      members: s.members.filter((m) => m.id !== id),
      paidIds: s.paidIds.filter((p) => p !== id),
    }));
  }

  return (
    <>
      <h1>اعضای صندوق</h1>

      <form className="card" onSubmit={addMember}>
        <h2>افزودن عضو</h2>
        {started && (
          <p className="muted" style={{ marginTop: 0 }}>
            قرعه‌کشی شروع شده است؛ افزودن عضو جدید مبلغ وام دوره‌های بعد را تغییر می‌دهد.
          </p>
        )}
        <div className="form-grid">
          <label>
            نام و نام خانوادگی
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            شماره تماس
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              dir="ltr"
            />
          </label>
          <label>
            تعداد سهم
            <input
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              inputMode="numeric"
            />
          </label>
          <button className="btn btn-primary" type="submit">
            افزودن
          </button>
        </div>
      </form>

      <section className="card">
        {state.members.length === 0 ? (
          <p className="empty">هنوز عضوی اضافه نشده است.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>نام</th>
                  <th>تماس</th>
                  <th>شماره قرعه</th>
                  <th>سهم</th>
                  <th>قسط ماهانه</th>
                  <th>وضعیت</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.members.map((m, i) => {
                  const wins = winsOf(m.id, state.rounds);
                  return (
                    <tr key={m.id}>
                      <td className="muted">{faNum(i + 1)}</td>
                      <td>{m.name}</td>
                      <td dir="ltr" style={{ textAlign: "right" }}>
                        {m.phone || "—"}
                      </td>
                      <td>
                        <div className="row" style={{ gap: 4 }}>
                          {m.numbers.map((n) => (
                            <span
                              key={n}
                              className={`num-chip ${state.rounds.some((r) => r.winnerNumber === n) ? "won" : ""}`}
                            >
                              {faNum(n)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{faNum(m.shares)}</td>
                      <td>{toman(m.shares * state.settings.contribution)}</td>
                      <td>
                        {wins === 0 ? (
                          <span className="badge">در انتظار</span>
                        ) : (
                          <span className="badge badge-win">
                            {faNum(wins)} از {faNum(m.shares)} وام
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeMember(m.id, m.name)}
                        >
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
    </>
  );
}
