import { HiOutlineHeart, HiOutlineGift } from "react-icons/hi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatCard from "../../components/admin/StatCard";
import { useSalonData } from "../../hooks/useSalonData";
import { loyaltyPointsFor, membershipPlans, progressToNextTier, tierFor } from "../../utils/loyalty";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminLoyaltyPage() {
  const { customers } = useSalonData();

  const totalPoints = customers.reduce((sum, c) => sum + loyaltyPointsFor(c), 0);
  const leaderboard = [...customers].sort((a, b) => loyaltyPointsFor(b) - loyaltyPointsFor(a)).slice(0, 5);
  const topClient = leaderboard[0];
  const progress = topClient ? progressToNextTier(topClient) : null;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Loyalty & Memberships" subtitle="Points, tiers, and membership plans" />

      <div className="grid sm:grid-cols-2 gap-5">
        <StatCard label="Points issued (all-time)" value={totalPoints.toLocaleString("en-IN")} icon={HiOutlineHeart} />
        <StatCard label="Members" value={String(customers.length)} icon={HiOutlineGift} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
          <h2 className="font-display text-xl text-ink mb-5">Top clients by points</h2>
          <div className="flex flex-col gap-3">
            {leaderboard.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-6 text-sm font-mono text-ink/40">#{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-xs shrink-0">
                  {initials(c.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink truncate">{c.fullName}</p>
                  <p className="text-xs text-ink/50">{tierFor(c)} member</p>
                </div>
                <span className="text-sm font-mono text-forest shrink-0">{loyaltyPointsFor(c)} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress example */}
        {topClient && progress && (
          <div className="bg-forest text-sand-light rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl mb-1">{topClient.fullName}'s progress</h2>
            <p className="text-sm text-sand-light/70 mb-5">
              {progress.next
                ? `${progress.remaining.toLocaleString("en-IN")} more to reach ${progress.next}`
                : "Already at the top tier!"}
            </p>
            <div className="h-2.5 rounded-full bg-sand-light/15 overflow-hidden">
              <div className="h-full bg-gold-light rounded-full" style={{ width: `${progress.pct}%` }} />
            </div>
            <p className="text-xs text-sand-light/50 mt-2 font-mono">{progress.pct}% of the way there</p>
          </div>
        )}
      </div>

      {/* Membership plans */}
      <div>
        <h2 className="font-display text-xl text-ink mb-4">Membership plans</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {membershipPlans.map((plan) => (
            <div key={plan.tier} className="bg-sand-light rounded-2xl border border-blush/60 p-6 flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wide text-gold">{plan.tier}</p>
                <p className="font-display text-2xl text-ink mt-1">{plan.price}</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink/70">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
