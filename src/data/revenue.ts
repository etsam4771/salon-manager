// Aggregate reporting numbers. In a real backend these are rollups over
// Invoice/Payment (monthToDate, avgTicket) and InvoiceItem grouped by the
// linked Service's ServiceCategory (revenueByCategory) — kept as static
// mock aggregates here since there's no query layer yet.

export const revenueStats = {
  monthToDate: 486200,
  monthDelta: "+12.4% vs last month",
  avgTicket: 2340,
  avgTicketDelta: "+3.1% vs last month",
  outstanding: 18400,
  outstandingNote: "6 unpaid invoices",
};

export const monthlyRevenue: { month: string; amount: number }[] = [
  { month: "Mar", amount: 342000 },
  { month: "Apr", amount: 368500 },
  { month: "May", amount: 391200 },
  { month: "Jun", amount: 405800 },
  { month: "Jul", amount: 432900 },
  { month: "Aug", amount: 486200 },
];

export const revenueByCategory: { category: string; amount: number; pct: number }[] = [
  { category: "Hair", amount: 186400, pct: 38 },
  { category: "Skin", amount: 121600, pct: 25 },
  { category: "Body", amount: 92400, pct: 19 },
  { category: "Nails", amount: 58300, pct: 12 },
  { category: "Packages", amount: 27500, pct: 6 },
];
