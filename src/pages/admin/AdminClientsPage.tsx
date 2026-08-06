import { useMemo, useState } from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineUsers } from "react-icons/hi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import SearchInput from "../../components/admin/SearchInput";
import StatusPill from "../../components/admin/StatusPill";
import EmptyState from "../../components/admin/EmptyState";
import Button from "../../components/ui/Button";
import CustomerProfileDrawer from "../../components/admin/CustomerProfileDrawer";
import { useSalonData } from "../../hooks/useSalonData";
import { services } from "../../data/services";
import type { Customer } from "../../types/salon";
import { formatCurrency } from "../../utils/format";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function favoriteServiceName(customer: Customer) {
  return services.find((s) => s.id === customer.favoriteServiceId)?.name ?? "—";
}

export default function AdminClientsPage() {
  const { customers } = useSalonData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          query.trim() === "" ||
          c.fullName.toLowerCase().includes(query.toLowerCase()) ||
          (c.email ?? "").toLowerCase().includes(query.toLowerCase())
      ),
    [customers, query]
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Clients" subtitle={`${customers.length} people in your client book`} />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by name or email…"
        className="w-full sm:w-80"
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="text-left bg-sand-light rounded-2xl border border-blush/60 p-6 flex flex-col gap-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-sm shrink-0">
                  {initials(c.fullName)}
                </div>
                <div>
                  <p className="font-medium text-ink">{c.fullName}</p>
                  <p className="text-xs text-ink/50">{favoriteServiceName(c)}</p>
                </div>
              </div>
              <StatusPill status={c.status} />
            </div>

            <div className="flex flex-col gap-1.5 text-sm text-ink/70">
              <span className="flex items-center gap-2">
                <HiOutlineMail className="text-ink/40 shrink-0" /> {c.email ?? "—"}
              </span>
              <span className="flex items-center gap-2">
                <HiOutlinePhone className="text-ink/40 shrink-0" /> {c.phone}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-blush/40 text-center">
              <div>
                <p className="font-display text-lg text-ink">{c.visits}</p>
                <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Visits</p>
              </div>
              <div>
                <p className="font-display text-lg text-ink">{formatCurrency(c.totalSpend)}</p>
                <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Spend</p>
              </div>
              <div>
                <p className="font-display text-sm text-ink pt-1.5">{c.lastVisit ?? "—"}</p>
                <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Last visit</p>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState
              icon={HiOutlineUsers}
              title="No clients found"
              subtitle="Try a different name or email."
              action={
                <Button size="sm" variant="secondary" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              }
            />
          </div>
        )}
      </div>

      {selected && <CustomerProfileDrawer customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
