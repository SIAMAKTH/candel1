"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { emptyState, isFundState, type FundState } from "@/lib/lottery";

const STORAGE_KEY = "loan-lottery:v1";

type FundContextValue = {
  state: FundState;
  ready: boolean;
  update: (fn: (s: FundState) => FundState) => void;
  replace: (s: FundState) => void;
};

const FundContext = createContext<FundContextValue | null>(null);

export function FundProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FundState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isFundState(parsed)) setState(parsed);
      }
    } catch {
      // Storage unavailable or corrupt: start empty.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota / private mode errors.
    }
  }, [state, ready]);

  return (
    <FundContext.Provider
      value={{ state, ready, update: setState, replace: setState }}
    >
      {children}
    </FundContext.Provider>
  );
}

export function useFund(): FundContextValue {
  const ctx = useContext(FundContext);
  if (!ctx) throw new Error("useFund must be used inside FundProvider");
  return ctx;
}
