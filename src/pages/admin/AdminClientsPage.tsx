import { useMemo, useState } from "react";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import SearchInput from "../../components/admin/SearchInput";
import StatusPill from "../../components/admin/StatusPill";
import { clients } from "../../data/clients";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminClientsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          query.trim() === "" ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Clients" subtitle={`${clients.length} people in your client book`} />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by name or email…"
        className="w-full sm:w-80"
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-sand-light rounded-2xl border border-blush/60 p-6 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-sm shrink-0">
                  {initials(c.name)}
                </div>
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink/50">{c.favoriteService}</p>
                </div>
              </div>
              <StatusPill status={c.status} />
            </div>

            <div className="flex flex-col gap-1.5 text-sm text-ink/70">
              <span className="flex items-center gap-2">
                <HiOutlineMail className="text-ink/40 shrink-0" /> {c.email}
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
                <p className="font-display text-lg text-ink">{c.totalSpend}</p>
                <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Spend</p>
              </div>
              <div>
                <p className="font-display text-sm text-ink pt-1.5">{c.lastVisit}</p>
                <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Last visit</p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 text-center text-ink/50 py-12">
            No clients match your search.
          </div>
        )}
      </div>
    </div>
  );
}
