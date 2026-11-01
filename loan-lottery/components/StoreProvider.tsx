"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { emptyStore, isStore, type Store } from "@/lib/raffle";

const STORAGE_KEY = "home-appliance-raffle:v1";

type StoreContextValue = {
  store: Store;
  ready: boolean;
  update: (fn: (s: Store) => Store) => void;
  replace: (s: Store) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  children,
  initialStore = emptyStore,
}: {
  children: React.ReactNode;
  // Used when nothing is saved yet.
  initialStore?: Store;
}) {
  const [store, setStore] = useState<Store>(initialStore);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isStore(parsed)) setStore(parsed);
      }
    } catch {
      // Storage unavailable or corrupt: start fresh.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Ignore quota / private mode errors.
    }
  }, [store, ready]);

  return (
    <StoreContext.Provider value={{ store, ready, update: setStore, replace: setStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
