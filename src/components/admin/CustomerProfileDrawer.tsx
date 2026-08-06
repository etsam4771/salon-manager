import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineHeart,
  HiOutlinePencilAlt,
  HiOutlineReceiptTax,
} from "react-icons/hi";
import type { Customer } from "../../types/salon";
import { useSalonData } from "../../hooks/useSalonData";
import { useToast } from "../../hooks/useToast";
import { loyaltyPointsFor } from "../../utils/loyalty";
import { formatCurrency, formatDate, formatTime } from "../../utils/format";

const TABS = ["Visit History", "Preferences", "Notes & Formulas", "Invoices"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface CustomerProfileDrawerProps {
  customer: Customer;
  onClose: () => void;
}

export default function CustomerProfileDrawer({ customer, onClose }: CustomerProfileDrawerProps) {
  const { appointments, invoices, updateCustomerNotes } = useSalonData();
  const { showToast } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Visit History");
  const [notesDraft, setNotesDraft] = useState(customer.notes ?? "");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const visits = useMemo(
    () =>
      appointments
        .filter((a) => a.customerId === customer.id)
        .sort((a, b) => (a.startTime < b.startTime ? 1 : -1)),
    [appointments, customer.id]
  );

  const customerInvoices = useMemo(
    () =>
      invoices
        .filter((i) => i.customerId === customer.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [invoices, customer.id]
  );

  const preferredServices = useMemo(() => {
    const counts = new Map<string, number>();
    visits.forEach((v) => counts.set(v.serviceName, (counts.get(v.serviceName) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [visits]);

  function saveNotes() {
    updateCustomerNotes(customer.id, notesDraft);
    showToast("Notes saved.", "success");
  }

  return (
    <div className="fixed inset-0 z-[95] flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        className={`relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-blush/60">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-ink/40 hover:text-ink"
            aria-label="Close"
          >
            <HiOutlineX size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-lg shrink-0">
              {initials(customer.fullName)}
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl text-ink truncate">{customer.fullName}</p>
              <p className="text-xs text-ink/50 truncate">{customer.email ?? customer.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-blush/40 text-center">
            <div>
              <p className="font-display text-lg text-ink">{formatCurrency(customer.totalSpend)}</p>
              <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Total spend</p>
            </div>
            <div>
              <p className="font-display text-lg text-ink flex items-center justify-center gap-1">
                <HiOutlineHeart className="text-blush-dark" size={14} />
                {loyaltyPointsFor(customer)}
              </p>
              <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Loyalty pts</p>
            </div>
            <div>
              <p className="font-display text-lg text-ink">{customer.visits}</p>
              <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Visits</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-3 text-xs text-ink/60">
            {customer.email && (
              <span className="flex items-center gap-1.5">
                <HiOutlineMail size={13} className="text-ink/40" /> {customer.email}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <HiOutlinePhone size={13} className="text-ink/40" /> {customer.phone}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-blush/60 px-2 overflow-x-auto shrink-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? "border-forest text-forest" : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "Visit History" && (
            <div className="flex flex-col gap-3">
              {visits.length === 0 && <p className="text-sm text-ink/40 text-center py-8">No visits recorded yet.</p>}
              {visits.map((v) => (
                <div key={v.id} className="rounded-xl bg-sand p-3 flex items-start gap-3">
                  <HiOutlineClock className="text-ink/40 mt-0.5 shrink-0" size={15} />
                  <div className="min-w-0">
                    <p className="text-sm text-ink">{v.serviceName}</p>
                    <p className="text-xs text-ink/50 mt-0.5">
                      {formatDate(v.startTime)} · {formatTime(v.startTime)} · with {v.staffName ?? "Unassigned"}
                    </p>
                  </div>
                  <span className="ml-auto text-sm text-ink/70 shrink-0">{formatCurrency(v.finalPrice)}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "Preferences" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink/70">
                Favorite: <span className="text-ink font-medium">{preferredServices[0]?.[0] ?? "—"}</span>
              </p>
              {preferredServices.length === 0 ? (
                <p className="text-sm text-ink/40 text-center py-8">No service history yet.</p>
              ) : (
                preferredServices.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-ink/70">{name}</span>
                    <span className="text-ink/40 font-mono text-xs">
                      {count} visit{count === 1 ? "" : "s"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "Notes & Formulas" && (
            <div className="flex flex-col gap-3">
              <label className="text-sm text-ink/70 flex items-center gap-1.5">
                <HiOutlinePencilAlt size={14} /> Stylist notes (color formulas, preferences, allergies…)
              </label>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={8}
                placeholder="e.g. Hair dye formula #4B, prefers unscented products…"
                className="w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors resize-none"
              />
              <button
                onClick={saveNotes}
                className="self-start px-4 py-2 rounded-full text-sm font-medium bg-forest text-sand-light hover:bg-forest-dark transition-colors"
              >
                Save notes
              </button>
            </div>
          )}

          {tab === "Invoices" && (
            <div className="flex flex-col gap-3">
              {customerInvoices.length === 0 && (
                <p className="text-sm text-ink/40 text-center py-8 flex flex-col items-center gap-2">
                  <HiOutlineReceiptTax size={20} className="text-ink/30" />
                  No POS invoices for this client yet.
                </p>
              )}
              {customerInvoices.map((inv) => (
                <div key={inv.id} className="rounded-xl bg-sand p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink">{inv.items.map((l) => l.description).join(", ")}</span>
                    <span className="text-ink/70">{formatCurrency(inv.totalAmount)}</span>
                  </div>
                  <p className="text-xs text-ink/50 mt-1">
                    {new Date(inv.createdAt).toLocaleDateString()} · {inv.payments[0]?.method ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
