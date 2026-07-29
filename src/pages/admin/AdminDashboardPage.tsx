import {
  HiOutlineCalendar,
  HiOutlineCurrencyRupee,
  HiOutlineUserAdd,
  HiOutlineSparkles,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import StatCard from "../../components/admin/StatCard";
import StatusPill from "../../components/admin/StatusPill";
import { bookings } from "../../data/bookings";
import { useAuth } from "../../hooks/useAuth";

const stats = [
  { label: "Today's bookings", value: "18", icon: HiOutlineCalendar, delta: "+3 vs yesterday" },
  { label: "Revenue today", value: "₹34,200", icon: HiOutlineCurrencyRupee, delta: "+12% vs last week" },
  { label: "New clients", value: "6", icon: HiOutlineUserAdd, delta: "+2 vs yesterday" },
  { label: "Chair occupancy", value: "82%", icon: HiOutlineSparkles, delta: "4 rooms active" },
];

const todaysBookings = bookings.filter((b) => b.date === "2026-07-29").slice(0, 5);

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      {user && (
        <p className="text-sm text-ink/60 -mb-2">
          Welcome back, <span className="text-ink font-medium">{user.name}</span>.
        </p>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-ink">Today's bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-forest font-medium ripple-underline">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink/50 border-b border-blush/60 font-mono text-xs uppercase tracking-wide">
                  <th className="pb-3 font-normal">Client</th>
                  <th className="pb-3 font-normal">Service</th>
                  <th className="pb-3 font-normal">Time</th>
                  <th className="pb-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {todaysBookings.map((b) => (
                  <tr key={b.id} className="border-b border-blush/30 last:border-0">
                    <td className="py-3.5 font-medium text-ink">{b.client}</td>
                    <td className="py-3.5 text-ink/70">{b.service}</td>
                    <td className="py-3.5 text-ink/70 font-mono">{b.time}</td>
                    <td className="py-3.5">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-forest text-sand-light rounded-2xl p-6 md:p-8 flex flex-col">
          <h2 className="font-display text-xl mb-6">Popular this week</h2>
          <div className="flex flex-col gap-5">
            {[
              { name: "Signature Facial", pct: 86 },
              { name: "Hot Stone Therapy", pct: 71 },
              { name: "Keratin Smoothing", pct: 54 },
              { name: "Gel Manicure", pct: 40 },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{item.name}</span>
                  <span className="font-mono text-gold-light">{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-sand-light/15 overflow-hidden">
                  <div
                    className="h-full bg-gold-light rounded-full"
                    style={{ width: `${item.pct}%` }}
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
