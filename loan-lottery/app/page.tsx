"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFund } from "@/components/FundProvider";
import { targetRotation, Wheel } from "@/components/Wheel";
import {
  draw,
  eligibleEntries,
  faNum,
  loanAmount,
  toman,
  totalShares,
  type Entry,
  type Round,
} from "@/lib/lottery";

const SPIN_MS = 6000;

export default function DrawPage() {
  const { state, ready, update } = useFund();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  // Wheel layout is frozen from spin start until the next spin, so the
  // winning slice stays visible after the round is saved.
  const [frozen, setFrozen] = useState<Entry[] | null>(null);
  const [winner, setWinner] = useState<Round | null>(null);
  const pending = useRef<Round | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (fallback.current) clearTimeout(fallback.current);
  }, []);

  if (!ready) return <p className="muted">در حال بارگذاری…</p>;

  const { members, rounds, paidIds } = state;
  const shares = totalShares(members);
  const entries = eligibleEntries(members, rounds);
  const wheelEntries = frozen ?? entries;
  const finished = members.length > 0 && entries.length === 0;
  const unpaid = members.filter((m) => !paidIds.includes(m.id));
  const allNumbers = members
    .flatMap((m) => m.numbers.map((number) => ({ number, member: m })))
    .sort((a, b) => a.number - b.number);
  const wonNumbers = new Set(rounds.map((r) => r.winnerNumber));

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

  function finishSpin() {
    const round = pending.current;
    if (!round) return;
    pending.current = null;
    if (fallback.current) clearTimeout(fallback.current);
    setSpinning(false);
    setWinner(round);
    update((s) => ({ ...s, rounds: [...s.rounds, round], paidIds: [] }));
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
    const index = entries.findIndex((e) => e.number === round.winnerNumber);
    pending.current = round;
    setWinner(null);

    // A new layout (previous winner removed) starts from rest without animating.
    const layoutChanged =
      frozen !== null &&
      frozen.map((e) => e.number).join() !== entries.map((e) => e.number).join();
    const from = layoutChanged ? 0 : rotation;
    setFrozen(entries);
    setSpinning(false);
    setRotation(from);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setSpinning(true);
        setRotation(targetRotation(from, index, entries.length));
      }),
    );
    // In case transitionend never fires (hidden tab, reduced motion).
    fallback.current = setTimeout(finishSpin, SPIN_MS + 800);
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
          <section className="card wheel-stage">
            <Wheel
              entries={wheelEntries}
              rotation={rotation}
              spinning={spinning}
              durationMs={SPIN_MS}
              winnerNumber={winner?.winnerNumber ?? null}
              onSpinEnd={finishSpin}
            />
            <div aria-live="polite">
              {winner && !spinning && (
                <div className="winner-card">
                  <div className="winner-num">{faNum(winner.winnerNumber)}</div>
                  <div>
                    <div className="winner-name">🎉 {winner.winnerName}</div>
                    <div>
                      برنده وام <strong>{toman(winner.amount)}</strong> در دوره{" "}
                      {faNum(winner.number)}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {finished && !spinning ? (
              <p className="wheel-hint">
                همه سهم‌ها وام خود را دریافت کرده‌اند. دوره صندوق به پایان رسید.
              </p>
            ) : (
              <>
                <div>
                  <button
                    className="btn btn-lg btn-spin"
                    onClick={startDraw}
                    disabled={spinning || pending.current !== null}
                  >
                    {spinning ? "در حال چرخش…" : "بچرخون!"}
                  </button>
                </div>
                <p className="wheel-hint">
                  {faNum(entries.length)} شماره روی گردونه
                </p>
              </>
            )}
          </section>

          <section className="card">
            <h2>شماره‌های قرعه</h2>
            <div className="legend">
              {allNumbers.map(({ number, member }) => {
                const won = wonNumbers.has(number);
                return (
                  <div key={number} className={`legend-item ${won ? "won" : ""}`}>
                    <span className={`num-chip ${won ? "won" : ""}`}>{faNum(number)}</span>
                    <span>{member.name}</span>
                  </div>
                );
              })}
            </div>
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
