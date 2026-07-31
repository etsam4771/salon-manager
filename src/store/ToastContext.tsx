import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

export type ToastKind = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const kindStyles: Record<ToastKind, string> = {
  success: "bg-forest text-sand-light",
  error: "bg-red-600 text-white",
  warning: "bg-gold text-ink",
  info: "bg-ink text-sand-light",
};

let nextId = 1;

function Toast({ item, onDone }: { item: ToastItem; onDone: (id: number) => void }) {
  const [entered, setEntered] = useState(false);

  // Flip a class one tick after mount so the transition actually animates
  // in, then auto-dismiss after 3s.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const timer = setTimeout(() => onDone(item.id), 3000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="status"
      className={`pointer-events-auto min-w-[240px] max-w-sm rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-300 ${
        kindStyles[item.kind]
      } ${entered ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
    >
      {item.message}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, kind }]);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDone={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
