import type { Customer } from "../types/salon";

export type MembershipTierLabel = "Silver" | "Gold" | "Platinum";

export interface MembershipPlan {
  tier: MembershipTierLabel;
  price: string;
  minSpend: number;
  benefits: string[];
}

export const membershipPlans: MembershipPlan[] = [
  {
    tier: "Silver",
    price: "Free",
    minSpend: 0,
    benefits: ["10 points per visit", "Birthday month discount", "Priority reminders"],
  },
  {
    tier: "Gold",
    price: "₹999 / yr",
    minSpend: 20000,
    benefits: ["15% off every visit", "1 complimentary add-on / quarter", "Skip-the-queue booking"],
  },
  {
    tier: "Platinum",
    price: "₹2,499 / yr",
    minSpend: 50000,
    benefits: ["20% off every visit", "Dedicated stylist", "Free quarterly spa ritual"],
  },
];

// Customer.loyaltyPoints is tracked directly on the schema (via
// LoyaltyTransaction rollups) — this is just a passthrough for callers
// that previously derived it.
export function loyaltyPointsFor(customer: Customer) {
  return customer.loyaltyPoints;
}

export function tierFor(customer: Customer): MembershipTierLabel {
  const spend = customer.totalSpend;
  if (spend >= membershipPlans[2].minSpend) return "Platinum";
  if (spend >= membershipPlans[1].minSpend) return "Gold";
  return "Silver";
}

export function progressToNextTier(customer: Customer) {
  const spend = customer.totalSpend;
  const tier = tierFor(customer);
  if (tier === "Platinum") return { pct: 100, next: null, remaining: 0 };
  const next = tier === "Silver" ? membershipPlans[1] : membershipPlans[2];
  const prevFloor = tier === "Silver" ? 0 : membershipPlans[1].minSpend;
  const pct = Math.min(100, Math.round(((spend - prevFloor) / (next.minSpend - prevFloor)) * 100));
  return { pct, next: next.tier, remaining: Math.max(0, next.minSpend - spend) };
}
