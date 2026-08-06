import { useMemo, useState } from "react";
import { HiOutlineDownload, HiOutlinePrinter, HiOutlineTrendingUp, HiOutlineUserGroup, HiOutlineTicket } from "react-icons/hi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatCard from "../../components/admin/StatCard";
import { useSalonData } from "../../hooks/useSalonData";
import { stylists } from "../../data/stylists";
import { services } from "../../data/services";
import { useToast } from "../../hooks/useToast";
import { appointmentStatusLabel, formatCurrency, formatDate, formatTime } from "../../utils/format";

const serviceNames = services.map((s) => s.name);

export default function AdminReportsPage() {
  const { appointments, customers } = useSalonData();
  const { showToast } = useToast();

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [staffFilter, setStaffFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");

  const filtered = useMemo(
    () =>
      appointments.filter((a) => {
        const day = formatDate(a.startTime);
        if (dateStart && day < dateStart) return false;
        if (dateEnd && day > dateEnd) return false;
        if (staffFilter !== "All" && a.staffName !== staffFilter) return false;
        if (serviceFilter !== "All" && !a.serviceName.includes(serviceFilter)) return false;
        return true;
      }),
    [appointments, dateStart, dateEnd, staffFilter, serviceFilter]
  );

  const revenueAppointments = useMemo(() => filtered.filter((a) => a.status !== "cancelled"), [filtered]);
  const totalRevenue = revenueAppointments.reduce((sum, a) => sum + a.finalPrice, 0);

  const revenueByDate = useMemo(() => {
    const map = new Map<string, number>();
    revenueAppointments.forEach((a) => {
      const day = formatDate(a.startTime);
      map.set(day, (map.get(day) ?? 0) + a.finalPrice);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [revenueAppointments]);

  const servicePopularity = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((a) => counts.set(a.serviceName, (counts.get(a.serviceName) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [filtered]);

  const retentionRate = useMemo(() => {
    if (customers.length === 0) return 0;
    const repeat = customers.filter((c) => c.visits > 1).length;
    return Math.round((repeat / customers.length) * 100);
  }, [customers]);

  const maxRevenue = Math.max(1, ...revenueByDate.map(([, v]) => v));
  const maxServiceCount = Math.max(1, ...servicePopularity.map(([, v]) => v));

  function exportCsv() {
    if (filtered.length === 0) {
      showToast("No bookings match these filters.", "warning");
      return;
    }
    const header = "Appointment ID,Client,Service,Stylist,Date,Time,Price,Status";
    const rows = filtered.map((a) =>
      [
        a.id,
        a.customerName,
        `"${a.serviceName}"`,
        a.staffName ?? "Unassigned",
        formatDate(a.startTime),
        formatTime(a.startTime),
        a.finalPrice,
        appointmentStatusLabel(a.status),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "salon-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Report exported as CSV.", "success");
  }

  function exportPdf() {
    if (filtered.length === 0) {
      showToast("No bookings match these filters.", "warning");
      return;
    }
    window.print();
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Reports & Analytics"
        subtitle="Filter by date, staff, or service to drill into performance"
        action={
          <div className="flex gap-2">
            <button
              onClick={exportPdf}
              className="flex items-center gap-1.5 text-sm border border-blush rounded-full px-4 py-2 text-ink/70 hover:border-forest hover:text-forest transition-colors"
            >
              <HiOutlinePrinter size={15} /> Export PDF
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 text-sm border border-blush rounded-full px-4 py-2 text-ink/70 hover:border-forest hover:text-forest transition-colors"
            >
              <HiOutlineDownload size={15} /> Export Excel (CSV)
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-ink/50 uppercase tracking-wide font-mono">From</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-blush px-3 py-2 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="text-xs text-ink/50 uppercase tracking-wide font-mono">To</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-blush px-3 py-2 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="text-xs text-ink/50 uppercase tracking-wide font-mono">Staff</label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-blush px-3 py-2 text-sm outline-none focus:border-forest bg-white"
          >
            <option>All</option>
            {stylists.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/50 uppercase tracking-wide font-mono">Service</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-blush px-3 py-2 text-sm outline-none focus:border-forest bg-white"
          >
            <option>All</option>
            {serviceNames.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <StatCard label="Revenue in range" value={formatCurrency(totalRevenue)} icon={HiOutlineTrendingUp} />
        <StatCard label="Bookings in range" value={String(filtered.length)} icon={HiOutlineTicket} />
        <StatCard label="Customer retention" value={`${retentionRate}%`} icon={HiOutlineUserGroup} delta="Clients with 2+ visits" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
          <h2 className="font-display text-xl text-ink mb-6">Revenue trend</h2>
          {revenueByDate.length === 0 ? (
            <p className="text-sm text-ink/40 text-center py-12">No revenue in this range.</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {revenueByDate.map(([date, amount]) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full rounded-t-lg bg-forest/85"
                    style={{ height: `${(amount / maxRevenue) * 100}%` }}
                    title={formatCurrency(amount)}
                  />
                  <span className="text-[10px] text-ink/50 font-mono">{date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-forest text-sand-light rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-xl mb-6">Service popularity</h2>
          {servicePopularity.length === 0 ? (
            <p className="text-sm text-sand-light/60 text-center py-12">No services in this range.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {servicePopularity.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="truncate">{name}</span>
                    <span className="font-mono text-gold-light shrink-0">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-sand-light/15 overflow-hidden">
                    <div
                      className="h-full bg-gold-light rounded-full"
                      style={{ width: `${(count / maxServiceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
