import { useState } from "react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { useSalonData } from "../../hooks/useSalonData";
import { useToast } from "../../hooks/useToast";
import type { StaffStatus } from "../../types/salon";
import { formatCurrency } from "../../utils/format";

const TABS = ["Roster", "Commission", "Performance"] as const;

const statusStyles: Record<StaffStatus, string> = {
  Active: "bg-forest/10 text-forest",
  "On Break": "bg-gold/15 text-gold",
  "Off-duty": "bg-ink/10 text-ink/50",
};

function initials(name: string) {
  return name
    .split("")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminStaffPage() {
  const { staff, updateStaffStatus } = useSalonData();
  const { showToast } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Roster");
  console.log(staff);

  const maxRevenue = Math.max(...staff.map((s) => s.revenueGenerated));

  function cycleStatus(id: string, current: StaffStatus) {
    const order: StaffStatus[] = ["Active", "On Break", "Off-duty"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    updateStaffStatus(id, next);
    showToast(`Status updated to “${next}”.`, "info");
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Staff" subtitle={`${staff.length} team members`} />

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${tab === t
              ? "bg-forest text-sand-light border-forest"
              : "border-blush text-ink/60 hover:border-forest/40"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Roster" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {staff.map((s) => (
            <div
              key={s.id}
              className="bg-sand-light rounded-2xl border border-blush/60 p-6 flex flex-col gap-4 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-sm shrink-0">
                    {initials(s.fullName || "")}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{s.fullName}</p>
                    <p className="text-xs text-ink/50">{s.designation}</p>
                  </div>
                </div>
                <button
                  onClick={() => cycleStatus(s.id, s.status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[s.status]}`}
                  title="Click to cycle status"
                >
                  {s.status}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {s.skills.map((sv) => (
                  <span key={sv} className="text-[11px] bg-sand text-ink/60 rounded-full px-2.5 py-1">
                    {sv}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blush/40 text-center">
                <div>
                  <p className="font-display text-lg text-ink">{s.bookingsCompleted}</p>
                  <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Bookings</p>
                </div>
                <div>
                  <p className="font-display text-lg text-ink">{formatCurrency(s.revenueGenerated)}</p>
                  <p className="text-[11px] text-ink/50 uppercase tracking-wide font-mono">Revenue</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Commission" && (
        <div className="bg-sand-light rounded-2xl border border-blush/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink/50 border-b border-blush/60 font-mono text-xs uppercase tracking-wide">
                  <th className="py-4 px-6 font-normal">Staff</th>
                  <th className="py-4 px-6 font-normal">Revenue generated</th>
                  <th className="py-4 px-6 font-normal">Commission rate</th>
                  <th className="py-4 px-6 font-normal">Commission earned</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-blush/30 last:border-0">
                    <td className="py-3.5 px-6 font-medium text-ink">{s.fullName}</td>
                    <td className="py-3.5 px-6 text-ink/70">{formatCurrency(s.revenueGenerated)}</td>
                    <td className="py-3.5 px-6 text-ink/70 font-mono">{Math.round(s.commissionPct)}%</td>
                    <td className="py-3.5 px-6 text-forest font-medium">
                      {formatCurrency(Math.round((s.revenueGenerated * s.commissionPct) / 100))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Performance" && (
        <div className="bg-forest text-sand-light rounded-2xl p-6 md:p-8 flex flex-col gap-5">
          <h2 className="font-display text-xl">Revenue by staff member</h2>
          {staff
            .slice()
            .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
            .map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{s.fullName}</span>
                  <span className="font-mono text-gold-light">{formatCurrency(s.revenueGenerated)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-sand-light/15 overflow-hidden">
                  <div
                    className="h-full bg-gold-light rounded-full"
                    style={{ width: `${(s.revenueGenerated / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
