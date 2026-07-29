import { HiOutlineCurrencyRupee, HiOutlineTicket, HiOutlineExclamationCircle } from "react-icons/hi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatCard from "../../components/admin/StatCard";
import { monthlyRevenue, revenueByCategory, revenueStats } from "../../data/revenue";

const maxMonthly = Math.max(...monthlyRevenue.map((m) => m.amount));

export default function AdminRevenuePage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Revenue" subtitle="How the salon is performing this month" />

      <div className="grid sm:grid-cols-3 gap-5">
        <StatCard
          label="Revenue this month"
          value={revenueStats.monthToDate}
          icon={HiOutlineCurrencyRupee}
          delta={revenueStats.monthDelta}
        />
        <StatCard
          label="Average ticket"
          value={revenueStats.avgTicket}
          icon={HiOutlineTicket}
          delta={revenueStats.avgTicketDelta}
        />
        <StatCard
          label="Outstanding"
          value={revenueStats.outstanding}
          icon={HiOutlineExclamationCircle}
          delta={revenueStats.outstandingNote}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
          <h2 className="font-display text-xl text-ink mb-8">Monthly trend</h2>
          <div className="flex items-end gap-4 h-48">
            {monthlyRevenue.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                <span className="text-xs font-mono text-ink/50">
                  ₹{(m.amount / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full rounded-t-lg bg-forest/85"
                  style={{ height: `${(m.amount / maxMonthly) * 100}%` }}
                />
                <span className="text-xs text-ink/60 font-mono">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-forest text-sand-light rounded-2xl p-6 md:p-8 flex flex-col">
          <h2 className="font-display text-xl mb-6">Revenue by category</h2>
          <div className="flex flex-col gap-5">
            {revenueByCategory.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{c.category}</span>
                  <span className="font-mono text-gold-light">{c.amount}</span>
                </div>
                <div className="h-1.5 rounded-full bg-sand-light/15 overflow-hidden">
                  <div
                    className="h-full bg-gold-light rounded-full"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
