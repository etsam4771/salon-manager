import { useMemo, useState } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { Link } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import SearchInput from "../../components/admin/SearchInput";
import StatusPill from "../../components/admin/StatusPill";
import Button from "../../components/ui/Button";
import { useSalonData } from "../../hooks/useSalonData";
import type { BookingStatus } from "../../data/bookings";

const statusFilters: Array<BookingStatus | "All"> = [
  "All",
  "Confirmed",
  "In progress",
  "Pending",
  "Completed",
  "Cancelled",
];

export default function AdminBookingsPage() {
  const { bookings } = useSalonData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("All");

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = status === "All" || b.status === status;
      const servicesText = b.services.join(", ").toLowerCase();
      const matchesQuery =
        query.trim() === "" ||
        b.client.toLowerCase().includes(query.toLowerCase()) ||
        servicesText.includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [bookings, query, status]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Bookings"
        subtitle={`${bookings.length} appointments on the books`}
        action={
          <Link to="/admin/bookings/new">
            <Button size="sm" className="gap-1.5">
              <HiOutlinePlus /> New booking
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by client or service…"
          className="w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                status === s
                  ? "bg-forest text-sand-light border-forest"
                  : "border-blush text-ink/60 hover:border-forest/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-sand-light rounded-2xl border border-blush/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/50 border-b border-blush/60 font-mono text-xs uppercase tracking-wide">
                <th className="py-4 px-6 font-normal">Client</th>
                <th className="py-4 px-6 font-normal">Services</th>
                <th className="py-4 px-6 font-normal">Stylist</th>
                <th className="py-4 px-6 font-normal">Date</th>
                <th className="py-4 px-6 font-normal">Time</th>
                <th className="py-4 px-6 font-normal">Price</th>
                <th className="py-4 px-6 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-blush/30 last:border-0 hover:bg-sand/40">
                  <td className="py-3.5 px-6 font-medium text-ink">{b.client}</td>
                  <td className="py-3.5 px-6 text-ink/70">{b.services.join(", ")}</td>
                  <td className="py-3.5 px-6 text-ink/70">{b.stylist}</td>
                  <td className="py-3.5 px-6 text-ink/70 font-mono text-xs">{b.date}</td>
                  <td className="py-3.5 px-6 text-ink/70 font-mono text-xs">{b.time}</td>
                  <td className="py-3.5 px-6 text-ink/70">{b.price}</td>
                  <td className="py-3.5 px-6">
                    <StatusPill status={b.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink/50">
                    No bookings match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
