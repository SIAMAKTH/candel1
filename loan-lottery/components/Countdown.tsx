"use client";

import { useEffect, useState } from "react";
import { faNum } from "@/lib/raffle";

const UNITS: [string, number][] = [
  ["روز", 86_400_000],
  ["ساعت", 3_600_000],
  ["دقیقه", 60_000],
  ["ثانیه", 1000],
];

function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Countdown({ target }: { target: string }) {
  const now = useNow();
  const end = new Date(target).getTime();
  if (!target || Number.isNaN(end)) {
    return <p className="countdown-note">زمان قرعه‌کشی هنوز اعلام نشده است.</p>;
  }
  if (now !== null && end <= now) {
    return <p className="countdown-note">زمان قرعه‌کشی رسیده است!</p>;
  }

  let left = now === null ? 0 : end - now;
  return (
    <div className="countdown" aria-label="زمان باقی‌مانده تا قرعه‌کشی">
      {UNITS.map(([label, ms]) => {
        const value = Math.floor(left / ms);
        left -= value * ms;
        return (
          <div key={label} className="countdown-box">
            <strong>{now === null ? "–" : faNum(value)}</strong>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// "۳ روز مانده" style one-liner for cards.
export function TimeLeft({ target }: { target: string }) {
  const now = useNow();
  const end = new Date(target).getTime();
  if (!target || Number.isNaN(end) || now === null) return null;
  const left = end - now;
  if (left <= 0) return <span>زمان قرعه‌کشی رسیده</span>;
  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor(left / 3_600_000);
  return (
    <span>
      {days > 0
        ? `${faNum(days)} روز مانده`
        : hours > 0
          ? `${faNum(hours)} ساعت مانده`
          : `${faNum(Math.ceil(left / 60_000))} دقیقه مانده`}
    </span>
  );
}
