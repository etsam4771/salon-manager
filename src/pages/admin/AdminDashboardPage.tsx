import {
  HiOutlineCalendar,
  HiOutlineCurrencyRupee,
  HiOutlineUserAdd,
  HiOutlineSparkles,
} from "react-icons/hi";

const stats = [
  { label: "Today's bookings", value: "18", icon: HiOutlineCalendar, delta: "+3 vs yesterday" },
  { label: "Revenue today", value: "₹34,200", icon: HiOutlineCurrencyRupee, delta: "+12% vs last week" },
  { label: "New clients", value: "6", icon: HiOutlineUserAdd, delta: "+2 vs yesterday" },
  { label: "Chair occupancy", value: "82%", icon: HiOutlineSparkles, delta: "4 rooms active" },
];

const bookings = [
  { client: "Priya Nair", service: "Signature Facial", time: "10:00 AM", status: "Confirmed" },
  { client: "Rohan Kapoor", service: "Deep Tissue Massage", time: "11:15 AM", status: "In progress" },
  { client: "Meera Sharma", service: "Keratin Smoothing", time: "12:30 PM", status: "Confirmed" },
  { client: "Devika Rao", service: "Gel Manicure", time: "2:00 PM", status: "Pending" },
  { client: "Kabir Sen", service: "Precision Haircut", time: "3:30 PM", status: "Confirmed" },
];

const statusStyles: Record<string, string> = {
  Confirmed: "bg-forest/10 text-forest",
  "In progress": "bg-gold/15 text-gold",
  Pending: "bg-blush-dark/20 text-blush-dark",
};

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, delta }) => (
          <div
            key={label}
            className="bg-sand-light rounded-2xl p-6 border border-blush/60 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/60">{label}</span>
              <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center text-forest">
                <Icon size={16} />
              </div>
            </div>
            <div>
              <p className="font-display text-3xl text-ink">{value}</p>
              <p className="text-xs text-gold font-mono mt-1">{delta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-ink">Today's bookings</h2>
            <button className="text-sm text-forest font-medium ripple-underline">View all</button>
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
                {bookings.map((b) => (
                  <tr key={b.client} className="border-b border-blush/30 last:border-0">
                    <td className="py-3.5 font-medium text-ink">{b.client}</td>
                    <td className="py-3.5 text-ink/70">{b.service}</td>
                    <td className="py-3.5 text-ink/70 font-mono">{b.time}</td>
                    <td className="py-3.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[b.status]}`}>
                        {b.status}
                      </span>
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
