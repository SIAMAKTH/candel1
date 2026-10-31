"use client";

import { useEffect, useState } from "react";
import { faNum } from "@/lib/lottery";

const UNITS: [string, number][] = [
  ["روز", 86_400_000],
  ["ساعت", 3_600_000],
  ["دقیقه", 60_000],
  ["ثانیه", 1000],
];

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const end = new Date(target).getTime();
  if (!target || Number.isNaN(end)) {
    return <p className="countdown-note">زمان قرعه‌کشی بعدی هنوز تعیین نشده است.</p>;
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
