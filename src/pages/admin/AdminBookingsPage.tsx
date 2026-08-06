import { useMemo, useState } from "react";
import { HiOutlinePlus, HiOutlineCalendar, HiOutlineViewList } from "react-icons/hi";
import { Link } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import SearchInput from "../../components/admin/SearchInput";
import StatusPill from "../../components/admin/StatusPill";
import EmptyState from "../../components/admin/EmptyState";
import AppointmentCalendar from "../../components/admin/AppointmentCalendar";
import Button from "../../components/ui/Button";
import { useSalonData } from "../../hooks/useSalonData";
import { useToast } from "../../hooks/useToast";
import type { AppointmentStatus } from "../../types/salon";
import { appointmentStatusLabel, appointmentStatusOptions, formatCurrency, formatDate, formatTime } from "../../utils/format";

const statusFilters: Array<AppointmentStatus | "All"> = ["All", ...appointmentStatusOptions];

export default function AdminBookingsPage() {
  const { appointments, rescheduleAppointment } = useSalonData();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("All");
  const [mode, setMode] = useState<"list" | "calendar">("list");

  function handleReschedule(id: string, newDate: string) {
    rescheduleAppointment(id, newDate);
    const customer = appointments.find((a) => a.id === id)?.customerName ?? "Appointment";
    showToast(`${customer}'s appointment moved to ${newDate}.`, "success");
  }

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchesStatus = status === "All" || a.status === status;
      const matchesQuery =
        query.trim() === "" ||
        a.customerName.toLowerCase().includes(query.toLowerCase()) ||
        a.serviceName.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [appointments, query, status]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Bookings"
        subtitle={`${appointments.length} appointments on the books`}
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-blush overflow-hidden">
              <button
                onClick={() => setMode("list")}
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  mode === "list" ? "bg-forest text-sand-light" : "text-ink/60 hover:bg-sand"
                }`}
              >
                <HiOutlineViewList size={14} /> List
              </button>
              <button
                onClick={() => setMode("calendar")}
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  mode === "calendar" ? "bg-forest text-sand-light" : "text-ink/60 hover:bg-sand"
                }`}
              >
                <HiOutlineCalendar size={14} /> Calendar
              </button>
            </div>
            <Link to="/admin/bookings/new">
              <Button size="sm" className="gap-1.5">
                <HiOutlinePlus /> New booking
              </Button>
            </Link>
          </div>
        }
      />

      {mode === "calendar" ? (
        <AppointmentCalendar appointments={appointments} onReschedule={handleReschedule} />
      ) : (
        <>
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
                  {s === "All" ? "All" : appointmentStatusLabel(s)}
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
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-blush/30 last:border-0 hover:bg-sand/40">
                      <td className="py-3.5 px-6 font-medium text-ink">{a.customerName}</td>
                      <td className="py-3.5 px-6 text-ink/70">{a.serviceName}</td>
                      <td className="py-3.5 px-6 text-ink/70">{a.staffName ?? "Unassigned"}</td>
                      <td className="py-3.5 px-6 text-ink/70 font-mono text-xs">{formatDate(a.startTime)}</td>
                      <td className="py-3.5 px-6 text-ink/70 font-mono text-xs">{formatTime(a.startTime)}</td>
                      <td className="py-3.5 px-6 text-ink/70">{formatCurrency(a.finalPrice)}</td>
                      <td className="py-3.5 px-6">
                        <StatusPill status={appointmentStatusLabel(a.status)} />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={HiOutlineCalendar}
                          title="No bookings found"
                          subtitle="Try a different search or status filter."
                          action={
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setQuery("");
                                setStatus("All");
                              }}
                            >
                              Clear filters
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
