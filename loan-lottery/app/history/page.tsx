"use client";

import { useDialog } from "@/components/DialogProvider";
import { useFund } from "@/components/FundProvider";
import { faDate, faNum, toman } from "@/lib/lottery";

export default function HistoryPage() {
  const { state, ready, update } = useFund();
  const { ask } = useDialog();

  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const rounds = [...state.rounds].reverse();
  const paidOut = state.rounds.reduce((sum, r) => sum + r.amount, 0);

  async function undoLast() {
    const last = state.rounds.at(-1);
    if (!last) return;
    const ok = await ask(`نتیجه دوره ${faNum(last.number)} (${last.winnerName}) لغو شود؟`, {
      confirmLabel: "لغو قرعه‌کشی",
      danger: true,
    });
    if (!ok) return;
    update((s) => ({
      ...s,
      rounds: s.rounds.slice(0, -1),
      paidIds: last.paidIds,
    }));
  }

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>سوابق قرعه‌کشی</h1>
        {rounds.length > 0 && (
          <button className="btn btn-sm btn-danger" onClick={undoLast}>
            لغو آخرین قرعه‌کشی
          </button>
        )}
      </div>

      <section className="card">
        {rounds.length === 0 ? (
          <p className="empty">هنوز قرعه‌کشی انجام نشده است.</p>
        ) : (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              مجموع وام‌های پرداخت‌شده: <strong>{toman(paidOut)}</strong>
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>دوره</th>
                    <th>تاریخ</th>
                    <th>شماره</th>
                    <th>برنده</th>
                    <th>مبلغ وام</th>
                    <th>پرداخت‌کنندگان قسط</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr key={r.id}>
                      <td>{faNum(r.number)}</td>
                      <td>{faDate(r.date)}</td>
                      <td>
                        <span className="num-chip won">{faNum(r.winnerNumber)}</span>
                      </td>
                      <td>
                        <strong>{r.winnerName}</strong>
                      </td>
                      <td>{toman(r.amount)}</td>
                      <td className="muted">{faNum(r.paidIds.length)} نفر</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}
