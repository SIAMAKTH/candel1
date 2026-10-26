"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFund } from "@/components/FundProvider";
import {
  draw,
  eligibleEntries,
  faNum,
  loanAmount,
  toman,
  totalShares,
  type Round,
} from "@/lib/lottery";

const SPIN_MS = 3200;

export default function DrawPage() {
  const { state, ready, update } = useFund();
  const [display, setDisplay] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Round | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const { members, rounds, paidIds } = state;
  const shares = totalShares(members);
  const entries = eligibleEntries(members, rounds);
  const finished = members.length > 0 && entries.length === 0;
  const unpaid = members.filter((m) => !paidIds.includes(m.id));

  function togglePaid(id: string) {
    update((s) => ({
      ...s,
      paidIds: s.paidIds.includes(id)
        ? s.paidIds.filter((p) => p !== id)
        : [...s.paidIds, id],
    }));
  }

  function setAllPaid(paid: boolean) {
    update((s) => ({ ...s, paidIds: paid ? s.members.map((m) => m.id) : [] }));
  }

  function startDraw() {
    if (
      unpaid.length > 0 &&
      !confirm(
        `${faNum(unpaid.length)} نفر هنوز قسط این دوره را پرداخت نکرده‌اند. قرعه‌کشی انجام شود؟`,
      )
    )
      return;

    const round = draw(state);
    const names = entries.map((e) => e.name);
    setWinner(null);
    setSpinning(true);

    // Cycle through names, slowing down towards the end.
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= SPIN_MS) {
        setDisplay(round.winnerName);
        setSpinning(false);
        setWinner(round);
        update((s) => ({ ...s, rounds: [...s.rounds, round], paidIds: [] }));
        return;
      }
      setDisplay(names[Math.floor(Math.random() * names.length)]);
      const progress = elapsed / SPIN_MS;
      timer.current = setTimeout(tick, 50 + progress * progress * 300);
    };
    tick();
  }

  return (
    <>
      <h1>قرعه‌کشی دوره {faNum(Math.min(rounds.length + 1, shares || 1))}</h1>

      <div className="stats">
        <Stat label="تعداد اعضا" value={faNum(members.length)} />
        <Stat label="تعداد سهم‌ها" value={faNum(shares)} />
        <Stat label="مبلغ هر وام" value={toman(loanAmount(state))} />
        <Stat
          label="دوره‌های انجام‌شده"
          value={`${faNum(rounds.length)} از ${faNum(shares)}`}
        >
          <div className="progress">
            <div style={{ width: `${shares ? (rounds.length / shares) * 100 : 0}%` }} />
          </div>
        </Stat>
      </div>

      {members.length === 0 ? (
        <div className="card empty">
          هنوز عضوی ثبت نشده است.
          <div style={{ marginTop: 12 }}>
            <Link href="/members" className="btn btn-primary">
              افزودن اعضا
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="card stage">
            <div
              className={`reel ${spinning ? "spinning" : ""} ${winner ? "winner" : ""}`}
              aria-live="polite"
            >
              {display ?? (finished ? "🎉" : "؟")}
            </div>
            {winner && !spinning && (
              <p>
                <strong>{winner.winnerName}</strong> برنده وام{" "}
                <strong>{toman(winner.amount)}</strong> در دوره{" "}
                {faNum(winner.number)} شد.
              </p>
            )}
            {finished ? (
              <p className="muted">
                همه سهم‌ها وام خود را دریافت کرده‌اند. دوره صندوق به پایان رسید.
              </p>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={startDraw}
                disabled={spinning}
              >
                {spinning ? "در حال قرعه‌کشی…" : "شروع قرعه‌کشی"}
              </button>
            )}
            {!finished && (
              <p className="muted" style={{ marginBottom: 0 }}>
                {faNum(entries.length)} سهم در قرعه‌کشی شرکت دارند
              </p>
            )}
          </section>

          {!finished && (
            <section className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h2>
                  پرداخت قسط این دوره ({faNum(members.length - unpaid.length)} از{" "}
                  {faNum(members.length)})
                </h2>
                <div className="row">
                  <button className="btn btn-sm" onClick={() => setAllPaid(true)}>
                    همه پرداخت کردند
                  </button>
                  <button className="btn btn-sm" onClick={() => setAllPaid(false)}>
                    پاک کردن
                  </button>
                </div>
              </div>
              <div className="pay-list">
                {members.map((m) => {
                  const paid = paidIds.includes(m.id);
                  return (
                    <label key={m.id} className={`pay-item ${paid ? "paid" : ""}`}>
                      <input
                        type="checkbox"
                        checked={paid}
                        onChange={() => togglePaid(m.id)}
                      />
                      <span>
                        {m.name}
                        <span className="muted">
                          {" "}
                          · {toman(m.shares * state.settings.contribution)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {children}
    </div>
  );
}
