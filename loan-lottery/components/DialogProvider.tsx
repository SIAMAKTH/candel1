"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type AskOptions = { confirmLabel?: string; danger?: boolean };

type Dialog = AskOptions & {
  message: string;
  alertOnly?: boolean;
  resolve: (ok: boolean) => void;
};

type DialogContextValue = {
  ask: (message: string, options?: AskOptions) => Promise<boolean>;
  notify: (message: string) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

// In-page replacement for window.confirm / window.alert.
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<Dialog | null>(null);

  const ask = useCallback(
    (message: string, options: AskOptions = {}) =>
      new Promise<boolean>((resolve) => setDialog({ message, ...options, resolve })),
    [],
  );

  const notify = useCallback(
    (message: string) =>
      new Promise<void>((resolve) =>
        setDialog({ message, alertOnly: true, resolve: () => resolve() }),
      ),
    [],
  );

  const close = useCallback(
    (ok: boolean) => {
      dialog?.resolve(ok);
      setDialog(null);
    },
    [dialog],
  );

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, close]);

  return (
    <DialogContext.Provider value={{ ask, notify }}>
      {children}
      {dialog && (
        <div className="dialog-backdrop" onClick={() => close(false)}>
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <p>{dialog.message}</p>
            <div className="row dialog-actions">
              {!dialog.alertOnly && (
                <button className="btn" onClick={() => close(false)}>
                  انصراف
                </button>
              )}
              <button
                autoFocus
                className={`btn ${dialog.danger ? "btn-danger" : "btn-primary"}`}
                onClick={() => close(true)}
              >
                {dialog.confirmLabel ?? (dialog.alertOnly ? "باشه" : "تأیید")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside DialogProvider");
  return ctx;
}
